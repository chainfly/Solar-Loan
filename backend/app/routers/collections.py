"""
Collections Router
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.dependencies import get_current_user
from app.services.decentro_service import DecentroService
from app.models.user import User
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class MandateCreateRequest(BaseModel):
    amount: float
    frequency: str  # MONTHLY, WEEKLY, etc.
    start_date: str
    end_date: str
    payer_name: str
    payer_account: str
    payer_ifsc: str

class MandateResponse(BaseModel):
    mandate_id: str
    status: str
    data: dict

@router.post("/mandate/initiate", response_model=MandateResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def initiate_mandate(
    request: Request,
    mandate_data: MandateCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Initiate UPI Autopay Mandate"""
    try:
        decentro_service = DecentroService()
        
        # Call Decentro to create mandate
        result = await decentro_service.create_mandate(
            amount=mandate_data.amount,
            frequency=mandate_data.frequency,
            start_date=mandate_data.start_date,
            end_date=mandate_data.end_date,
            payer_name=mandate_data.payer_name,
            payer_account=mandate_data.payer_account,
            payer_ifsc=mandate_data.payer_ifsc
        )
        
        # In a real app, we would save the mandate details to the database here
        # associated with the user and loan.
        
        return MandateResponse(
            mandate_id=result.get("data", {}).get("mandate_id", "MOCK_MANDATE_ID"),
            status=result.get("status", "PENDING"),
            data=result.get("data", {})
        )
    except Exception as e:
        logger.error(f"Mandate initiation failed: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/mandate/status/{mandate_id}", response_model=MandateResponse)
async def get_mandate_status(
    mandate_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get Mandate Status"""
    try:
        decentro_service = DecentroService()
        result = await decentro_service.get_mandate_status(mandate_id)
        
        return MandateResponse(
            mandate_id=mandate_id,
            status=result.get("status", "UNKNOWN"),
            data=result.get("data", {})
        )
    except Exception as e:
        logger.error(f"Get mandate status failed: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
