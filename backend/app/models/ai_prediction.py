"""
AI Prediction Models
"""
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON, Enum, Numeric, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class PredictionType(str, enum.Enum):
    ELIGIBILITY = "eligibility"
    ROI_PREDICTION = "roi_prediction"
    ANGLE_OPTIMIZATION = "angle_optimization"
    PREQUAL = "prequal"
    SIMULATE = "simulate"


class BatchJobStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AIPrediction(Base):
    __tablename__ = "ai_predictions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    loan_application_id = Column(UUID(as_uuid=True), ForeignKey("loan_applications.id"), nullable=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    prediction_type = Column(Enum(PredictionType), nullable=False)
    model_name = Column(String(100), nullable=True)
    model_version = Column(String(50), nullable=True)
    
    # Input features
    input_features = Column(JSON, nullable=True)
    
    # Prediction results
    prediction_result = Column(JSON, nullable=False)
    confidence_score = Column(Numeric(5, 2), nullable=True)
    
    # Explainability (SHAP values)
    shap_values = Column(Text, nullable=True)  # JSON string
    feature_importance = Column(JSON, nullable=True)
    
    # Metadata (renamed to avoid SQLAlchemy reserved word)
    processing_time_ms = Column(Numeric(10, 2), nullable=True)
    meta_data = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    loan_application = relationship("LoanApplication", back_populates="ai_predictions")
    user = relationship("User", backref="ai_predictions")


class BatchJob(Base):
    __tablename__ = "batch_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    job_type = Column(String(50), nullable=False)  # e.g., "batch_eligibility"
    status = Column(Enum(BatchJobStatus), default=BatchJobStatus.PENDING, nullable=False)
    
    # Input
    input_data = Column(JSON, nullable=True)  # List of loan IDs or features
    
    # Results
    results = Column(JSON, nullable=True)  # List of predictions
    total_count = Column(Integer, nullable=True)
    success_count = Column(Integer, nullable=True)
    failed_count = Column(Integer, nullable=True)
    
    # Error handling
    error_message = Column(Text, nullable=True)
    failed_items = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

