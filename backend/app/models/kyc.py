"""
KYC Models
"""
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON, Enum, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class KYCType(str, enum.Enum):
    AADHAAR_XML = "aadhaar_xml"
    PAN = "pan"
    BANK = "bank"
    CKYC = "ckyc"


class KYCStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    VERIFIED = "verified"
    REJECTED = "rejected"


class KYCRecord(Base):
    __tablename__ = "kyc_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    loan_application_id = Column(UUID(as_uuid=True), ForeignKey("loan_applications.id"), nullable=True, index=True)
    
    kyc_type = Column(Enum(KYCType), nullable=False)
    status = Column(Enum(KYCStatus), default=KYCStatus.PENDING, nullable=False)
    
    # Encrypted sensitive data
    encrypted_request_data = Column(Text, nullable=True)
    encrypted_response_data = Column(Text, nullable=True)
    
    # Decentro specific
    decentro_operation_id = Column(String(255), nullable=True, index=True)
    decentro_reference_id = Column(String(255), nullable=True)
    
    # Verification results (non-sensitive summary)
    verification_result = Column(JSON, nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_score = Column(String(10), nullable=True)
    
    # Consent
    consent_text = Column(Text, nullable=True)
    consent_timestamp = Column(DateTime(timezone=True), nullable=True)
    consent_ip = Column(String(50), nullable=True)
    
    # Metadata (renamed to avoid SQLAlchemy reserved word)
    meta_data = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", backref="kyc_records")
    loan_application = relationship("LoanApplication", back_populates="kyc_records")
    tasks = relationship("KYCTask", back_populates="kyc_record", cascade="all, delete-orphan")


class KYCTask(Base):
    __tablename__ = "kyc_tasks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kyc_record_id = Column(UUID(as_uuid=True), ForeignKey("kyc_records.id"), nullable=False, index=True)
    
    task_type = Column(String(50), nullable=False)  # e.g., "aadhaar_verification", "pan_verification"
    status = Column(String(50), nullable=False)  # "pending", "completed", "failed"
    operation_id = Column(String(255), nullable=True)
    result = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    kyc_record = relationship("KYCRecord", back_populates="tasks")

