"""
Simple chat memory service - retrieves last 10 turns from chat history.
"""

from sqlalchemy.orm import Session
from app.database.models import ChatHistory, ChatRole

def get_recent_history(user_id: int, db: Session, limit: int = 10) -> list:
    """
    Get the last N turns for a user, ordered chronologically.
    
    Args:
        user_id: The user's ID
        db: Database session
        limit: Number of turns to retrieve (default: 10)
    
    Returns:
        List of messages in chronological order (oldest to newest)
        Each message is a dict with 'role' and 'content'
    """
    # Query the last N messages for this user
    recent_messages = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == user_id)
        .order_by(ChatHistory.created_at.desc())
        .limit(limit)
        .all()
    )
    
    # Reverse to get chronological order (oldest first)
    recent_messages.reverse()
    
    # Format for LLM
    formatted_messages = []
    for msg in recent_messages:
        formatted_messages.append({
            "role": msg.role.value,  # "user" or "assistant"
            "content": msg.content
        })
    
    return formatted_messages

def save_message(user_id: int, role: str, content: str, db: Session, 
                 tool_used: str = None, tokens_used: int = None, 
                 latency_ms: float = None, model_used: str = None):
    """
    Save a single message to chat history.
    
    Args:
        user_id: The user's ID
        role: "user" or "assistant"
        content: The message content
        db: Database session
        tool_used: Which tool was called (if any)
        tokens_used: Number of tokens used
        latency_ms: Response latency in milliseconds
        model_used: Which LLM model was used
    """
    # Convert string role to enum
    chat_role = ChatRole.USER if role == "user" else ChatRole.ASSISTANT
    
    chat_history = ChatHistory(
        user_id=user_id,
        role=chat_role,
        content=content,
        tool_used=tool_used,
        tokens_used=tokens_used,
        latency_ms=latency_ms,
        model_used=model_used
    )
    
    db.add(chat_history)
    db.commit()
    db.refresh(chat_history)
    
    return chat_history

def save_conversation_turn(user_id: int, user_message: str, assistant_message: str, 
                           db: Session, tool_used: str = None, 
                           tokens_used: int = None, latency_ms: float = None,
                           model_used: str = None):
    """
    Save both user and assistant messages for a conversation turn.
    
    Args:
        user_id: The user's ID
        user_message: The user's message
        assistant_message: The assistant's reply
        db: Database session
        tool_used: Which tool was called (if any)
        tokens_used: Number of tokens used
        latency_ms: Response latency in milliseconds
        model_used: Which LLM model was used
    """
    # Save user message
    save_message(
        user_id=user_id,
        role="user",
        content=user_message,
        db=db
    )
    
    # Save assistant message
    save_message(
        user_id=user_id,
        role="assistant",
        content=assistant_message,
        db=db,
        tool_used=tool_used,
        tokens_used=tokens_used,
        latency_ms=latency_ms,
        model_used=model_used
    )

def clear_user_history(user_id: int, db: Session):
    """
    Clear all chat history for a user (admin or reset function).
    """
    db.query(ChatHistory).filter(ChatHistory.user_id == user_id).delete()
    db.commit()