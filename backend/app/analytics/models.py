from sqlalchemy import Column, Integer, String, Float, DateTime, Index
from sqlalchemy.sql import func
from datetime import datetime

from app.database.session import AnalyticsBase

# --- Metric Snapshot Table (Time Series Data) ---
class MetricSnapshot(AnalyticsBase):
    __tablename__ = "metric_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False)  # e.g., 'revenue', 'active_users'
    category = Column(String(100), nullable=True)      # Optional sub-category
    value = Column(Float, nullable=False)
    recorded_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Indexes for time-series queries
    __table_args__ = (
        Index('idx_metric_name_time', 'metric_name', 'recorded_at'),
        Index('idx_metric_recorded', 'recorded_at'),
    )

# --- Region Sales Table (Bar/Stacked Bar Practice) ---
class RegionSales(AnalyticsBase):
    __tablename__ = "region_sales"
    
    id = Column(Integer, primary_key=True, index=True)
    region = Column(String(100), nullable=False)  # e.g., 'North America', 'Europe'
    product_category = Column(String(100), nullable=False)  # e.g., 'Electronics', 'Software'
    revenue = Column(Float, nullable=False)
    units_sold = Column(Integer, nullable=False)
    period = Column(String(50), nullable=False)  # e.g., '2026-Q1', '2026-01'
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes
    __table_args__ = (
        Index('idx_region_sales_period', 'period'),
        Index('idx_region_sales_region', 'region'),
    )

# --- Tool Usage Mock Table (Donut/Pie Practice) ---
class ToolUsageMock(AnalyticsBase):
    __tablename__ = "tool_usage_mock"
    
    id = Column(Integer, primary_key=True, index=True)
    tool_name = Column(String(50), nullable=False)  # e.g., 'calculator', 'weather'
    call_count = Column(Integer, nullable=False)
    avg_latency_ms = Column(Float, nullable=True)
    period = Column(String(50), nullable=False)  # e.g., '2026-01', '2026-01-15'
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes
    __table_args__ = (
        Index('idx_tool_usage_period', 'period'),
        Index('idx_tool_usage_tool', 'tool_name'),
    )