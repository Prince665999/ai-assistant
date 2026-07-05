"""
Mock analytics service for dashboard practice.
Returns chart-ready JSON with fake business metrics.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import Dict, List, Any
import random

from app.analytics.models import MetricSnapshot, RegionSales, ToolUsageMock

class MockAnalyticsService:
    """Service for mock analytics data (practice dashboard)"""
    
    @staticmethod
    def get_revenue_data(db: Session, days: int = 30) -> Dict[str, Any]:
        """
        Get revenue trend data.
        
        Returns:
            {
                "labels": ["2024-01-01", ...],
                "series": [{"name": "Revenue", "data": [100, 120, ...]}]
            }
        """
        today = datetime.now().date()
        start_date = today - timedelta(days=days)
        
        # Get revenue metrics
        revenues = db.query(MetricSnapshot).filter(
            MetricSnapshot.metric_name == "revenue",
            MetricSnapshot.recorded_at >= start_date
        ).order_by(MetricSnapshot.recorded_at).all()
        
        labels = []
        data = []
        
        if revenues:
            # Aggregate by day
            daily_data = {}
            for r in revenues:
                date_key = r.recorded_at.strftime("%Y-%m-%d")
                if date_key not in daily_data:
                    daily_data[date_key] = 0
                daily_data[date_key] += r.value
            
            # Sort by date
            for date in sorted(daily_data.keys()):
                labels.append(date)
                data.append(daily_data[date])
        else:
            # Generate mock data if none exists
            for i in range(days):
                date = today - timedelta(days=days-i-1)
                labels.append(date.strftime("%Y-%m-%d"))
                # Random walk with trend
                base = 1000 + (i * 5) + random.randint(-50, 50)
                data.append(max(0, base))
        
        return {
            "labels": labels,
            "series": [
                {
                    "name": "Revenue",
                    "data": data
                }
            ]
        }
    
    @staticmethod
    def get_active_users_data(db: Session, days: int = 30) -> Dict[str, Any]:
        """
        Get active users trend data.
        
        Returns:
            {
                "labels": ["2024-01-01", ...],
                "series": [{"name": "Active Users", "data": [50, 55, ...]}]
            }
        """
        today = datetime.now().date()
        start_date = today - timedelta(days=days)
        
        users = db.query(MetricSnapshot).filter(
            MetricSnapshot.metric_name == "active_users",
            MetricSnapshot.recorded_at >= start_date
        ).order_by(MetricSnapshot.recorded_at).all()
        
        labels = []
        data = []
        
        if users:
            daily_data = {}
            for u in users:
                date_key = u.recorded_at.strftime("%Y-%m-%d")
                if date_key not in daily_data:
                    daily_data[date_key] = 0
                daily_data[date_key] += u.value
            
            for date in sorted(daily_data.keys()):
                labels.append(date)
                data.append(daily_data[date])
        else:
            # Generate mock data
            for i in range(days):
                date = today - timedelta(days=days-i-1)
                labels.append(date.strftime("%Y-%m-%d"))
                base = 100 + (i * 2) + random.randint(-20, 20)
                data.append(max(0, base))
        
        return {
            "labels": labels,
            "series": [
                {
                    "name": "Active Users",
                    "data": data
                }
            ]
        }
    
    @staticmethod
    def get_region_sales_data(db: Session) -> Dict[str, Any]:
        """
        Get region sales comparison data (for bar charts).
        
        Returns:
            {
                "labels": ["North America", "Europe", ...],
                "series": [
                    {"name": "Revenue", "data": [100, 120, ...]},
                    {"name": "Units Sold", "data": [50, 60, ...]}
                ]
            }
        """
        # Get latest period's data
        latest_period = db.query(RegionSales.period).order_by(
            RegionSales.period.desc()
        ).first()
        
        if latest_period:
            period = latest_period[0]
            sales = db.query(RegionSales).filter(
                RegionSales.period == period
            ).all()
            
            if sales:
                # Group by region
                region_data = {}
                for s in sales:
                    if s.region not in region_data:
                        region_data[s.region] = {"revenue": 0, "units_sold": 0}
                    region_data[s.region]["revenue"] += s.revenue
                    region_data[s.region]["units_sold"] += s.units_sold
                
                labels = list(region_data.keys())
                revenue_data = [region_data[r]["revenue"] for r in labels]
                units_data = [region_data[r]["units_sold"] for r in labels]
                
                return {
                    "labels": labels,
                    "series": [
                        {"name": "Revenue ($)", "data": revenue_data},
                        {"name": "Units Sold", "data": units_data}
                    ]
                }
        
        # Generate mock data
        regions = ["North America", "Europe", "Asia Pacific", "South America", "Africa"]
        return {
            "labels": regions,
            "series": [
                {
                    "name": "Revenue ($)",
                    "data": [random.randint(500, 1500) for _ in regions]
                },
                {
                    "name": "Units Sold",
                    "data": [random.randint(100, 300) for _ in regions]
                }
            ]
        }
    
    @staticmethod
    def get_tool_usage_data(db: Session) -> Dict[str, Any]:
        """
        Get tool usage breakdown (for donut/pie charts).
        
        Returns:
            {
                "labels": ["Calculator", "Weather", ...],
                "data": [45, 30, ...]
            }
        """
        # Get latest period's data
        latest_period = db.query(ToolUsageMock.period).order_by(
            ToolUsageMock.period.desc()
        ).first()
        
        if latest_period:
            period = latest_period[0]
            usage = db.query(ToolUsageMock).filter(
                ToolUsageMock.period == period
            ).all()
            
            if usage:
                return {
                    "labels": [u.tool_name for u in usage],
                    "data": [u.call_count for u in usage]
                }
        
        # Generate mock data
        tools = ["Calculator", "Weather", "News", "RAG Search", "No Tool"]
        return {
            "labels": tools,
            "data": [random.randint(10, 50) for _ in tools]
        }
    
    @staticmethod
    def get_kpi_data(db: Session) -> Dict[str, Any]:
        """
        Get KPI cards data with trends.
        
        Returns:
            {
                "kpis": [
                    {"label": "Revenue", "value": 12345, "change": 5.2, "trend": "up"},
                    ...
                ]
            }
        """
        today = datetime.now().date()
        
        # Try to get real data
        current_revenue = db.query(func.sum(MetricSnapshot.value)).filter(
            MetricSnapshot.metric_name == "revenue",
            func.date(MetricSnapshot.recorded_at) == today
        ).scalar() or 0
        
        # If no data, generate mock
        if current_revenue == 0:
            current_revenue = random.randint(8000, 15000)
        
        return {
            "kpis": [
                {
                    "label": "Total Revenue",
                    "value": current_revenue,
                    "change": round(random.uniform(-10, 15), 1),
                    "trend": "up" if random.random() > 0.4 else "down"
                },
                {
                    "label": "Active Users",
                    "value": random.randint(200, 500),
                    "change": round(random.uniform(-5, 10), 1),
                    "trend": "up" if random.random() > 0.3 else "down"
                },
                {
                    "label": "Orders",
                    "value": random.randint(50, 150),
                    "change": round(random.uniform(-8, 12), 1),
                    "trend": "up" if random.random() > 0.5 else "down"
                },
                {
                    "label": "Churn Rate",
                    "value": round(random.uniform(2, 8), 1),
                    "change": round(random.uniform(-3, 3), 1),
                    "trend": "down" if random.random() > 0.5 else "up"
                }
            ]
        }