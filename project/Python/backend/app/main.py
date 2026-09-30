"""
FastAPI Main Application
AI Training Platform Backend
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import get_db, check_database_connection, create_tables, database_info
from app.models import Base
from app.routes import auth, courses, assessments, users, prompts
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Training & Assessment Platform",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.API_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(assessments.router)
app.include_router(users.router)
app.include_router(prompts.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database and create tables on startup"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Database Type: {settings.DB_TYPE}")

    # Check database connection
    if not check_database_connection():
        logger.error("Failed to connect to database")
        raise Exception("Database connection failed")

    # Create tables
    try:
        create_tables(Base)
    except Exception as e:
        logger.error(f"Failed to create tables: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info(f"Shutting down {settings.APP_NAME}")


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    db_connected = check_database_connection()
    return {
        "status": "healthy" if db_connected else "unhealthy",
        "database": "connected" if db_connected else "disconnected",
        "database_type": settings.DB_TYPE
    }


@app.get("/api/v1/database", tags=["System"])
async def get_database_info():
    """Get database information"""
    return database_info()




if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )
