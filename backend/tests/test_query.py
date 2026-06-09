import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_query_no_auth():
    # Should fail as it requires Authorization header
    response = client.post("/api/query", json={"question": "What is AI?"})
    assert response.status_code == 403 # HTTPBearer returns 403 if missing header by default in some config, or 401
