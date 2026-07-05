"""
News tool using RSS feeds and BeautifulSoup.
"""

import feedparser
from bs4 import BeautifulSoup
import requests
from typing import List, Dict

def get_news(topic: str = "", limit: int = 5) -> str:
    """
    Get latest news headlines.
    
    Args:
        topic: Topic to search for (e.g., "technology", "business")
        limit: Number of headlines to return
    
    Returns:
        News headlines as string
    """
    try:
        # Use Google News RSS
        if topic:
            rss_url = f"https://news.google.com/rss/search?q={topic}&hl=en-US&gl=US&ceid=US:en"
        else:
            rss_url = "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en"
        
        # Fetch and parse RSS
        feed = feedparser.parse(rss_url)
        
        if not feed.entries:
            return f"No news found for topic '{topic}'."
        
        news_items = []
        for entry in feed.entries[:limit]:
            # Clean up the title (remove HTML)
            title = BeautifulSoup(entry.title, 'html.parser').get_text()
            # Get summary
            summary = BeautifulSoup(entry.summary, 'html.parser').get_text() if hasattr(entry, 'summary') else ""
            
            # Extract date if available
            date = entry.published if hasattr(entry, 'published') else ""
            
            news_items.append(f"• {title}\n  {summary[:150]}...\n  📅 {date[:16] if date else 'Recent'}")
        
        if not news_items:
            return f"No news articles found for '{topic}'."
        
        header = f"📰 Latest {'news' if not topic else f'{topic} news'}:\n"
        return header + "\n\n".join(news_items)
        
    except Exception as e:
        return f"Unable to fetch news at the moment: {str(e)}"

# Tool definition for LLM
news_tool = {
    "type": "function",
    "function": {
        "name": "get_news",
        "description": "Get latest news headlines on any topic. Use this when someone asks about current events, news, or what's happening in the world.",
        "parameters": {
            "type": "object",
            "properties": {
                "topic": {
                    "type": "string",
                    "description": "Topic to search for (e.g., 'technology', 'business', 'sports', 'politics', 'health', 'entertainment')"
                }
            },
            "required": []
        }
    }
}