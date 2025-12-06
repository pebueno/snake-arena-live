from fastapi.testclient import TestClient
from app.models import GameMode

def test_root(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Snake Arena API"}

def test_signup(client: TestClient):
    response = client.post("/auth/signup", json={
        "username": "NewTestUser",
        "email": "newtest@example.com",
        "password": "password123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "NewTestUser"
    assert data["email"] == "newtest@example.com"
    assert "id" in data
    assert "createdAt" in data

def test_signup_duplicate_email(client: TestClient):
    # First signup
    client.post("/auth/signup", json={
        "username": "User1",
        "email": "duplicate@example.com",
        "password": "password"
    })
    # Duplicate signup
    response = client.post("/auth/signup", json={
        "username": "User2",
        "email": "duplicate@example.com",
        "password": "password"
    })
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_success(client: TestClient):
    # Use seeded user
    response = client.post("/auth/login", json={
        "email": "snake@example.com",
        "password": "password"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "snake@example.com"
    assert "session_id" in response.cookies

def test_login_failure(client: TestClient):
    response = client.post("/auth/login", json={
        "email": "snake@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_get_me_authenticated(client: TestClient):
    # Login first to get cookie
    login_response = client.post("/auth/login", json={
        "email": "snake@example.com",
        "password": "password"
    })
    
    response = client.get("/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == "snake@example.com"

def test_get_me_unauthenticated(client: TestClient):
    client.cookies.clear() # Ensure no cookies
    response = client.get("/auth/me")
    assert response.status_code == 401

def test_get_leaderboard(client: TestClient):
    response = client.get("/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    usernames = [entry["username"] for entry in data]
    assert "SnakeMaster" in usernames

def test_submit_score(client: TestClient):
    # Login first
    client.post("/auth/login", json={
        "email": "snake@example.com",
        "password": "password"
    })
    
    response = client.post("/leaderboard", json={
        "score": 3000,
        "mode": GameMode.WALLS
    })
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["rank"], int)

def test_get_active_players(client: TestClient):
    response = client.get("/players")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
