import pytest
from app.models import GameMode

def test_full_user_flow(client):
    # 1. Signup a new user
    username = "IntegrationUser"
    email = "integration@example.com"
    password = "securepassword"
    
    response = client.post("/auth/signup", json={
        "username": username,
        "email": email,
        "password": password
    })
    assert response.status_code == 201
    user_data = response.json()
    assert user_data["username"] == username
    assert "session_id" in response.cookies
    user_id = user_data["id"]

    # 2. Login (just to be sure, although signup logs in)
    client.cookies.clear() # Clear cookies to simulate clean state
    response = client.post("/auth/login", json={
        "email": email,
        "password": password
    })
    assert response.status_code == 200
    assert "session_id" in response.cookies

    # 3. Check 'Me' endpoint
    response = client.get("/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == email

    # 4. Submit a score
    score = 1500
    mode = GameMode.WALLS
    response = client.post("/leaderboard", json={
        "score": score,
        "mode": mode
    })
    assert response.status_code == 201
    assert response.json()["success"] is True
    rank = response.json()["rank"]
    assert rank == 1 # First score in empty DB (except if we seeded? No, this uses fresh memory DB)

    # 5. Check Leaderboard
    response = client.get("/leaderboard")
    assert response.status_code == 200
    leaderboard = response.json()
    assert len(leaderboard) == 1
    assert leaderboard[0]["username"] == username
    assert leaderboard[0]["score"] == score
    
    # 6. Another user signup and score to verify ranking
    client.cookies.clear()
    client.post("/auth/signup", json={
        "username": "User2",
        "email": "user2@example.com",
        "password": "password"
    })
    
    # User 2 submits higher score
    response = client.post("/leaderboard", json={
        "score": 2000,
        "mode": mode
    })
    assert response.json()["rank"] == 1
    
    # User 1 should now be rank 2?
    # Let's check leaderboard again
    response = client.get("/leaderboard")
    leaderboard = response.json()
    assert len(leaderboard) == 2
    assert leaderboard[0]["username"] == "User2" # Higher score first
    assert leaderboard[1]["username"] == username
