"""
Authentication Tests
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register(client: AsyncClient, test_user_data):
    """Test user registration"""
    response = await client.post("/api/auth/register", json=test_user_data)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == test_user_data["email"]
    assert "id" in data


@pytest.mark.asyncio
async def test_register_duplicate(client: AsyncClient, test_user_data):
    """Test duplicate registration"""
    await client.post("/api/auth/register", json=test_user_data)
    response = await client.post("/api/auth/register", json=test_user_data)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login(client: AsyncClient, test_user_data):
    """Test user login"""
    await client.post("/api/auth/register", json=test_user_data)
    
    login_data = {
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    }
    response = await client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_invalid(client: AsyncClient, test_user_data):
    """Test invalid login"""
    await client.post("/api/auth/register", json=test_user_data)
    
    login_data = {
        "email": test_user_data["email"],
        "password": "WrongPassword",
    }
    response = await client.post("/api/auth/login", json=login_data)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, test_user_data):
    """Test get current user"""
    await client.post("/api/auth/register", json=test_user_data)
    
    login_data = {
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    }
    login_response = await client.post("/api/auth/login", json=login_data)
    token = login_response.json()["access_token"]
    
    response = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user_data["email"]

