"""
AI/ML Router
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.dependencies import get_current_user
from app.services.ai_service import AIService
from app.schemas.ai import (
    EligibilityRequest,
    EligibilityResponse,
    ROIPredictionRequest,
    ROIPredictionResponse,
    AngleOptimizationRequest,
    AngleOptimizationResponse,
    PrequalRequest,
    PrequalResponse,
    SimulateRequest,
    SimulateResponse,
    ExplainRequest,
    ExplainResponse,
    BatchScoreRequest,
    BatchScoreResponse,
    BatchScoreStatusResponse,
)
from app.models.user import User
from uuid import UUID
from decimal import Decimal

router = APIRouter()


@router.post("/eligibility", response_model=EligibilityResponse)
async def check_eligibility(
    eligibility_data: EligibilityRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Check loan eligibility using AI"""
    try:
        result = await AIService.check_eligibility(
            db, eligibility_data.loan_application_id, eligibility_data.features
        )
        return EligibilityResponse(
            loan_application_id=eligibility_data.loan_application_id,
            **result,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/roi-prediction", response_model=ROIPredictionResponse)
async def predict_roi(
    roi_data: ROIPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Predict ROI for solar system"""
    try:
        result = await AIService.predict_roi(
            db,
            roi_data.loan_application_id,
            roi_data.system_capacity_kw,
            roi_data.location,
            roi_data.roof_angle,
        )
        return ROIPredictionResponse(
            loan_application_id=roi_data.loan_application_id,
            **result,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/angle-optimization", response_model=AngleOptimizationResponse)
async def optimize_angle(
    angle_data: AngleOptimizationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Optimize solar panel angle"""
    try:
        result = await AIService.optimize_angle(
            db,
            angle_data.loan_application_id,
            angle_data.latitude,
            angle_data.longitude,
            angle_data.roof_area_sqft,
        )
        return AngleOptimizationResponse(
            loan_application_id=angle_data.loan_application_id,
            **result,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/prequal", response_model=PrequalResponse)
async def prequal(
    prequal_data: PrequalRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Prequalify loan"""
    try:
        result = await AIService.prequal(
            db,
            prequal_data.annual_income,
            prequal_data.existing_loans,
            prequal_data.credit_score or Decimal("700"),
            prequal_data.loan_amount,
            prequal_data.loan_tenure_years,
        )
        return PrequalResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/simulate", response_model=SimulateResponse)
async def simulate(
    simulate_data: SimulateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Simulate different loan scenarios"""
    try:
        result = await AIService.simulate(db, simulate_data.loan_application_id, simulate_data.scenarios)
        return SimulateResponse(
            loan_application_id=simulate_data.loan_application_id,
            **result,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/explain/{loan_id}", response_model=ExplainResponse)
async def explain(
    loan_id: UUID,
    prediction_type: str = "eligibility",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get explainability for prediction"""
    try:
        result = await AIService.explain(db, loan_id, prediction_type)
        return ExplainResponse(
            loan_id=loan_id,
            prediction_type=prediction_type,
            **result,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/batch-score", response_model=BatchScoreResponse)
async def batch_score(
    batch_data: BatchScoreRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Batch score multiple loans"""
    try:
        job = await AIService.batch_score(db, batch_data.loan_ids, batch_data.prediction_type)
        return BatchScoreResponse(
            job_id=job.id,
            status=job.status.value,
            total_count=job.total_count,
            created_at=job.created_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/batch-score/{job_id}/status", response_model=BatchScoreStatusResponse)
async def get_batch_score_status(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get batch score job status"""
    from sqlalchemy import select
    from app.models.ai_prediction import BatchJob
    
    result = await db.execute(select(BatchJob).where(BatchJob.id == job_id))
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    
    return BatchScoreStatusResponse.model_validate(job)

