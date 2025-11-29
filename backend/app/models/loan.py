"""
Loan Application Model
"""
from sqlalchemy import Column, String, Numeric, DateTime, Text, ForeignKey, JSON, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class LoanStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    KYC_IN_PROGRESS = "kyc_in_progress"
    KYC_COMPLETED = "kyc_completed"
    CIBIL_CHECKING = "cibil_checking"
    CIBIL_COMPLETED = "cibil_completed"
    AI_ELIGIBILITY_CHECKING = "ai_eligibility_checking"
    AI_ELIGIBILITY_COMPLETED = "ai_eligibility_completed"
    SUBSIDY_CHECKING = "subsidy_checking"
    SUBSIDY_COMPLETED = "subsidy_completed"
    EMI_CALCULATED = "emi_calculated"
    APPROVED = "approved"
    REJECTED = "rejected"
    DISBURSED = "disbursed"


class LoanApplication(Base):
    __tablename__ = "loan_applications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Personal Information
    full_name = Column(String(255), nullable=False)
    date_of_birth = Column(DateTime(timezone=True), nullable=True)
    pan_number = Column(String(10), nullable=True)
    aadhaar_number = Column(String(12), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    
    # Financial Information
    annual_income = Column(Numeric(15, 2), nullable=True)
    employment_type = Column(String(50), nullable=True)
    existing_loans = Column(Numeric(15, 2), nullable=True)
    
    # Solar Specifications
    system_capacity_kw = Column(Numeric(10, 2), nullable=True)
    roof_area_sqft = Column(Numeric(10, 2), nullable=True)
    roof_type = Column(String(50), nullable=True)
    installation_address = Column(Text, nullable=True)
    estimated_cost = Column(Numeric(15, 2), nullable=True)
    
    # Loan Details
    loan_amount = Column(Numeric(15, 2), nullable=False)
    loan_tenure_years = Column(Integer, nullable=True, default=5)
    interest_rate = Column(Numeric(5, 2), nullable=True)
    
    # Status and Workflow
    status = Column(Enum(LoanStatus), default=LoanStatus.DRAFT, nullable=False)
    current_step = Column(String(50), nullable=True)
    workflow_data = Column(JSON, nullable=True)  # Store intermediate workflow data
    
    # AI Results
    ai_eligibility_score = Column(Numeric(5, 2), nullable=True)
    ai_eligibility_result = Column(JSON, nullable=True)
    roi_prediction = Column(JSON, nullable=True)
    subsidy_amount = Column(Numeric(15, 2), nullable=True)
    emi_amount = Column(Numeric(15, 2), nullable=True)
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", backref="loan_applications")
    documents = relationship("Document", back_populates="loan_application", cascade="all, delete-orphan")
    kyc_records = relationship("KYCRecord", back_populates="loan_application")
    credit_checks = relationship("CreditCheck", back_populates="loan_application")
    ai_predictions = relationship("AIPrediction", back_populates="loan_application")

