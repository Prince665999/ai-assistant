from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, 
    ForeignKey, Enum, JSON, Index, Boolean
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.database.session import AppBase

# Enums
class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"

class DocumentStatus(str, enum.Enum):
    PROCESSING = "processing"
    DONE = "done"
    FAILED = "failed"

class ChatRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"

# --- Users Table ---
class User(AppBase):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="uploaded_by_user", cascade="all, delete-orphan")

# --- Documents Table ---
class Document(AppBase):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)  # Path to stored file
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.PROCESSING)
    chunk_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)  # Store error if failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    uploaded_by_user = relationship("User", back_populates="documents")
    embeddings = relationship("Embedding", back_populates="document", cascade="all, delete-orphan")

# --- Embeddings Table (Vector Storage) ---
class Embedding(AppBase):
    __tablename__ = "embeddings"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    embedding_json = Column(JSON, nullable=False)  # Store embedding as JSON array
    chunk_index = Column(Integer, nullable=False)  # Order within document
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    document = relationship("Document", back_populates="embeddings")
    
    # Indexes for faster queries
    __table_args__ = (
        Index('idx_embedding_document_id', 'document_id'),
        Index('idx_embedding_document_chunk', 'document_id', 'chunk_index'),
    )

# --- Chat History Table ---
class ChatHistory(AppBase):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(Enum(ChatRole), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    tool_used = Column(String(50), nullable=True)  # Which tool was called (if any)
    tokens_used = Column(Integer, nullable=True)  # For cost tracking
    latency_ms = Column(Float, nullable=True)  # Response time
    model_used = Column(String(50), nullable=True)  # Which LLM was used
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="chat_history")
    
    # Indexes for faster memory retrieval
    __table_args__ = (
        Index('idx_chat_history_user_created', 'user_id', 'created_at'),
        Index('idx_chat_history_user_role', 'user_id', 'role'),
    )