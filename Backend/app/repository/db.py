from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession
from app.config import settings
from sqlmodel import SQLModel

# Async database engine with connection pooling configured
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,                   # Log executed SQL queries to stdout
    pool_size=5,                 # Active connections kept open in the pool
    max_overflow=10,             # Extra connections allowed under high load
    pool_recycle=1800            # Recycle connections older than 30 minutes
)

# Async session factory to yield database connections
async_session_maker = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False       # Keep Python objects readable after committing them
)

async def get_db_session() -> AsyncSession:
    """FastAPI dependency yielding a clean database session per request."""
    async with async_session_maker() as session:
        yield session

async def init_db():
    """Initialize Postgres database tables if they do not exist."""
    # Importing models here registers their schemas into SQLModel metadata
    from app.repository.models import Message
    
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
