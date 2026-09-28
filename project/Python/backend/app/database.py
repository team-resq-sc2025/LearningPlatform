"""
Database Configuration and Session Management
"""

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Create engine based on database type
if settings.DB_TYPE == "sqlite":
    # SQLite with in-memory option for testing
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.DEBUG
    )
else:
    # Other databases (PostgreSQL, MSSQL, Oracle)
    engine = create_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        pool_pre_ping=True  # Test connections before using
    )

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db() -> Session:
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_connection() -> bool:
    """Check if database connection is working"""
    try:
        with engine.connect() as conn:
            logger.info(f"✓ Connected to {settings.DB_TYPE} database")
            return True
    except Exception as e:
        logger.error(f"✗ Database connection failed: {e}")
        return False


def create_tables(base):
    """Create all tables from SQLAlchemy models"""
    try:
        base.metadata.create_all(bind=engine)
        logger.info("✓ Database tables created")
    except Exception as e:
        logger.error(f"✗ Failed to create tables: {e}")
        raise


def database_info() -> dict:
    """Get database information"""
    inspector = inspect(engine)
    return {
        "database_type": settings.DB_TYPE,
        "tables": inspector.get_table_names(),
        "connected": check_database_connection()
    }
