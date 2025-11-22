from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Chatbot settings
    GEMINI_API_KEY: str
    CORS_ORIGINS: str = "http://localhost:3001,http://localhost:3000"
    RATE_LIMIT_PER_MINUTE: int = 20
    MAX_HISTORY_LENGTH: int = 6
    
    # Database settings
    DATABASE_URL: str = "sqlite+aiosqlite:///./cms.db"
    
    # Azure Blob Storage settings
    AZURE_STORAGE_CONNECTION_STRING: str = "your_azure_connection_string_here"
    AZURE_STORAGE_CONTAINER_NAME: str = "devillabs-assets"
    
    # Authentication settings
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD_HASH: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days

    # Gmail SMTP (OAuth2)
    GMAIL_CLIENT_ID: str
    GMAIL_CLIENT_SECRET: str
    GMAIL_REFRESH_TOKEN: str
    GMAIL_USER: str

    # Gmail OAuth2 settings for sending emails
    GMAIL_CLIENT_ID: str = ""
    GMAIL_CLIENT_SECRET: str = ""
    GMAIL_REFRESH_TOKEN: str = ""
    GMAIL_USER: str = ""
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
