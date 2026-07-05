"""
Seed mock data for analytics dashboard practice.
Run with: python -m scripts.seed_mock_data
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session

from app.database.session import AnalyticsSessionLocal
from app.analytics.models import MetricSnapshot, RegionSales, ToolUsageMock

def generate_mock_data():
    """Generate mock data for dashboard practice."""
    db = AnalyticsSessionLocal()
    
    try:
        # Clear existing data
        db.query(MetricSnapshot).delete()
        db.query(RegionSales).delete()
        db.query(ToolUsageMock).delete()
        db.commit()
        print("✅ Cleared existing mock data")
        
        print("📊 Generating mock data...")
        
        # Generate MetricSnapshot data (revenue, active_users)
        today = datetime.now().date()
        for i in range(90):  # 90 days of data
            date = today - timedelta(days=90-i-1)
            
            # Revenue - random walk with upward trend
            base_revenue = 1000 + (i * 10)
            revenue = base_revenue + random.randint(-100, 100)
            revenue = max(500, revenue)
            
            # Active users - random walk
            base_users = 100 + (i * 2)
            users = base_users + random.randint(-20, 20)
            users = max(50, users)
            
            # Orders
            orders = random.randint(20, 80) + int(i * 0.5)
            
            # Churn rate (%)
            churn = random.uniform(2, 8) + random.uniform(-0.5, 0.5)
            churn = max(1, min(10, churn))
            
            # Save revenue
            db.add(MetricSnapshot(
                metric_name="revenue",
                category="financial",
                value=revenue,
                recorded_at=date
            ))
            
            # Save active users
            db.add(MetricSnapshot(
                metric_name="active_users",
                category="engagement",
                value=users,
                recorded_at=date
            ))
            
            # Save orders
            db.add(MetricSnapshot(
                metric_name="orders",
                category="sales",
                value=orders,
                recorded_at=date
            ))
            
            # Save churn rate
            db.add(MetricSnapshot(
                metric_name="churn_rate",
                category="retention",
                value=round(churn, 2),
                recorded_at=date
            ))
        
        print("✅ Generated MetricSnapshot data")
        
        # Generate RegionSales data
        regions = ["North America", "Europe", "Asia Pacific", "South America", "Africa"]
        product_categories = ["Electronics", "Software", "Services", "Hardware"]
        periods = ["2026-Q1", "2026-Q2", "2026-Q3"]
        
        for region in regions:
            for category in product_categories:
                for period in periods:
                    revenue = random.randint(500, 2000)
                    units_sold = random.randint(50, 300)
                    
                    db.add(RegionSales(
                        region=region,
                        product_category=category,
                        revenue=revenue,
                        units_sold=units_sold,
                        period=period
                    ))
        
        print("✅ Generated RegionSales data")
        
        # Generate ToolUsageMock data
        tools = ["calculator", "weather", "news", "search_documents", "no_tool"]
        periods = [f"2026-{str(i).zfill(2)}" for i in range(1, 4)]  # 2026-01 to 2026-03
        
        for tool in tools:
            for period in periods:
                call_count = random.randint(10, 100)
                avg_latency = random.uniform(200, 1500)
                
                db.add(ToolUsageMock(
                    tool_name=tool,
                    call_count=call_count,
                    avg_latency_ms=round(avg_latency, 2),
                    period=period
                ))
        
        print("✅ Generated ToolUsageMock data")
        
        db.commit()
        print("\n✨ Mock data generation complete!")
        print(f"   - MetricSnapshots: {db.query(MetricSnapshot).count()}")
        print(f"   - RegionSales: {db.query(RegionSales).count()}")
        print(f"   - ToolUsageMock: {db.query(ToolUsageMock).count()}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    generate_mock_data()