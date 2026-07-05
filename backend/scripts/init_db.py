"""
Initialize both databases with tables and seed initial data.
Run with: python -m scripts.init_db
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.database.session import app_engine, analytics_engine, AppBase, AnalyticsBase
from app.database import models  # Import models to register them
from app.analytics import models as analytics_models  # Import analytics models
from app.config import settings

def init_app_db():
    """Create all tables in the main app database"""
    print(f"Creating app database tables at: {settings.APP_DB_PATH}")
    AppBase.metadata.create_all(bind=app_engine)
    print("✅ App database tables created")

def init_analytics_db():
    """Create all tables in the analytics mock database"""
    print(f"Creating analytics database tables at: {settings.ANALYTICS_DB_PATH}")
    AnalyticsBase.metadata.create_all(bind=analytics_engine)
    print("✅ Analytics database tables created")

def main():
    print("🚀 Initializing databases...")
    init_app_db()
    init_analytics_db()
    print("✨ Database initialization complete!")

if __name__ == "__main__":
    main()