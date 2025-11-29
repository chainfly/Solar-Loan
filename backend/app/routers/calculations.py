"""
Calculations Router
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.dependencies import get_current_user
from app.services.calculation_service import CalculationService
from app.models.user import User
from decimal import Decimal
from pydantic import BaseModel

router = APIRouter()


class EMICalculationRequest(BaseModel):
    principal: Decimal
    interest_rate: Decimal
    tenure_years: int


class EMICalculationResponse(BaseModel):
    emi_amount: Decimal
    total_amount: Decimal
    total_interest: Decimal
    principal: Decimal
    interest_rate: Decimal
    tenure_years: int
    tenure_months: int


class SubsidyCalculationRequest(BaseModel):
    system_capacity_kw: Decimal
    state: str
    system_type: str = "residential"


class SubsidyCalculationResponse(BaseModel):
    subsidy_amount: Decimal
    central_subsidy: Decimal
    state_subsidy: Decimal
    system_capacity_kw: Decimal
    state: str
    system_type: str


@router.post("/emi", response_model=EMICalculationResponse)
async def calculate_emi(
    emi_data: EMICalculationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Calculate EMI"""
    try:
        result = await CalculationService.calculate_emi(
            emi_data.principal,
            emi_data.interest_rate,
            emi_data.tenure_years,
        )
        return EMICalculationResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/subsidy", response_model=SubsidyCalculationResponse)
async def calculate_subsidy(
    subsidy_data: SubsidyCalculationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Calculate subsidy"""
    try:
        calc_service = CalculationService()
        result = await calc_service.calculate_subsidy(
            subsidy_data.system_capacity_kw,
            subsidy_data.state,
            subsidy_data.system_type,
        )
        return SubsidyCalculationResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

