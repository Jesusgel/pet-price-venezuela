import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine

from app.main import app
from app.core.database import get_session

# Use in-memory SQLite database for blazing-fast testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=None # Prevent pool from reusing closed memory connections arbitrarily
)

@pytest_asyncio.fixture(scope="function")
async def db_session():
    """
    Creates a fresh database session for every test and rolls it back.
    Since it's in-memory, we just create the metadata, yield the session,
    and then drop all tables. It guarantees absolute isolation.
    """
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
        
    async_session = AsyncSession(engine)
    try:
        yield async_session
    finally:
        await async_session.close()
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.drop_all)

@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession):
    """
    Provides an AsyncClient equipped to directly hit the FastAPI app endpoints.
    Overrides the main DB dependency with our test DB session.
    """
    def override_get_session():
        yield db_session

    app.dependency_overrides[get_session] = override_get_session
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
        
    # Clear overrides after the test
    app.dependency_overrides.clear()
