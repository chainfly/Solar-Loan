"""
Loan Tests
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_loan(client: AsyncClient, test_user_data, test_loan_data):
    """Test create loan application"""
    # Register and login
    await client.post("/api/auth/register", json=test_user_data)
    login_response = await client.post(
        "/api/auth/login",
        json={"email": test_user_data["email"], "password": test_user_data["password"]},
    )
    token = login_response.json()["access_token"]
    
    # Create loan
    response = await client.post(
        "/api/loans",
        json=test_loan_data,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["loan_amount"] == test_loan_data["loan_amount"]
    assert "id" in data


@pytest.mark.asyncio
async def test_list_loans(client: AsyncClient, test_user_data, test_loan_data):
    """Test list loan applications"""
    # Register and login
    await client.post("/api/auth/register", json=test_user_data)
    login_response = await client.post(
        "/api/auth/login",
        json={"email": test_user_data["email"], "password": test_user_data["password"]},
    )
    token = login_response.json()["access_token"]
    
    # Create loan
    await client.post(
        "/api/loans",
        json=test_loan_data,
        headers={"Authorization": f"Bearer {token}"},
    )
    
    # List loans
    response = await client.get(
        "/api/loans",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0

