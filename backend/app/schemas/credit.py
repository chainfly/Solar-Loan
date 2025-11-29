"""
Credit Check Schemas
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from decimal import Decimal
from app.models.credit import CreditStatus


class CIBILFetchRequest(BaseModel):
    pan: str
    consent_text: str
    consent_ip: Optional[str] = None


class CIBILStatusResponse(BaseModel):
    job_id: str
    status: CreditStatus
    credit_score: Optional[Decimal] = None
    credit_rating: Optional[str] = None
    report_summary: Optional[Dict[str, Any]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


class CIBILResponse(BaseModel):
    id: UUID
    user_id: UUID
    status: CreditStatus
    job_id: Optional[str] = None
    credit_score: Optional[Decimal] = None
    credit_rating: Optional[str] = None
    report_summary: Optional[Dict[str, Any]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

