from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship, Mapped, mapped_column, declarative_base
from datetime import datetime, timezone
import enum
import uuid

Base = declarative_base()

class GameMode(str, enum.Enum):
    PASS_THROUGH = "pass-through"
    WALLS = "walls"

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    leaderboard_entries: Mapped[list["LeaderboardEntry"]] = relationship("LeaderboardEntry", back_populates="user")

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    username: Mapped[str] = mapped_column(String) # Denormalized for simpler efficient querying or we can join
    score: Mapped[int] = mapped_column(Integer, index=True)
    mode: Mapped[GameMode] = mapped_column(SAEnum(GameMode), index=True)
    played_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User", back_populates="leaderboard_entries")

class ActivePlayer(Base):
    __tablename__ = "active_players"

    id: Mapped[str] = mapped_column(String, primary_key=True) # Same as user_id usually or separate session id? Using user_id for simplicity as per mock
    username: Mapped[str] = mapped_column(String)
    current_score: Mapped[int] = mapped_column(Integer, default=0)
    mode: Mapped[GameMode] = mapped_column(SAEnum(GameMode))
    started_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
