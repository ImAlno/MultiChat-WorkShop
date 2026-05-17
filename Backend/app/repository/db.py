from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession
from app.config import settings

# Create async engine for SQLite (using aiosqlite)
engine = create_async_engine(settings.DATABASE_URL, echo=True)

# Create async sessionmaker
async_session_maker = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db_session() -> AsyncSession:
    """FastAPI Dependency to get an async session."""
    async with async_session_maker() as session:
        yield session

async def init_db():
    """Run table creation."""
    from sqlmodel import SQLModel
    # Import models here to make sure they are registered with SQLModel metadata
    from app.repository.models import Message
    
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
