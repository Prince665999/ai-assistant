"""
Analytics endpoints for admin dashboards.
Returns chart-ready JSON data.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_app_db, get_analytics_db
from app.auth.dependencies import require_admin
from app.database.models import User
from app.analytics.service import AppAnalyticsService
from app.analytics.mock_service import MockAnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])

# === REAL DATA ENDPOINTS (from app.db) ===

@router.get("/admin/users")
def get_user_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_app_db)
):
    """
    Get user statistics for admin dashboard.
    Returns chart-ready JSON.
    """
    return AppAnalyticsService.get_user_stats(db)

@router.get("/admin/chat")
def get_chat_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_app_db),
    days: int = Query(30, description="Number of days for message trend")
):
    """
    Get chat statistics for admin dashboard.
    Returns chart-ready JSON.
    """
    return AppAnalyticsService.get_chat_stats(db, days)

@router.get("/admin/documents")
def get_document_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_app_db)
):
    """
    Get document statistics for admin dashboard.
    Returns chart-ready JSON.
    """
    return AppAnalyticsService.get_document_stats(db)

@router.get("/admin/tools")
def get_tool_performance(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_app_db)
):
    """
    Get tool performance metrics for admin dashboard.
    Returns chart-ready JSON.
    """
    return AppAnalyticsService.get_tool_performance(db)

# === MOCK DATA ENDPOINTS (from analytics_mock.db) ===

@router.get("/mock/revenue")
def get_revenue_data(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_analytics_db),
    days: int = Query(30, description="Number of days for trend")
):
    """
    Get mock revenue trend data for dashboard practice.
    Returns chart-ready JSON.
    """
    return MockAnalyticsService.get_revenue_data(db, days)

@router.get("/mock/users")
def get_active_users_data(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_analytics_db),
    days: int = Query(30, description="Number of days for trend")
):
    """
    Get mock active users trend data for dashboard practice.
    Returns chart-ready JSON.
    """
    return MockAnalyticsService.get_active_users_data(db, days)

@router.get("/mock/regions")
def get_region_sales_data(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_analytics_db)
):
    """
    Get mock region sales data for bar chart practice.
    Returns chart-ready JSON.
    """
    return MockAnalyticsService.get_region_sales_data(db)

@router.get("/mock/tools")
def get_tool_usage_data(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_analytics_db)
):
    """
    Get mock tool usage data for donut/pie chart practice.
    Returns chart-ready JSON.
    """
    return MockAnalyticsService.get_tool_usage_data(db)

@router.get("/mock/kpis")
def get_kpi_data(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_analytics_db)
):
    """
    Get mock KPI data with trends for dashboard practice.
    Returns chart-ready JSON.
    """
    return MockAnalyticsService.get_kpi_data(db)