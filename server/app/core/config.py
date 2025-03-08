# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour
    SECRET_KEY: str = "your-secret-key-here"  # Replace with a secure key
    ALGORITHM: str = "HS256"

settings = Settings()