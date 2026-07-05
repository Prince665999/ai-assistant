from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.config import settings

# App database engine
app_engine = create_engine(
    settings.APP_DATABASE_URL,
    connect_args={"check_same_thread": False},  # Needed for SQLite
    echo=False  # Set to True for SQL debugging
)

# Analytics database engine
analytics_engine = create_engine(
    settings.ANALYTICS_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

# Session factories
AppSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=app_engine)
AnalyticsSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=analytics_engine)

# Base classes for models
AppBase = declarative_base()
AnalyticsBase = declarative_base()

# Dependency for FastAPI to get app database session
def get_app_db() -> Generator[Session, None, None]:
    db = AppSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency for FastAPI to get analytics database session
def get_analytics_db() -> Generator[Session, None, None]:
    db = AnalyticsSessionLocal()
    try:
        yield db
    finally:
        db.close()

# For backwards compatibility
get_db = get_app_db
engine = app_engine
Base = AppBase