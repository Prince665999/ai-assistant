"""
RAG tool for searching uploaded documents with better context formatting.
"""

from app.rag.service import get_rag_service

def search_documents(query: str) -> str:
    """
    Search through uploaded documents and return relevant context.
    
    Args:
        query: Search query
    
    Returns:
        Relevant document excerpts as formatted context
    """
    try:
        rag = get_rag_service()
        results = rag.search(query, top_k=3)
        
        if not results:
            return "I searched the documents but couldn't find any relevant information."
        
        # Format the context for the LLM
        context_parts = []
        for i, result in enumerate(results, 1):
            context_parts.append(f"Document excerpt {i}:\n{result['chunk_text']}")
        
        return "\n\n---\n\n".join(context_parts)
        
    except Exception as e:
        return f"Error searching documents: {str(e)}"

# Tool definition for LLM
rag_tool = {
    "type": "function",
    "function": {
        "name": "search_documents",
        "description": "Search through uploaded company documents to find relevant information. Use this when the user asks about company policies, procedures, product information, or any content that might be in uploaded documents.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query or question about company documents"
                }
            },
            "required": ["query"]
        }
    }
}