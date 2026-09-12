from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Create the async engine for PostgreSQL
# echo=False in production to avoid logging large amounts of SQL statements
engine = create_async_engine(settings.DATABASE_URL, echo=False, future=True)

# Create a configured "sessionmaker" class specifically for sqlmodel AsyncSession
async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_session() -> AsyncSession:
    """
    FastAPI dependency to provide a database session for requests.
    Yields the session and ensures it closes when the request ends.
    """
    async with async_session_maker() as session:
        yield session
