"""
Document processing service for uploading and extracting text.
"""

import os
import shutil
from pathlib import Path
from typing import Optional
import PyPDF2
import docx
from datetime import datetime

from app.database.session import AppSessionLocal
from app.database.models import Document, DocumentStatus
from app.rag.service import get_rag_service

# Upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

class DocumentProcessor:
    """Handles document upload, text extraction, and processing."""
    
    @staticmethod
    def save_file(file_content: bytes, filename: str) -> str:
        """Save uploaded file to disk."""
        # Create unique filename to avoid collisions
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        file_path = UPLOAD_DIR / unique_filename
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        return str(file_path)
    
    @staticmethod
    def extract_text(file_path: str) -> str:
        """Extract text from PDF or DOCX files."""
        file_path = Path(file_path)
        extension = file_path.suffix.lower()
        
        if extension == '.pdf':
            return DocumentProcessor._extract_pdf(file_path)
        elif extension == '.docx':
            return DocumentProcessor._extract_docx(file_path)
        elif extension == '.txt':
            return DocumentProcessor._extract_txt(file_path)
        else:
            raise ValueError(f"Unsupported file type: {extension}")
    
    @staticmethod
    def _extract_pdf(file_path: Path) -> str:
        """Extract text from PDF."""
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    
    @staticmethod
    def _extract_docx(file_path: Path) -> str:
        """Extract text from DOCX."""
        doc = docx.Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    
    @staticmethod
    def _extract_txt(file_path: Path) -> str:
        """Extract text from TXT."""
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    
    @staticmethod
    def process_document(document_id: int):
        """
        Process a document: extract text, chunk, embed, and store.
        This runs as a background job.
        """
        db = AppSessionLocal()
        try:
            # Get document from database
            document = db.query(Document).filter(Document.id == document_id).first()
            if not document:
                print(f"❌ Document {document_id} not found")
                return
            
            print(f"📄 Processing document: {document.filename}")
            
            # Update status to processing
            document.status = DocumentStatus.PROCESSING
            db.commit()
            
            # Extract text
            text = DocumentProcessor.extract_text(document.file_path)
            
            if not text or len(text.strip()) == 0:
                raise ValueError("No text extracted from document")
            
            print(f"✅ Extracted {len(text)} characters")
            
            # Get RAG service
            rag = get_rag_service()
            
            # Chunk text
            chunks = rag.chunk_text(text)
            
            if not chunks:
                raise ValueError("No chunks created from document")
            
            print(f"✅ Created {len(chunks)} chunks")
            
            # Add to vector database
            chunk_count = rag.add_document(document_id, chunks)
            
            # Update document status
            document.status = DocumentStatus.DONE
            document.chunk_count = chunk_count
            db.commit()
            
            print(f"✅ Document {document_id} processed successfully with {chunk_count} chunks")
            
        except Exception as e:
            print(f"❌ Error processing document {document_id}: {str(e)}")
            # Update status to failed
            document = db.query(Document).filter(Document.id == document_id).first()
            if document:
                document.status = DocumentStatus.FAILED
                document.error_message = str(e)
                db.commit()
        
        finally:
            db.close()