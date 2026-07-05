"""
Tool router that executes the correct tool based on LLM decision.
"""

from app.tools.calculator import calculate
from app.tools.weather import get_weather
from app.tools.news import get_news
from app.tools.rag import search_documents

def execute_tool(tool_name: str, arguments: dict) -> str:
    """
    Execute a tool based on name and arguments.
    
    Args:
        tool_name: Name of the tool to execute
        arguments: Arguments for the tool
    
    Returns:
        Result of the tool execution
    """
    print(f"🔧 Executing tool: {tool_name} with args: {arguments}")
    
    if tool_name == "calculate":
        return calculate(arguments.get("expression", ""))
    elif tool_name == "get_weather":
        return get_weather(arguments.get("city", ""))
    elif tool_name == "get_news":
        return get_news(arguments.get("topic", ""), limit=5)
    elif tool_name == "search_documents":
        return search_documents(arguments.get("query", ""))
    else:
        return f"Unknown tool: {tool_name}"