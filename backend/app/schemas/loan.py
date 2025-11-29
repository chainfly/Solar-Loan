"""
Loan Application Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from decimal import Decimal
from app.models.loan import LoanStatus


class LoanApplicationBase(BaseModel):
    full_name: str
    date_of_birth: Optional[datetime] = None
    pan_number: Optional[str] = None
    aadhaar_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    annual_income: Optional[Decimal] = None
    employment_type: Optional[str] = None
    existing_loans: Optional[Decimal] = None
    system_capacity_kw: Optional[Decimal] = None
    roof_area_sqft: Optional[Decimal] = None
    roof_type: Optional[str] = None
    installation_address: Optional[str] = None
    estimated_cost: Optional[Decimal] = None
    loan_amount: Decimal
    loan_tenure_years: Optional[int] = 5
    interest_rate: Optional[Decimal] = None


class LoanApplicationCreate(LoanApplicationBase):
    pass


class LoanApplicationUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    pan_number: Optional[str] = None
    aadhaar_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    annual_income: Optional[Decimal] = None
    employment_type: Optional[str] = None
    existing_loans: Optional[Decimal] = None
    system_capacity_kw: Optional[Decimal] = None
    roof_area_sqft: Optional[Decimal] = None
    roof_type: Optional[str] = None
    installation_address: Optional[str] = None
    estimated_cost: Optional[Decimal] = None
    loan_amount: Optional[Decimal] = None
    loan_tenure_years: Optional[int] = None
    interest_rate: Optional[Decimal] = None


class LoanApplicationResponse(LoanApplicationBase):
    id: UUID
    user_id: UUID
    status: LoanStatus
    current_step: Optional[str] = None
    workflow_data: Optional[Dict[str, Any]] = None
    ai_eligibility_score: Optional[Decimal] = None
    ai_eligibility_result: Optional[Dict[str, Any]] = None
    roi_prediction: Optional[Dict[str, Any]] = None
    subsidy_amount: Optional[Decimal] = None
    emi_amount: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class LoanSubmitResponse(BaseModel):
    loan_id: UUID
    status: LoanStatus
    message: str
    workflow_steps: list[str]

