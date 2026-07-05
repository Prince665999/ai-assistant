"""
LLM client using Groq API.
"""

import os
from typing import List, Dict, Any
from groq import Groq

from app.config import settings

class GroqLLMClient:
    def __init__(self):
        """Initialize Groq client."""
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.1-8b-instant"  # Free tier model
    
    def chat_completion(self, messages: List[Dict[str, str]], tools: List[Dict] = None, tool_choice: str = "auto") -> Dict[str, Any]:
        """
        Send chat completion request to Groq.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            tools: List of tool definitions (optional)
            tool_choice: "auto" or "required"
        
        Returns:
            Response from Groq
        """
        try:
            if tools:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    tools=tools,
                    tool_choice=tool_choice,
                    temperature=0.7,
                    max_tokens=1024
                )
            else:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1024
                )
            
            return {
                "content": response.choices[0].message.content,
                "tool_calls": response.choices[0].message.tool_calls if hasattr(response.choices[0].message, 'tool_calls') else None,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }
        except Exception as e:
            print(f"❌ Groq API error: {str(e)}")
            return {
                "content": f"I'm sorry, I encountered an error: {str(e)}",
                "tool_calls": None,
                "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            }

# Singleton instance
_llm_client = None

def get_llm_client() -> GroqLLMClient:
    """Get or create the singleton LLM client."""
    global _llm_client
    if _llm_client is None:
        _llm_client = GroqLLMClient()
    return _llm_client