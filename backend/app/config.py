import os
from pathlib import Path
from dotenv import load_dotenv
from typing import List

# Load environment variables
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings:
    # Database paths
    APP_DB_PATH = os.getenv("APP_DB_PATH", str(BASE_DIR / "data" / "app.db"))
    ANALYTICS_DB_PATH = os.getenv("ANALYTICS_DB_PATH", str(BASE_DIR / "data" / "analytics_mock.db"))
    
    # App database URL
    APP_DATABASE_URL = f"sqlite:///{APP_DB_PATH}"
    ANALYTICS_DATABASE_URL = f"sqlite:///{ANALYTICS_DB_PATH}"
    
    # JWT Settings
    SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", 60))
    RATE_LIMIT_PERIOD = int(os.getenv("RATE_LIMIT_PERIOD", 60))  # seconds
    RATE_LIMIT_LOGIN = os.getenv("RATE_LIMIT_LOGIN", "5/minute")
    RATE_LIMIT_REGISTER = os.getenv("RATE_LIMIT_REGISTER", "3/hour")
    
    # CORS
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8081")
    CORS_ORIGINS: List[str] = [origin.strip() for origin in ALLOWED_ORIGINS.split(",")]
    
    # LLM Settings
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq")
    
    # API Keys
    OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
    
    # Email Settings (Gmail SMTP)
    EMAIL_ENABLED = os.getenv("EMAIL_ENABLED", "true").lower() == "true"
    EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
    EMAIL_USERNAME = os.getenv("EMAIL_USERNAME", "")  # Your Gmail address
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")  # Your app password
    EMAIL_FROM = os.getenv("EMAIL_FROM", "")  # Same as EMAIL_USERNAME usually
    EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "true").lower() == "true"
    
    # Background job settings
    EMAIL_QUEUE_ENABLED = os.getenv("EMAIL_QUEUE_ENABLED", "true").lower() == "true"

settings = Settings()