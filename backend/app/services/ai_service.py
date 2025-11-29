"""
AI/ML Service
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.ai_prediction import AIPrediction, BatchJob, PredictionType, BatchJobStatus
from app.models.loan import LoanApplication
from app.core.ml_loader import get_model
from app.core.config import settings
from datetime import datetime
from uuid import UUID
from decimal import Decimal
import json
import numpy as np
import logging

logger = logging.getLogger(__name__)


class AIService:
    """AI/ML prediction service"""
    
    @staticmethod
    async def check_eligibility(
        db: AsyncSession,
        loan_application_id: UUID,
        features: dict = None,
    ) -> dict:
        """Check loan eligibility using AI"""
        # Get loan application
        result = await db.execute(
            select(LoanApplication).where(LoanApplication.id == loan_application_id)
        )
        loan = result.scalar_one_or_none()
        if not loan:
            raise ValueError("Loan application not found")
        
        # Prepare features
        if not features:
            features = {
                "annual_income": float(loan.annual_income or 0),
                "loan_amount": float(loan.loan_amount),
                "existing_loans": float(loan.existing_loans or 0),
                "loan_tenure_years": loan.loan_tenure_years or 5,
                "system_capacity_kw": float(loan.system_capacity_kw or 0),
            }
        
        # Get model
        model = get_model("eligibility")
        
        if model and not settings.USE_MOCKS:
            # Use real model
            feature_array = np.array([[features.get("annual_income", 0), features.get("loan_amount", 0)]])
            prediction = model.predict_proba(feature_array)[0]
            eligibility_score = float(prediction[1] * 100)
            is_eligible = eligibility_score >= 60
        else:
            # Mock prediction
            eligibility_score = 75.0
            is_eligible = True
        
        # Create prediction record
        prediction = AIPrediction(
            loan_application_id=loan_application_id,
            user_id=loan.user_id,
            prediction_type=PredictionType.ELIGIBILITY,
            model_name="eligibility_model",
            input_features=features,
            prediction_result={
                "eligibility_score": eligibility_score,
                "is_eligible": is_eligible,
                "reasons": ["Income sufficient", "Good credit history"] if is_eligible else ["Insufficient income"],
            },
            confidence_score=Decimal(str(eligibility_score)),
        )
        db.add(prediction)
        await db.commit()
        await db.refresh(prediction)
        
        return {
            "eligibility_score": eligibility_score,
            "is_eligible": is_eligible,
            "reasons": prediction.prediction_result.get("reasons", []),
            "confidence": float(eligibility_score),
            "prediction_id": str(prediction.id),
        }
    
    @staticmethod
    async def predict_roi(
        db: AsyncSession,
        loan_application_id: UUID,
        system_capacity_kw: Decimal,
        location: str,
        roof_angle: Decimal = None,
    ) -> dict:
        """Predict ROI for solar system"""
        # Mock ROI prediction
        # In production, use actual ML model with location, capacity, angle, etc.
        predicted_roi = Decimal("18.5")
        npv = Decimal("250000")
        payback_period = Decimal("5.5")
        total_savings = Decimal("500000")
        degradation_rate = Decimal("0.5")
        
        prediction = AIPrediction(
            loan_application_id=loan_application_id,
            user_id=None,  # Will be set from loan
            prediction_type=PredictionType.ROI_PREDICTION,
            model_name="roi_model",
            input_features={
                "system_capacity_kw": float(system_capacity_kw),
                "location": location,
                "roof_angle": float(roof_angle) if roof_angle else None,
            },
            prediction_result={
                "predicted_roi": float(predicted_roi),
                "npv": float(npv),
                "payback_period_years": float(payback_period),
                "total_savings_25_years": float(total_savings),
                "degradation_rate": float(degradation_rate),
            },
            confidence_score=Decimal("85.0"),
        )
        db.add(prediction)
        await db.commit()
        await db.refresh(prediction)
        
        return {
            "predicted_roi": float(predicted_roi),
            "npv": float(npv),
            "payback_period_years": float(payback_period),
            "total_savings_25_years": float(total_savings),
            "degradation_rate": float(degradation_rate),
            "prediction_id": str(prediction.id),
        }
    
    @staticmethod
    async def optimize_angle(
        db: AsyncSession,
        loan_application_id: UUID,
        latitude: Decimal,
        longitude: Decimal,
        roof_area_sqft: Decimal,
    ) -> dict:
        """Optimize solar panel angle"""
        # Mock optimization
        optimal_angle = Decimal("25.0")
        optimal_azimuth = Decimal("180.0")
        efficiency_gain = Decimal("12.5")
        
        prediction = AIPrediction(
            loan_application_id=loan_application_id,
            user_id=None,
            prediction_type=PredictionType.ANGLE_OPTIMIZATION,
            model_name="angle_model",
            input_features={
                "latitude": float(latitude),
                "longitude": float(longitude),
                "roof_area_sqft": float(roof_area_sqft),
            },
            prediction_result={
                "optimal_angle": float(optimal_angle),
                "optimal_azimuth": float(optimal_azimuth),
                "expected_efficiency_gain": float(efficiency_gain),
            },
            confidence_score=Decimal("90.0"),
        )
        db.add(prediction)
        await db.commit()
        await db.refresh(prediction)
        
        return {
            "optimal_angle": float(optimal_angle),
            "optimal_azimuth": float(optimal_azimuth),
            "expected_efficiency_gain": float(efficiency_gain),
            "prediction_id": str(prediction.id),
        }
    
    @staticmethod
    async def prequal(
        db: AsyncSession,
        annual_income: Decimal,
        existing_loans: Decimal,
        credit_score: Decimal,
        loan_amount: Decimal,
        loan_tenure_years: int,
    ) -> dict:
        """Prequalify loan"""
        # Simple prequal logic
        debt_to_income = float(existing_loans / annual_income) if annual_income > 0 else 1.0
        is_prequalified = debt_to_income < 0.4 and float(credit_score) >= 650
        max_loan_amount = annual_income * Decimal("0.3") if is_prequalified else Decimal("0")
        
        return {
            "is_prequalified": is_prequalified,
            "max_loan_amount": float(max_loan_amount),
            "recommended_tenure": loan_tenure_years,
            "confidence": 85.0,
            "reasons": ["Meets income requirements", "Good credit score"] if is_prequalified else ["High debt-to-income ratio"],
        }
    
    @staticmethod
    async def simulate(
        db: AsyncSession,
        loan_application_id: UUID,
        scenarios: list,
    ) -> dict:
        """Simulate different loan scenarios"""
        results = []
        for scenario in scenarios:
            # Mock simulation
            results.append({
                **scenario,
                "predicted_roi": 18.5,
                "emi": 5000,
                "total_cost": 200000,
            })
        
        best_scenario = max(results, key=lambda x: x.get("predicted_roi", 0))
        
        return {
            "scenarios": results,
            "best_scenario": best_scenario,
        }
    
    @staticmethod
    async def explain(
        db: AsyncSession,
        loan_id: UUID,
        prediction_type: str = "eligibility",
    ) -> dict:
        """Get explainability for prediction"""
        # Get prediction
        result = await db.execute(
            select(AIPrediction).where(
                AIPrediction.loan_application_id == loan_id,
                AIPrediction.prediction_type == PredictionType(prediction_type),
            ).order_by(AIPrediction.created_at.desc())
        )
        prediction = result.scalar_one_or_none()
        
        if not prediction:
            raise ValueError("Prediction not found")
        
        # Mock SHAP values
        shap_values = {
            "annual_income": 0.25,
            "loan_amount": -0.15,
            "existing_loans": -0.10,
            "credit_score": 0.20,
        }
        
        feature_importance = {
            "annual_income": "High positive impact",
            "credit_score": "Moderate positive impact",
            "loan_amount": "Negative impact",
            "existing_loans": "Negative impact",
        }
        
        return {
            "shap_values": shap_values,
            "feature_importance": feature_importance,
            "explanation": "Loan eligibility is primarily driven by annual income and credit score.",
        }
    
    @staticmethod
    async def batch_score(
        db: AsyncSession,
        loan_ids: list[UUID],
        prediction_type: str = "eligibility",
    ) -> BatchJob:
        """Batch score multiple loans"""
        job = BatchJob(
            job_type=f"batch_{prediction_type}",
            status=BatchJobStatus.PROCESSING,
            input_data={"loan_ids": [str(loan_id) for loan_id in loan_ids]},
            total_count=len(loan_ids),
            success_count=0,
            failed_count=0,
        )
        db.add(job)
        await db.commit()
        
        # Process in background (in production, use Celery)
        results = []
        failed_items = []
        
        for loan_id in loan_ids:
            try:
                if prediction_type == "eligibility":
                    result = await AIService.check_eligibility(db, loan_id)
                    results.append({"loan_id": str(loan_id), "result": result})
                    job.success_count += 1
                else:
                    raise ValueError(f"Unsupported prediction type: {prediction_type}")
            except Exception as e:
                failed_items.append({"loan_id": str(loan_id), "error": str(e)})
                job.failed_count += 1
        
        job.results = results
        job.failed_items = failed_items if failed_items else None
        job.status = BatchJobStatus.COMPLETED
        job.completed_at = datetime.utcnow()
        await db.commit()
        await db.refresh(job)
        
        return job

