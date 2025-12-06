from fastapi import APIRouter, HTTPException, Response, Depends, Cookie
from ..models import User, UserCreate, UserLogin, Error
from ..db import db

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", response_model=User, status_code=201, responses={400: {"model": Error}})
async def signup(user_create: UserCreate, response: Response):
    try:
        user = db.create_user(user_create)
        # Set session cookie (simplified for mock)
        response.set_cookie(key="session_id", value=user.email)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=User, responses={401: {"model": Error}})
async def login(user_login: UserLogin, response: Response):
    if not db.verify_password(user_login.email, user_login.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = db.get_user_by_email(user_login.email)
    # Set session cookie
    response.set_cookie(key="session_id", value=user.email)
    return user

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("session_id")
    return {"message": "Logout successful"}

@router.get("/me", response_model=User, responses={401: {"model": Error}})
async def get_me(session_id: str | None = Cookie(default=None)):
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = db.get_user_by_email(session_id)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return user
