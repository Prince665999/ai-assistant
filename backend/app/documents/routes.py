"""
Document upload and management endpoints.
"""

import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.database.session import get_db
from app.database.models import Document, DocumentStatus, User
from app.auth.dependencies import get_current_user, require_admin
from app.documents.service import DocumentProcessor
from app.rag.service import get_rag_service

router = APIRouter(prefix="/documents", tags=["documents"])

# Schemas
class DocumentResponse(BaseModel):
    id: int
    filename: str
    status: str
    chunk_count: int
    error_message: str | None
    created_at: datetime
    
    class Config:
        from_attributes = True

class DocumentUploadResponse(BaseModel):
    id: int
    filename: str
    status: str
    message: str

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a document for RAG processing.
    The document will be processed in the background.
    """
    # Validate file type
    allowed_extensions = ['.pdf', '.docx', '.txt']
    file_extension = f".{file.filename.split('.')[-1].lower()}"
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Check file size (10MB limit)
    file_content = await file.read()
    if len(file_content) > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB"
        )
    
    try:
        # Save file to disk
        file_path = DocumentProcessor.save_file(file_content, file.filename)
        
        # Create database record
        document = Document(
            filename=file.filename,
            file_path=file_path,
            uploaded_by=current_user.id,
            status=DocumentStatus.PROCESSING,
            chunk_count=0
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        
        # Start background processing (we'll use a simple approach for now)
        # In a real app, you'd use Celery or APScheduler
        import threading
        from app.documents.service import DocumentProcessor as DocProcessor
        
        thread = threading.Thread(
            target=DocProcessor.process_document,
            args=(document.id,)
        )
        thread.start()
        
        return DocumentUploadResponse(
            id=document.id,
            filename=document.filename,
            status=document.status.value,
            message="Document uploaded and processing started"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error uploading document: {str(e)}"
        )

@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List all documents (admin only)."""
    documents = db.query(Document).order_by(Document.created_at.desc()).all()
    return documents

@router.get("/my", response_model=List[DocumentResponse])
def list_my_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List current user's documents."""
    documents = db.query(Document).filter(
        Document.uploaded_by == current_user.id
    ).order_by(Document.created_at.desc()).all()
    return documents

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get document details."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check access (user can view their own docs, admin can view all)
    if current_user.role != "admin" and document.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return document

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a document and its embeddings (admin only)."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete from vector database
    rag = get_rag_service()
    rag.delete_document(document_id)
    
    # Delete file from disk
    import os
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    # Delete from database
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}