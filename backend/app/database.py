from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker
import os
from contextlib import asynccontextmanager

# Default to sqlite for local dev if no url provided
# Note: For SQLite with asyncio, use "sqlite+aiosqlite:///"
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./snake_arena.db")

# Detect if using Postgres or SQLite to adjust arguments if needed
connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_async_engine(
    DATABASE_URL,
    echo=True, # Set to False in production
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    # Helper to init models if not using Alembic (useful for simple local dev/testing)
    from .models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
