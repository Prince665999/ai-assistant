"""
Step 20: Mock data generator.

Seeds analytics_mock.db with a few months of history that looks like real
business data - a random walk with mild weekly seasonality, not a flat line.
Also exposes a single "tick" function that appends one new data point,
meant to be called on a schedule (see jobs/scheduler.py) so the dashboard
keeps changing while you work on it.

Kept intentionally simple: plain random.gauss + a sine wave for seasonality.
No numpy needed.
"""

import math
import random
from datetime import datetime, timedelta

from app.database.session import SessionLocal
from app.database.models import MetricSnapshot, RegionSales, ToolUsageMock

METRICS = ["revenue", "active_users", "orders", "churn_rate"]
REGIONS = ["North America", "Europe", "Asia Pacific", "Latin America"]
PRODUCT_CATEGORIES = ["Electronics", "Software", "Services", "Hardware"]
TOOLS = ["calculator", "weather", "news", "search_documents", "no_tool"]

# Rough starting points and daily volatility per metric, so revenue doesn't
# wander the same range as churn_rate.
METRIC_BASELINES = {
    "revenue": {"start": 8000.0, "daily_step": 150.0, "seasonal_amp": 800.0},
    "active_users": {"start": 500.0, "daily_step": 8.0, "seasonal_amp": 40.0},
    "orders": {"start": 120.0, "daily_step": 4.0, "seasonal_amp": 15.0},
    "churn_rate": {"start": 3.5, "daily_step": 0.05, "seasonal_amp": 0.3},
}


def _seasonal_component(day_index: int, amplitude: float) -> float:
    """Mild weekly wave, e.g. weekends dip for B2B-style revenue."""
    return amplitude * math.sin(2 * math.pi * day_index / 7)


def _next_value(previous: float, daily_step: float, day_index: int, amplitude: float, floor: float = 0.0) -> float:
    walk = random.gauss(0, daily_step)
    seasonal = _seasonal_component(day_index, amplitude)
    value = previous + walk + seasonal * 0.1  # seasonal nudges the walk, doesn't dominate it
    return max(floor, round(value, 2))


def seed_history(days_back: int = 90):
    """Backfill analytics_mock.db with `days_back` days of history for every table."""
    db = SessionLocal()
    try:
        start_date = datetime.utcnow() - timedelta(days=days_back)

        # --- MetricSnapshot: one row per metric per day ---
        running_values = {name: cfg["start"] for name, cfg in METRIC_BASELINES.items()}
        for day_index in range(days_back):
            recorded_at = start_date + timedelta(days=day_index)
            for metric_name, cfg in METRIC_BASELINES.items():
                running_values[metric_name] = _next_value(
                    running_values[metric_name],
                    cfg["daily_step"],
                    day_index,
                    cfg["seasonal_amp"],
                    floor=0.0,
                )
                db.add(
                    MetricSnapshot(
                        metric_name=metric_name,
                        category=None,
                        value=running_values[metric_name],
                        recorded_at=recorded_at,
                    )
                )

        # --- RegionSales: one row per region/category per month ---
        months_back = max(1, days_back // 30)
        for month_offset in range(months_back):
            period_date = start_date + timedelta(days=month_offset * 30)
            period_label = f"{period_date.year}-Q{((period_date.month - 1) // 3) + 1}"
            for region in REGIONS:
                for category in PRODUCT_CATEGORIES:
                    base_revenue = random.uniform(20000, 90000)
                    db.add(
                        RegionSales(
                            region=region,
                            product_category=category,
                            revenue=round(base_revenue, 2),
                            units_sold=int(base_revenue / random.uniform(20, 60)),
                            period=period_label,
                            recorded_at=period_date,
                        )
                    )

        # --- ToolUsageMock: one row per tool per month ---
        for month_offset in range(months_back):
            period_date = start_date + timedelta(days=month_offset * 30)
            period_label = period_date.strftime("%Y-%m")
            for tool in TOOLS:
                db.add(
                    ToolUsageMock(
                        tool_name=tool,
                        call_count=random.randint(20, 400),
                        avg_latency_ms=round(random.uniform(80, 900), 1),
                        period=period_label,
                        recorded_at=period_date,
                    )
                )

        db.commit()
        print(f"Seeded {days_back} days of mock analytics history.")
    finally:
        db.close()


def tick():
    """
    Append exactly one new data point per metric, using the latest stored
    value as the starting point for the next random-walk step. Call this
    periodically from a scheduler so the dashboard visibly changes over time.
    """
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        day_index = now.timetuple().tm_yday

        for metric_name, cfg in METRIC_BASELINES.items():
            latest = (
                db.query(MetricSnapshot)
                .filter(MetricSnapshot.metric_name == metric_name)
                .order_by(MetricSnapshot.recorded_at.desc())
                .first()
            )
            previous_value = latest.value if latest else cfg["start"]
            new_value = _next_value(previous_value, cfg["daily_step"], day_index, cfg["seasonal_amp"])
            db.add(
                MetricSnapshot(
                    metric_name=metric_name,
                    category=None,
                    value=new_value,
                    recorded_at=now,
                )
            )

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    # Run directly once to backfill: python -m jobs.mock_data_generator
    seed_history(days_back=90)
