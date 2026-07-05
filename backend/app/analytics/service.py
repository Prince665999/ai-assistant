"""
Analytics service for real app data and mock data.
Returns chart-ready JSON for frontend dashboards.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from datetime import datetime, timedelta
from typing import Dict, List, Any

from app.database.models import User, Document, ChatHistory, ChatRole

class AppAnalyticsService:
    """Service for real app analytics from app.db"""
    
    @staticmethod
    def get_user_stats(db: Session) -> Dict[str, Any]:
        """
        Get user statistics.
        
        Returns:
            {
                "total_users": int,
                "active_users": int,
                "new_users_today": int,
                "users_by_role": {"admin": int, "user": int}
            }
        """
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        
        # Users registered today
        today = datetime.now().date()
        today_start = datetime.combine(today, datetime.min.time())
        new_users_today = db.query(User).filter(User.created_at >= today_start).count()
        
        # Users by role
        from app.database.models import UserRole
        admin_count = db.query(User).filter(User.role == UserRole.ADMIN).count()
        user_count = db.query(User).filter(User.role == UserRole.USER).count()
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "new_users_today": new_users_today,
            "users_by_role": {
                "admin": admin_count,
                "user": user_count
            }
        }
    
    @staticmethod
    def get_chat_stats(db: Session, days: int = 30) -> Dict[str, Any]:
        """
        Get chat statistics.
        
        Returns:
            {
                "total_messages": int,
                "total_conversations": int,
                "messages_per_day": [{"date": str, "count": int}],
                "tools_usage": [{"tool": str, "count": int}]
            }
        """
        # Total messages
        total_messages = db.query(ChatHistory).count()
        
        # Total conversations (distinct users with messages)
        total_conversations = db.query(ChatHistory.user_id).distinct().count()
        
        # Messages per day (last N days)
        today = datetime.now().date()
        messages_per_day = []
        for i in range(days - 1, -1, -1):
            date = today - timedelta(days=i)
            date_start = datetime.combine(date, datetime.min.time())
            date_end = datetime.combine(date, datetime.max.time())
            
            count = db.query(ChatHistory).filter(
                ChatHistory.created_at.between(date_start, date_end)
            ).count()
            
            messages_per_day.append({
                "date": date.strftime("%Y-%m-%d"),
                "count": count
            })
        
        # Tools usage
        tools_usage = db.query(
            ChatHistory.tool_used,
            func.count(ChatHistory.id).label('count')
        ).filter(ChatHistory.tool_used.isnot(None)).group_by(ChatHistory.tool_used).all()
        
        tools_usage_data = [
            {"tool": row.tool_used or "Unknown", "count": row.count}
            for row in tools_usage
        ]
        
        # If no tools used, add empty
        if not tools_usage_data:
            tools_usage_data = [{"tool": "No tools used", "count": 0}]
        
        return {
            "total_messages": total_messages,
            "total_conversations": total_conversations,
            "messages_per_day": messages_per_day,
            "tools_usage": tools_usage_data
        }
    
    @staticmethod
    def get_document_stats(db: Session) -> Dict[str, Any]:
        """
        Get document statistics.
        
        Returns:
            {
                "total_documents": int,
                "total_chunks": int,
                "documents_by_status": {"processing": int, "done": int, "failed": int}
            }
        """
        from app.database.models import DocumentStatus
        
        total_documents = db.query(Document).count()
        total_chunks = db.query(func.sum(Document.chunk_count)).scalar() or 0
        
        # Documents by status
        processing = db.query(Document).filter(Document.status == DocumentStatus.PROCESSING).count()
        done = db.query(Document).filter(Document.status == DocumentStatus.DONE).count()
        failed = db.query(Document).filter(Document.status == DocumentStatus.FAILED).count()
        
        return {
            "total_documents": total_documents,
            "total_chunks": total_chunks,
            "documents_by_status": {
                "processing": processing,
                "done": done,
                "failed": failed
            }
        }
    
    @staticmethod
    def get_tool_performance(db: Session) -> Dict[str, Any]:
        """
        Get tool performance metrics.
        
        Returns:
            {
                "tools": [
                    {"tool": str, "avg_latency_ms": float, "total_calls": int, "avg_tokens": int}
                ]
            }
        """
        # Aggregate tool performance
        tool_performance = db.query(
            ChatHistory.tool_used,
            func.count(ChatHistory.id).label('total_calls'),
            func.avg(ChatHistory.latency_ms).label('avg_latency'),
            func.avg(ChatHistory.tokens_used).label('avg_tokens')
        ).filter(
            ChatHistory.tool_used.isnot(None)
        ).group_by(ChatHistory.tool_used).all()
        
        tools = []
        for row in tool_performance:
            tools.append({
                "tool": row.tool_used,
                "total_calls": row.total_calls,
                "avg_latency_ms": float(row.avg_latency) if row.avg_latency else 0,
                "avg_tokens": int(row.avg_tokens) if row.avg_tokens else 0
            })
        
        return {"tools": tools}