from fastapi import APIRouter, HTTPException
from typing import List
from ..models import ActivePlayer, Error
from ..db import db

router = APIRouter(prefix="/players", tags=["Players"])

@router.get("", response_model=List[ActivePlayer])
async def get_active_players():
    return db.get_active_players()

@router.get("/{player_id}", response_model=ActivePlayer, responses={404: {"model": Error}})
async def get_player(player_id: str):
    player = db.get_player_by_id(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player
