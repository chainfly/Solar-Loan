"""
AI/ML Schemas
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class EligibilityRequest(BaseModel):
    loan_application_id: UUID
    features: Optional[Dict[str, Any]] = None  # Optional override features


class EligibilityResponse(BaseModel):
    loan_application_id: UUID
    eligibility_score: Decimal
    is_eligible: bool
    reasons: List[str]
    confidence: Decimal
    prediction_id: UUID
    created_at: datetime


class ROIPredictionRequest(BaseModel):
    loan_application_id: UUID
    system_capacity_kw: Decimal
    location: str
    roof_angle: Optional[Decimal] = None
    features: Optional[Dict[str, Any]] = None


class ROIPredictionResponse(BaseModel):
    loan_application_id: UUID
    predicted_roi: Decimal
    npv: Decimal
    payback_period_years: Decimal
    total_savings_25_years: Decimal
    degradation_rate: Decimal
    prediction_id: UUID
    created_at: datetime


class AngleOptimizationRequest(BaseModel):
    loan_application_id: UUID
    latitude: Decimal
    longitude: Decimal
    roof_area_sqft: Decimal


class AngleOptimizationResponse(BaseModel):
    loan_application_id: UUID
    optimal_angle: Decimal
    optimal_azimuth: Decimal
    expected_efficiency_gain: Decimal
    prediction_id: UUID
    created_at: datetime


class PrequalRequest(BaseModel):
    annual_income: Decimal
    existing_loans: Decimal
    credit_score: Optional[Decimal] = None
    loan_amount: Decimal
    loan_tenure_years: int


class PrequalResponse(BaseModel):
    is_prequalified: bool
    max_loan_amount: Decimal
    recommended_tenure: int
    confidence: Decimal
    reasons: List[str]
    created_at: datetime


class SimulateRequest(BaseModel):
    loan_application_id: UUID
    scenarios: List[Dict[str, Any]]  # Different parameter combinations


class SimulateResponse(BaseModel):
    loan_application_id: UUID
    scenarios: List[Dict[str, Any]]
    best_scenario: Dict[str, Any]
    created_at: datetime


class ExplainRequest(BaseModel):
    loan_id: UUID
    prediction_type: Optional[str] = "eligibility"


class ExplainResponse(BaseModel):
    loan_id: UUID
    prediction_type: str
    shap_values: Dict[str, Any]
    feature_importance: Dict[str, Any]
    explanation: str
    created_at: datetime


class BatchScoreRequest(BaseModel):
    loan_ids: List[UUID]
    prediction_type: str = "eligibility"


class BatchScoreResponse(BaseModel):
    job_id: UUID
    status: str
    total_count: int
    created_at: datetime


class BatchScoreStatusResponse(BaseModel):
    job_id: UUID
    status: str
    total_count: int
    success_count: int
    failed_count: int
    results: Optional[List[Dict[str, Any]]] = None
    failed_items: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

