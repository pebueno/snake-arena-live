from pydantic import BaseModel, EmailStr, Field, ConfigDict
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
    created_at: datetime = Field(serialization_alias="createdAt")

    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class LeaderboardEntry(BaseModel):
    id: str
    user_id: str = Field(serialization_alias="userId")
    username: str
    score: int
    mode: GameMode
    played_at: datetime = Field(serialization_alias="playedAt")

    model_config = ConfigDict(from_attributes=True)

class ScoreSubmit(BaseModel):
    score: int
    mode: GameMode

class ScoreResponse(BaseModel):
    success: bool
    rank: Optional[int] = None

class ActivePlayer(BaseModel):
    id: str
    username: str
    current_score: int = Field(serialization_alias="currentScore")
    mode: GameMode
    started_at: datetime = Field(serialization_alias="startedAt")

    model_config = ConfigDict(from_attributes=True)

class Error(BaseModel):
    message: str
