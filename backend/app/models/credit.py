"""
Credit Check Model
"""
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON, Enum, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class CreditStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    EXPIRED = "expired"


class CreditCheck(Base):
    __tablename__ = "credit_checks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    loan_application_id = Column(UUID(as_uuid=True), ForeignKey("loan_applications.id"), nullable=True, index=True)
    
    status = Column(Enum(CreditStatus), default=CreditStatus.PENDING, nullable=False)
    job_id = Column(String(255), nullable=True, index=True)  # CIBIL job ID
    
    # Encrypted raw report
    encrypted_report = Column(Text, nullable=True)
    
    # Summary data (non-sensitive)
    credit_score = Column(Numeric(5, 2), nullable=True)
    credit_rating = Column(String(10), nullable=True)
    report_summary = Column(JSON, nullable=True)
    
    # Consent
    consent_text = Column(Text, nullable=True)
    consent_timestamp = Column(DateTime(timezone=True), nullable=True)
    consent_ip = Column(String(50), nullable=True)
    
    # Metadata (renamed to avoid SQLAlchemy reserved word)
    meta_data = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)  # 30 days from completion
    
    # Relationships
    user = relationship("User", backref="credit_checks")
    loan_application = relationship("LoanApplication", back_populates="credit_checks")

