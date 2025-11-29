"""
Credit Router
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.dependencies import get_current_user
from app.services.credit_service import CreditService
from app.schemas.credit import CIBILFetchRequest, CIBILStatusResponse, CIBILResponse
from app.models.user import User
from uuid import UUID

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/cibil/fetch", response_model=CIBILResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def fetch_cibil(
    request: Request,
    cibil_data: CIBILFetchRequest,
    loan_application_id: UUID = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch CIBIL credit report"""
    try:
        credit_service = CreditService()
        consent_ip = request.client.host if request.client else cibil_data.consent_ip
        
        credit_check = await credit_service.fetch_cibil(
            db=db,
            user_id=current_user.id,
            loan_id=loan_application_id,
            pan=cibil_data.pan,
            consent_text=cibil_data.consent_text,
            consent_ip=consent_ip,
        )
        return CIBILResponse.model_validate(credit_check)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/cibil/status/{job_id}", response_model=CIBILStatusResponse)
async def get_cibil_status(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get CIBIL check status by job ID"""
    try:
        credit_service = CreditService()
        credit_check = await credit_service.get_cibil_status(db, job_id)
        return CIBILStatusResponse.model_validate(credit_check)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/cibil/{user_id}", response_model=CIBILResponse)
async def get_user_cibil(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get latest CIBIL check for user"""
    if current_user.id != user_id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    try:
        credit_service = CreditService()
        credit_check = await credit_service.get_user_cibil(db, user_id)
        return CIBILResponse.model_validate(credit_check)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

