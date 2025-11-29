"""
KYC Router
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.dependencies import get_current_user
from app.services.kyc_service import KYCService
from app.schemas.kyc import (
    AadhaarXMLRequest,
    PANVerificationRequest,
    BankVerificationRequest,
    CKYCSearchRequest,
    KYCResponse,
    KYCStatusResponse,
)
from app.models.user import User
from uuid import UUID

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/aadhaar-xml", response_model=KYCResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def verify_aadhaar_xml(
    request: Request,
    kyc_data: AadhaarXMLRequest,
    loan_application_id: UUID = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify Aadhaar XML"""
    try:
        kyc_service = KYCService()
        consent_text = "I consent to Aadhaar verification"
        consent_ip = request.client.host if request.client else None
        
        kyc_record = await kyc_service.verify_aadhaar_xml(
            db=db,
            user_id=current_user.id,
            loan_id=loan_application_id,
            xml_content=kyc_data.xml_content,
            share_code=kyc_data.share_code,
            consent_text=consent_text,
            consent_ip=consent_ip,
        )
        return KYCResponse.model_validate(kyc_record)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/pan", response_model=KYCResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def verify_pan(
    request: Request,
    kyc_data: PANVerificationRequest,
    loan_application_id: UUID = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify PAN"""
    try:
        kyc_service = KYCService()
        consent_text = "I consent to PAN verification"
        consent_ip = request.client.host if request.client else None
        
        kyc_record = await kyc_service.verify_pan(
            db=db,
            user_id=current_user.id,
            loan_id=loan_application_id,
            pan=kyc_data.pan,
            name=kyc_data.name,
            consent_text=consent_text,
            consent_ip=consent_ip,
        )
        return KYCResponse.model_validate(kyc_record)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/bank", response_model=KYCResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def verify_bank(
    request: Request,
    kyc_data: BankVerificationRequest,
    loan_application_id: UUID = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify bank account"""
    try:
        kyc_service = KYCService()
        consent_text = "I consent to bank account verification"
        consent_ip = request.client.host if request.client else None
        
        kyc_record = await kyc_service.verify_bank(
            db=db,
            user_id=current_user.id,
            loan_id=loan_application_id,
            account_number=kyc_data.account_number,
            ifsc=kyc_data.ifsc,
            name=kyc_data.name,
            consent_text=consent_text,
            consent_ip=consent_ip,
        )
        return KYCResponse.model_validate(kyc_record)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/ckyc-search", response_model=KYCResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def fetch_ckyc(
    request: Request,
    kyc_data: CKYCSearchRequest,
    loan_application_id: UUID = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch CKYC data"""
    try:
        kyc_service = KYCService()
        consent_text = "I consent to CKYC search"
        consent_ip = request.client.host if request.client else None
        
        kyc_record = await kyc_service.fetch_ckyc(
            db=db,
            user_id=current_user.id,
            loan_id=loan_application_id,
            pan=kyc_data.pan,
            consent_text=consent_text,
            consent_ip=consent_ip,
        )
        return KYCResponse.model_validate(kyc_record)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/status/{user_id}", response_model=KYCStatusResponse)
async def get_kyc_status(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get KYC status for user"""
    if current_user.id != user_id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    try:
        kyc_service = KYCService()
        status_data = await kyc_service.get_kyc_status(db, user_id)
        return KYCStatusResponse(**status_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

