# backend/app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    
    # Add these lines for API authentication 
    GOOGLE_API_KEY: str
    GROQ_API_KEY: str
    
    # Optional: Set a dedicated JWT secret instead of using a fallback 
    JWT_SECRET_KEY: str = "your-very-secure-secret-key" 

    @property
    def get_database_url(self) -> str:
        if self.DATABASE_URL.startswith("postgresql://"):
            return self.DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
        return self.DATABASE_URL

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()