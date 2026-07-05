"""
Chat service with LLM, tool calling, RAG context, and natural responses.
"""

import time
import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.llm.client import get_llm_client
from app.chat.memory_service import get_recent_history, save_conversation_turn
from app.tools.calculator import calculator_tool
from app.tools.weather import weather_tool
from app.tools.news import news_tool
from app.tools.rag import rag_tool
from app.tools.router import execute_tool
from app.email_service.service import send_chat_email, start_email_worker

# All available tools
AVAILABLE_TOOLS = [calculator_tool, weather_tool, news_tool, rag_tool]

# System prompt for the assistant
SYSTEM_PROMPT = """You are a helpful AI assistant for a company. Your role is to help users with their questions and tasks.

CAPABILITIES:
1. Answer general questions directly from your knowledge
2. Perform calculations using the calculate tool
3. Get current weather information using the weather tool
4. Get latest news using the news tool
5. Search company documents using the search_documents tool

INSTRUCTIONS:
1. Always use tools when appropriate - don't try to guess information you don't have
2. When using the search_documents tool, use the retrieved context to answer the user's question naturally
3. When using the weather tool, provide a friendly weather summary
4. When using the calculator tool, explain the calculation clearly
5. For normal conversations (greetings, small talk, general questions), respond naturally without using tools
6. Always be helpful, professional, and friendly

IMPORTANT RULES:
- If the user asks about company information, policies, or products → use search_documents
- If the user asks about math, calculations, numbers → use calculate
- If the user asks about weather → use get_weather
- If the user asks about news, current events → use get_news
- For greetings, general questions, or things you know → respond directly
- Never make up information - if you don't know, say so and offer to search documents

Be conversational and natural in your responses. If you use a tool, explain what you found in a clear, friendly way."""

# Start email worker on module load
start_email_worker()

def call_llm_with_memory(user_id: int, user_message: str, db: Session, user_email: str = None) -> Dict[str, Any]:
    """
    Process a chat message with memory and tool calling.
    
    Args:
        user_id: The user's ID
        user_message: The user's message
        db: Database session
        user_email: User's email address (for sending email)
    
    Returns:
        Dict with response and metadata
    """
    start_time = time.time()
    
    # Get recent history (last 10 turns)
    recent_history = get_recent_history(user_id, db, limit=10)
    
    # Build the full messages array
    messages = []
    
    # Add system prompt
    messages.append({
        "role": "system",
        "content": SYSTEM_PROMPT
    })
    
    # Add recent history
    messages.extend(recent_history)
    
    # Add current message
    messages.append({
        "role": "user",
        "content": user_message
    })
    
    print(f"📝 Messages for LLM ({len(messages)} total, {len(recent_history)} from memory):")
    for msg in messages:
        if msg.get('content'):
            print(f"   {msg['role']}: {msg['content'][:50]}...")
    
    # Get LLM client
    llm = get_llm_client()
    
    # Call LLM with tools
    response = llm.chat_completion(messages, tools=AVAILABLE_TOOLS)
    
    tool_used = None
    final_response = response["content"]
    
    # Check if LLM wants to use a tool
    if response.get("tool_calls"):
        tool_call = response["tool_calls"][0]
        tool_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)  # Convert JSON string to dict
        
        print(f"🔧 Tool called: {tool_name}")
        print(f"📥 Arguments: {arguments}")
        
        # Execute the tool
        tool_result = execute_tool(tool_name, arguments)
        tool_used = tool_name
        
        print(f"📤 Tool result length: {len(tool_result)} characters")
        
        # Add tool result to messages
        messages.append({
            "role": "assistant",
            "content": None,
            "tool_calls": [tool_call]
        })
        messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": tool_result
        })
        
        # For RAG, we want to format the response with context
        if tool_name == "search_documents":
            # Add a follow-up prompt to format the RAG response naturally
            messages.append({
                "role": "user",
                "content": f"""Based on the search results above, please answer the user's question: "{user_message}"

Instructions:
1. Use ONLY the information from the search results
2. If the search results don't contain relevant information, say "I couldn't find any relevant information in the documents."
3. Format your response in a clear, natural, and conversational way
4. Reference the document excerpts to support your answer
5. Be helpful and professional"""
            })
        
        # Get final response from LLM with tool result
        final_response_data = llm.chat_completion(messages)
        final_response = final_response_data["content"]
        
        # Update token usage
        response["usage"]["total_tokens"] += final_response_data["usage"]["total_tokens"]
    
    # Calculate latency
    latency_ms = (time.time() - start_time) * 1000
    
    # Get token usage
    tokens_used = response["usage"].get("total_tokens", 0)
    
    # Save conversation turn
    save_conversation_turn(
        user_id=user_id,
        user_message=user_message,
        assistant_message=final_response,
        db=db,
        tool_used=tool_used,
        tokens_used=tokens_used,
        latency_ms=latency_ms,
        model_used=llm.model
    )
    
    from app.config import settings
    
    # Send email to user (if email is provided and enabled)
    if user_email and settings.EMAIL_ENABLED:
        try:
            send_chat_email(
                to_email=user_email,
                user_message=user_message,
                assistant_response=final_response,
                tool_used=tool_used
            )
            print(f"📧 Email queued for: {user_email}")
        except Exception as e:
            print(f"⚠️ Error sending email: {str(e)}")
    
    return {
        "response": final_response,
        "tool_used": tool_used,
        "tokens_used": tokens_used,
        "latency_ms": latency_ms,
        "memory_count": len(recent_history)
    }