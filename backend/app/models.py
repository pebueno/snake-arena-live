from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class GameMode(str, Enum):
    PASS_THROUGH = "pass-through"
    WALLS = "walls"

class User(BaseModel):
    id: str
    username: str
    email: EmailStr
    createdAt: datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class LeaderboardEntry(BaseModel):
    id: str
    userId: str
    username: str
    score: int
    mode: GameMode
    playedAt: datetime

class ScoreSubmit(BaseModel):
    score: int
    mode: GameMode

class ScoreResponse(BaseModel):
    success: bool
    rank: Optional[int] = None

class ActivePlayer(BaseModel):
    id: str
    username: str
    currentScore: int
    mode: GameMode
    startedAt: datetime

class Error(BaseModel):
    message: str
