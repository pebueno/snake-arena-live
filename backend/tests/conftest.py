import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database import get_db
from app.models import Base, User, GameMode, LeaderboardEntry
from app.schemas import UserCreate
from datetime import datetime, timezone
import uuid

# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest_asyncio.fixture
async def db_session():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with TestingSessionLocal() as session:
        yield session
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def seeded_db(db_session):
    # Seed data required by tests
    user = User(
        id=str(uuid.uuid4()),
        username="SnakeMaster",
        email="snake@example.com",
        password_hash="password", # In real app, hash this
        created_at=datetime.now(timezone.utc)
    )
    db_session.add(user)
    
    # Add some leaderboard entries
    entry = LeaderboardEntry(
        id=str(uuid.uuid4()),
        user_id=user.id,
        username=user.username,
        score=2500,
        mode=GameMode.WALLS,
        played_at=datetime.now(timezone.utc)
    )
    db_session.add(entry)
    
    await db_session.commit()
    return db_session

@pytest.fixture
def client(seeded_db): # Depend on seeded_db to ensure data exists
    # We need to override the get_db dependency to use our validation session
    # specific for this test.
    # Note: Because TestClient is sync and calls the app which calls get_db (async),
    # and we are providing an already open session from an async fixture...
    # We need to adapt.
    
    # Actually, simpler to just use a fresh session generator for the override
    # but pointing to the same engine/pool is tricky with :memory: if not shared.
    # StaticPool handles the sharing.
    
    async def override_get_db():
        # process query
        async with TestingSessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
