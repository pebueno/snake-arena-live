from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, desc, func
from sqlalchemy.exc import IntegrityError
from . import models, schemas
from datetime import datetime
import uuid

# User CRUD
async def create_user(db: AsyncSession, user: schemas.UserCreate) -> models.User:
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=user.password # In real app, hash this!
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def get_user_by_email(db: AsyncSession, email: str) -> models.User | None:
    result = await db.execute(select(models.User).where(models.User.email == email))
    return result.scalars().first()

async def get_user_by_username(db: AsyncSession, username: str) -> models.User | None:
    result = await db.execute(select(models.User).where(models.User.username == username))
    return result.scalars().first()

async def verify_password(db: AsyncSession, email: str, password: str) -> bool:
    user = await get_user_by_email(db, email)
    if not user:
        return False
    return user.password_hash == password

# Active Player CRUD
async def create_active_player(db: AsyncSession, player: schemas.ActivePlayer) -> models.ActivePlayer:
    # Check if exists first to update or insert
    result = await db.execute(select(models.ActivePlayer).where(models.ActivePlayer.id == player.id))
    existing = result.scalars().first()
    
    if existing:
        existing.current_score = player.current_score
        existing.mode = player.mode
        # existing.started_at = player.started_at
        await db.commit()
        await db.refresh(existing)
        return existing
    
    db_player = models.ActivePlayer(
        id=player.id,
        username=player.username,
        current_score=player.current_score,
        mode=player.mode,
        started_at=player.started_at
    )
    db.add(db_player)
    await db.commit()
    return db_player

async def get_active_players(db: AsyncSession) -> list[models.ActivePlayer]:
    result = await db.execute(select(models.ActivePlayer))
    return list(result.scalars().all())

async def get_active_player(db: AsyncSession, player_id: str) -> models.ActivePlayer | None:
    result = await db.execute(select(models.ActivePlayer).where(models.ActivePlayer.id == player_id))
    return result.scalars().first()

async def remove_active_player(db: AsyncSession, player_id: str):
    await db.execute(delete(models.ActivePlayer).where(models.ActivePlayer.id == player_id))
    await db.commit()

# Leaderboard CRUD
async def submit_score(db: AsyncSession, user_id: str, username: str, score: int, mode: schemas.GameMode) -> int:
    # Create entry
    entry = models.LeaderboardEntry(
        user_id=user_id,
        username=username,
        score=score,
        mode=mode
    )
    db.add(entry)
    await db.commit() # Commit to save the score
    
    # Calculate rank
    # Rank = (count of scores > this score) + 1
    # This might be slow for large tables, but okay for now.
    # Alternatively, fetch all and calculate in python like before, but SQL is better.
    
    # We want rank within the specific mode
    query = select(func.count()).select_from(models.LeaderboardEntry).where(
        models.LeaderboardEntry.mode == mode, 
        models.LeaderboardEntry.score > score
    )
    result = await db.execute(query)
    higher_scores_count = result.scalar()
    
    return higher_scores_count + 1

async def get_leaderboard(db: AsyncSession, mode: schemas.GameMode | None = None, limit: int = 10) -> list[models.LeaderboardEntry]:
    query = select(models.LeaderboardEntry).order_by(desc(models.LeaderboardEntry.score)).limit(limit)
    if mode:
        query = query.where(models.LeaderboardEntry.mode == mode)
    
    result = await db.execute(query)
    return list(result.scalars().all())
