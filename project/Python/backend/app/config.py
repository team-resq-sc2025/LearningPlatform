"""
Application Configuration Module
Supports SQLite, PostgreSQL, MSSQL, and Oracle databases
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # App
    APP_NAME: str = "AI Training Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production"

    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_CORS_ORIGINS: list = ["http://localhost:4200", "http://localhost:3000"]

    # Database Type
    DB_TYPE: str = "sqlite"  # sqlite, postgresql, mssql, oracle

    # SQLite (default)
    DB_SQLITE_PATH: str = "./app.db"

    # PostgreSQL
    DB_POSTGRES_HOST: Optional[str] = None
    DB_POSTGRES_PORT: int = 5432
    DB_POSTGRES_USER: Optional[str] = None
    DB_POSTGRES_PASSWORD: Optional[str] = None
    DB_POSTGRES_DB: Optional[str] = None

    # MSSQL
    DB_MSSQL_DRIVER: str = "ODBC Driver 17 for SQL Server"
    DB_MSSQL_SERVER: Optional[str] = None
    DB_MSSQL_PORT: int = 1433
    DB_MSSQL_USER: Optional[str] = None
    DB_MSSQL_PASSWORD: Optional[str] = None
    DB_MSSQL_DB: Optional[str] = None

    # Oracle
    DB_ORACLE_HOST: Optional[str] = None
    DB_ORACLE_PORT: int = 1521
    DB_ORACLE_USER: Optional[str] = None
    DB_ORACLE_PASSWORD: Optional[str] = None
    DB_ORACLE_DB: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def DATABASE_URL(self) -> str:
        """Generate database URL based on DB_TYPE"""

        if self.DB_TYPE == "sqlite":
            return f"sqlite:///{self.DB_SQLITE_PATH}"

        elif self.DB_TYPE == "postgresql":
            return (
                f"postgresql://{self.DB_POSTGRES_USER}:{self.DB_POSTGRES_PASSWORD}"
                f"@{self.DB_POSTGRES_HOST}:{self.DB_POSTGRES_PORT}/{self.DB_POSTGRES_DB}"
            )

        elif self.DB_TYPE == "mssql":
            return (
                f"mssql+pyodbc://{self.DB_MSSQL_USER}:{self.DB_MSSQL_PASSWORD}"
                f"@{self.DB_MSSQL_SERVER}:{self.DB_MSSQL_PORT}/{self.DB_MSSQL_DB}"
                f"?driver={self.DB_MSSQL_DRIVER}"
            )

        elif self.DB_TYPE == "oracle":
            return (
                f"oracle://{self.DB_ORACLE_USER}:{self.DB_ORACLE_PASSWORD}"
                f"@{self.DB_ORACLE_HOST}:{self.DB_ORACLE_PORT}/{self.DB_ORACLE_DB}"
            )

        else:
            raise ValueError(f"Unsupported database type: {self.DB_TYPE}")


# Load settings
settings = Settings()
