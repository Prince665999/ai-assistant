"""
Simple RAG (Retrieval Augmented Generation) service using ChromaDB and Sentence Transformers.
"""

import os
import json
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional
import hashlib

import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import nltk
from nltk.tokenize import sent_tokenize

# Download NLTK data if not already downloaded
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

class RAGService:
    def __init__(self, persist_directory: str = "./data/chroma_db"):
        """
        Initialize RAG service with ChromaDB and Sentence Transformer.
        
        Args:
            persist_directory: Where to store ChromaDB data
        """
        # Initialize embedding model (small, fast, good for learning)
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Initialize ChromaDB client
        self.chroma_client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Create or get collection
        self.collection = self.chroma_client.get_or_create_collection(
            name="documents",
            metadata={"hnsw:space": "cosine"}
        )
        
        print(f"✅ RAG Service initialized with {self.collection.count()} chunks")
    
    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """
        Split text into chunks using NLTK sentence tokenization.
        
        Args:
            text: The text to split
            chunk_size: Maximum characters per chunk
            overlap: Overlap between chunks (helps maintain context)
        
        Returns:
            List of text chunks
        """
        if not text or len(text.strip()) == 0:
            return []
        
        # Split into sentences
        sentences = sent_tokenize(text)
        
        chunks = []
        current_chunk = []
        current_length = 0
        
        for sentence in sentences:
            sentence_length = len(sentence)
            
            # If adding this sentence exceeds chunk size, save current chunk
            if current_length + sentence_length > chunk_size and current_chunk:
                chunks.append(' '.join(current_chunk))
                
                # Keep overlap by keeping last few sentences
                overlap_sentences = []
                overlap_length = 0
                for s in reversed(current_chunk):
                    if overlap_length + len(s) <= overlap:
                        overlap_sentences.insert(0, s)
                        overlap_length += len(s)
                    else:
                        break
                
                current_chunk = overlap_sentences
                current_length = overlap_length
            
            current_chunk.append(sentence)
            current_length += sentence_length
        
        # Add the last chunk
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
    
    def get_embedding(self, text: str) -> List[float]:
        """Get embedding vector for text."""
        return self.embedding_model.encode(text).tolist()
    
    def add_document(self, document_id: int, chunks: List[str]) -> int:
        """
        Add document chunks to ChromaDB.
        
        Args:
            document_id: Database ID of the document
            chunks: List of text chunks
            
        Returns:
            Number of chunks added
        """
        if not chunks:
            return 0
        
        # Generate embeddings for all chunks
        embeddings = [self.get_embedding(chunk) for chunk in chunks]
        
        # Generate unique IDs for each chunk
        ids = [f"doc_{document_id}_{i}" for i in range(len(chunks))]
        
        # Add to ChromaDB
        self.collection.add(
            documents=chunks,
            embeddings=embeddings,
            ids=ids,
            metadatas=[{"document_id": document_id, "chunk_index": i} for i in range(len(chunks))]
        )
        
        return len(chunks)
    
    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Search for relevant document chunks.
        
        Args:
            query: The search query
            top_k: Number of results to return
            
        Returns:
            List of results with document chunks and metadata
        """
        if self.collection.count() == 0:
            return []
        
        # Get query embedding
        query_embedding = self.get_embedding(query)
        
        # Search ChromaDB
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "distances", "metadatas"]
        )
        
        # Format results
        formatted_results = []
        if results['documents']:
            for i, doc in enumerate(results['documents'][0]):
                formatted_results.append({
                    'chunk_text': doc,
                    'distance': results['distances'][0][i],
                    'document_id': results['metadatas'][0][i]['document_id'],
                    'chunk_index': results['metadatas'][0][i]['chunk_index']
                })
        
        return formatted_results
    
    def delete_document(self, document_id: int):
        """
        Delete all chunks for a document.
        
        Args:
            document_id: Database ID of the document
        """
        # Get all IDs for this document
        results = self.collection.get(
            where={"document_id": document_id}
        )
        
        if results['ids']:
            self.collection.delete(ids=results['ids'])
            print(f"✅ Deleted {len(results['ids'])} chunks for document {document_id}")
    
    def get_document_count(self) -> int:
        """Get total number of chunks in the collection."""
        return self.collection.count()

# Singleton instance
_rag_service = None

def get_rag_service() -> RAGService:
    """Get or create the singleton RAG service instance."""
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service