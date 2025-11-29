"""
Audit Log Model
"""
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class AuditAction(str, enum.Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    KYC_VERIFY = "kyc_verify"
    CIBIL_FETCH = "cibil_fetch"
    AI_PREDICT = "ai_predict"
    DOCUMENT_UPLOAD = "document_upload"
    LOAN_SUBMIT = "loan_submit"
    PAYMENT_INITIATE = "payment_initiate"
    WEBHOOK_RECEIVE = "webhook_receive"


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    loan_application_id = Column(UUID(as_uuid=True), ForeignKey("loan_applications.id"), nullable=True, index=True)
    
    action = Column(Enum(AuditAction), nullable=False)
    resource_type = Column(String(50), nullable=True)  # e.g., "loan", "kyc", "document"
    resource_id = Column(String(255), nullable=True)
    
    # Request details
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    request_path = Column(String(500), nullable=True)
    request_method = Column(String(10), nullable=True)
    
    # Changes (masked PII)
    changes = Column(JSON, nullable=True)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    
    # Result
    status = Column(String(20), nullable=True)  # "success", "failure"
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    user = relationship("User", backref="audit_logs")
    loan_application = relationship("LoanApplication", backref="audit_logs")

