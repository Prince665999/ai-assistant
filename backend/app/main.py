"""
App entrypoint.
"""

import sys
from pathlib import Path

# Add the parent directory to sys.path so Python can find the app module
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from app.config import settings
from app.database.session import engine, AppBase
from app.utils.rate_limit import limiter
from app.auth.routes import router as auth_router
from app.documents.routes import router as documents_router
from app.chat.routes import router as chat_router
from app.analytics.routes import router as analytics_router  # ADD THIS
from app.admin.routes import router as admin_setup_router

# Import models so Base knows about them before create_all runs
from app.database import models  # noqa: F401
from app.analytics import models as analytics_models  # ADD THIS

# Create database tables
AppBase.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Company AI Assistant — Backend",
    version="1.0.0",
    description="AI-powered customer support assistant with RAG, memory, and analytics"
)

# --- Rate limiting ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-assistant-lyart.vercel.app",
        "https://ai-assistant-frontend.vercel.app",
        "https://ai-assistant-67o6w4df6-princekaiza.vercel.app",
        "http://localhost:3000",
        "http://localhost:8081",
        "http://192.168.100.149:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(auth_router)          # /auth - Authentication endpoints
app.include_router(documents_router)     # /documents - Document upload and RAG
app.include_router(chat_router)          # /chat - Chat with memory and tools
app.include_router(analytics_router)     # /analytics - Admin and business analytics
app.include_router(admin_setup_router)


@app.get("/health")
def health():
    """Health check endpoint."""
    return {
        "status": "ok", 
        "message": "Company AI Assistant is running",
        "version": "1.0.0"
    }


@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "name": "Company AI Assistant Backend",
        "version": "1.0.0",
        "description": "AI-powered customer support assistant with RAG, memory, and tools",
        "endpoints": {
            "auth": {
                "register": "POST /auth/register",
                "login": "POST /auth/login",
                "refresh": "POST /auth/refresh",
                "logout": "POST /auth/logout",
                "me": "GET /auth/me"
            },
            "documents": {
                "upload": "POST /documents/upload",
                "list": "GET /documents/",
                "my_documents": "GET /documents/my",
                "get_document": "GET /documents/{document_id}",
                "delete": "DELETE /documents/{document_id}"
            },
            "chat": {
                "send_message": "POST /chat/",
                "history": "GET /chat/history",
                "memory": "GET /chat/memory",
                "clear_history": "DELETE /chat/history",
                "export_history": "GET /chat/history/export"
            },
            "analytics": {
                "admin_users": "GET /analytics/admin/users",
                "admin_chat": "GET /analytics/admin/chat",
                "admin_documents": "GET /analytics/admin/documents",
                "admin_tools": "GET /analytics/admin/tools",
                "mock_revenue": "GET /analytics/mock/revenue",
                "mock_users": "GET /analytics/mock/users",
                "mock_regions": "GET /analytics/mock/regions",
                "mock_tools": "GET /analytics/mock/tools",
                "mock_kpis": "GET /analytics/mock/kpis"
            },
            "docs": "/docs",
            "health": "/health"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000
    )