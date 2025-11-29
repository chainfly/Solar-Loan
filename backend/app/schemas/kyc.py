"""
KYC Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from app.models.kyc import KYCType, KYCStatus


class AadhaarXMLRequest(BaseModel):
    xml_content: str = Field(..., description="Base64 encoded Aadhaar XML")
    share_code: str = Field(..., min_length=4, max_length=4)


class PANVerificationRequest(BaseModel):
    pan: str = Field(..., min_length=10, max_length=10)
    name: str


class BankVerificationRequest(BaseModel):
    account_number: str
    ifsc: str = Field(..., min_length=11, max_length=11)
    name: str


class CKYCSearchRequest(BaseModel):
    pan: str = Field(..., min_length=10, max_length=10)


class KYCResponse(BaseModel):
    id: UUID
    kyc_type: KYCType
    status: KYCStatus
    decentro_operation_id: Optional[str] = None
    verification_result: Optional[Dict[str, Any]] = None
    is_verified: bool
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class KYCStatusResponse(BaseModel):
    user_id: UUID
    kyc_records: list[KYCResponse]
    overall_status: str

