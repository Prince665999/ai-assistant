"""
Chat endpoints with memory and tool calling.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.database.models import User, ChatHistory, ChatRole
from app.chat.service import call_llm_with_memory
from app.chat.memory_service import get_recent_history, clear_user_history

router = APIRouter(prefix="/chat", tags=["chat"])

# Schemas
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    tool_used: Optional[str] = None
    memory_count: int
    tokens_used: Optional[int] = None
    latency_ms: Optional[float] = None

class HistoryResponse(BaseModel):
    id: int
    role: str
    content: str
    tool_used: Optional[str] = None
    created_at: str

@router.post("/", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message and get a response with memory and tool calling.
    
    Features:
    - Automatically includes last 10 turns in context
    - LLM decides whether to use tools (calculator, weather, news, RAG)
    - Natural responses with tool results
    - Saves both user and assistant messages to history
    - Sends the conversation to user's email (if configured)
    """
    try:
        # Process with memory and tools
        result = call_llm_with_memory(
            user_id=current_user.id,
            user_message=request.message,
            db=db,
            user_email=current_user.email  # Pass email for sending
        )
        
        return ChatResponse(
            response=result["response"],
            tool_used=result.get("tool_used"),
            memory_count=result.get("memory_count", 0),
            tokens_used=result.get("tokens_used"),
            latency_ms=result.get("latency_ms")
        )
        
    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@router.get("/history")
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50
):
    """
    Get user's chat history (last N messages).
    """
    history = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.created_at.desc())
        .limit(limit)
        .all()
    )
    
    # Reverse to chronological order
    history.reverse()
    
    return [
        {
            "id": msg.id,
            "role": msg.role.value,
            "content": msg.content,
            "tool_used": msg.tool_used,
            "created_at": msg.created_at.isoformat()
        }
        for msg in history
    ]

@router.get("/memory")
def get_memory(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the last 10 turns (the actual memory being used).
    This is useful for debugging and understanding the memory feature.
    """
    memory = get_recent_history(current_user.id, db, limit=10)
    return {
        "user_id": current_user.id,
        "memory_count": len(memory),
        "messages": memory
    }

@router.delete("/history")
def clear_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Clear user's chat history (reset memory).
    """
    clear_user_history(current_user.id, db)
    return {"message": "Chat history cleared"}

@router.get("/history/export")
def export_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export all chat history for the user.
    """
    history = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.created_at)
        .all()
    )
    
    return [
        {
            "role": msg.role.value,
            "content": msg.content,
            "tool_used": msg.tool_used,
            "tokens_used": msg.tokens_used,
            "created_at": msg.created_at.isoformat()
        }
        for msg in history
    ]