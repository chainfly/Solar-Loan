"""
Loan Router
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.dependencies import get_current_user
from app.services.loan_service import LoanService
from app.schemas.loan import (
    LoanApplicationCreate,
    LoanApplicationUpdate,
    LoanApplicationResponse,
    LoanSubmitResponse,
)
from app.models.user import User
from uuid import UUID
from typing import List

router = APIRouter()


@router.post("", response_model=LoanApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_loan(
    loan_data: LoanApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new loan application"""
    try:
        loan = await LoanService.create_loan(db, current_user.id, loan_data)
        return LoanApplicationResponse.model_validate(loan)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=List[LoanApplicationResponse])
async def list_loans(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List user's loan applications"""
    loans = await LoanService.list_loans(db, current_user.id, skip, limit)
    return [LoanApplicationResponse.model_validate(loan) for loan in loans]


@router.get("/{loan_id}", response_model=LoanApplicationResponse)
async def get_loan(
    loan_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get loan application by ID"""
    try:
        loan = await LoanService.get_loan(db, loan_id, current_user.id)
        return LoanApplicationResponse.model_validate(loan)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{loan_id}", response_model=LoanApplicationResponse)
async def update_loan(
    loan_id: UUID,
    loan_data: LoanApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update loan application"""
    try:
        loan = await LoanService.update_loan(db, loan_id, current_user.id, loan_data)
        return LoanApplicationResponse.model_validate(loan)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{loan_id}/submit", response_model=LoanSubmitResponse)
async def submit_loan(
    loan_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit loan application and trigger workflow"""
    try:
        loan = await LoanService.submit_loan(db, loan_id, current_user.id)
        return LoanSubmitResponse(
            loan_id=loan.id,
            status=loan.status,
            message="Loan application submitted successfully",
            workflow_steps=loan.workflow_data.get("steps", []) if loan.workflow_data else [],
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{loan_id}/disburse", status_code=status.HTTP_200_OK)
async def disburse_loan(
    loan_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Initiate loan disbursement"""
    try:
        # In a real app, we would verify:
        # 1. User is authorized (e.g. admin or lender)
        # 2. Loan is in APPROVED status
        # 3. Bank account is verified
        
        loan = await LoanService.get_loan(db, loan_id, current_user.id)
        if not loan:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")
             
        # Mock disbursement logic
        from app.services.decentro_service import DecentroService
        decentro_service = DecentroService()
        
        # We would get these details from the loan/user record
        amount = float(loan.amount) if loan.amount else 50000.0
        
        result = await decentro_service.initiate_payout(
            account_number="1234567890", # Mock
            ifsc="HDFC0001234", # Mock
            amount=amount,
            purpose="Solar Loan Disbursement",
            beneficiary_name="Solar Installer",
            reference_id=str(loan_id)
        )
        
        return {
            "loan_id": str(loan_id),
            "status": "DISBURSED",
            "payout_id": result.get("data", {}).get("transfer_id"),
            "message": "Loan disbursement initiated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

