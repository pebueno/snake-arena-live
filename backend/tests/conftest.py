import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import db

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture(autouse=True)
def reset_db():
    # Reset DB state before each test if needed
    # For now, we'll just rely on the seed data and unique IDs for new creations
    # A better approach would be to clear lists, but we want to keep seed data for some tests
    pass
