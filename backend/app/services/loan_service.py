"""
Loan Service
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.loan import LoanApplication, LoanStatus
from app.schemas.loan import LoanApplicationCreate, LoanApplicationUpdate
from app.services.kyc_service import KYCService
from app.services.credit_service import CreditService
from app.services.ai_service import AIService
from app.services.calculation_service import CalculationService
from datetime import datetime
from uuid import UUID
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class LoanService:
    """Loan application service"""
    
    @staticmethod
    async def create_loan(
        db: AsyncSession,
        user_id: UUID,
        loan_data: LoanApplicationCreate,
    ) -> LoanApplication:
        """Create a new loan application"""
        loan = LoanApplication(
            user_id=user_id,
            **loan_data.model_dump(),
            status=LoanStatus.DRAFT,
        )
        db.add(loan)
        await db.commit()
        await db.refresh(loan)
        return loan
    
    @staticmethod
    async def get_loan(db: AsyncSession, loan_id: UUID, user_id: UUID) -> LoanApplication:
        """Get loan by ID"""
        result = await db.execute(
            select(LoanApplication).where(
                LoanApplication.id == loan_id,
                LoanApplication.user_id == user_id,
            )
        )
        loan = result.scalar_one_or_none()
        if not loan:
            raise ValueError("Loan application not found")
        return loan
    
    @staticmethod
    async def list_loans(db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100):
        """List user's loan applications"""
        result = await db.execute(
            select(LoanApplication)
            .where(LoanApplication.user_id == user_id)
            .order_by(LoanApplication.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    @staticmethod
    async def update_loan(
        db: AsyncSession,
        loan_id: UUID,
        user_id: UUID,
        loan_data: LoanApplicationUpdate,
    ) -> LoanApplication:
        """Update loan application"""
        loan = await LoanService.get_loan(db, loan_id, user_id)
        
        update_data = loan_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(loan, key, value)
        
        await db.commit()
        await db.refresh(loan)
        return loan
    
    @staticmethod
    async def submit_loan(
        db: AsyncSession,
        loan_id: UUID,
        user_id: UUID,
    ) -> LoanApplication:
        """Submit loan application and trigger workflow"""
        loan = await LoanService.get_loan(db, loan_id, user_id)
        
        if loan.status != LoanStatus.DRAFT:
            raise ValueError("Loan application already submitted")
        
        # Update status
        loan.status = LoanStatus.SUBMITTED
        loan.submitted_at = datetime.utcnow()
        loan.current_step = "kyc"
        await db.commit()
        
        # Trigger workflow asynchronously (in production, use Celery)
        try:
            await LoanService._run_workflow(db, loan)
        except Exception as e:
            logger.error(f"Workflow error for loan {loan_id}: {e}")
            loan.status = LoanStatus.REJECTED
            loan.workflow_data = {"error": str(e)}
            await db.commit()
        
        await db.refresh(loan)
        return loan
    
    @staticmethod
    async def _run_workflow(db: AsyncSession, loan: LoanApplication):
        """Run loan processing workflow"""
        workflow_steps = []
        
        try:
            # Step 1: KYC
            loan.status = LoanStatus.KYC_IN_PROGRESS
            loan.current_step = "kyc"
            await db.commit()
            
            kyc_service = KYCService()
            kyc_result = await kyc_service.run_kyc_checks(db, loan.user_id, loan.id)
            workflow_steps.append("kyc_completed")
            
            loan.status = LoanStatus.KYC_COMPLETED
            loan.current_step = "cibil"
            await db.commit()
            
            # Step 2: CIBIL Check
            loan.status = LoanStatus.CIBIL_CHECKING
            await db.commit()
            
            credit_service = CreditService()
            cibil_result = await credit_service.fetch_cibil(db, loan.user_id, loan.id, loan.pan_number)
            workflow_steps.append("cibil_completed")
            
            loan.status = LoanStatus.CIBIL_COMPLETED
            loan.current_step = "ai_eligibility"
            await db.commit()
            
            # Step 3: AI Eligibility
            loan.status = LoanStatus.AI_ELIGIBILITY_CHECKING
            await db.commit()
            
            ai_result = await AIService.check_eligibility(db, loan.id)
            loan.ai_eligibility_score = ai_result.get("eligibility_score")
            loan.ai_eligibility_result = ai_result
            workflow_steps.append("ai_eligibility_completed")
            
            loan.status = LoanStatus.AI_ELIGIBILITY_COMPLETED
            loan.current_step = "subsidy"
            await db.commit()
            
            # Step 4: Subsidy Check
            loan.status = LoanStatus.SUBSIDY_CHECKING
            await db.commit()
            
            calc_service = CalculationService()
            subsidy_result = await calc_service.calculate_subsidy(
                loan.system_capacity_kw,
                loan.state,
            )
            loan.subsidy_amount = subsidy_result.get("subsidy_amount")
            workflow_steps.append("subsidy_completed")
            
            loan.status = LoanStatus.SUBSIDY_COMPLETED
            loan.current_step = "emi"
            await db.commit()
            
            # Step 5: EMI Calculation
            calc_service = CalculationService()
            emi_result = await calc_service.calculate_emi(
                loan.loan_amount,
                loan.interest_rate or Decimal("8.5"),
                loan.loan_tenure_years or 5,
            )
            loan.emi_amount = emi_result.get("emi_amount")
            workflow_steps.append("emi_calculated")
            
            loan.status = LoanStatus.EMI_CALCULATED
            loan.current_step = "review"
            
            # Store workflow data
            loan.workflow_data = {
                "steps": workflow_steps,
                "kyc_result": kyc_result,
                "cibil_result": cibil_result,
                "ai_result": ai_result,
                "subsidy_result": subsidy_result,
                "emi_result": emi_result,
            }
            
            await db.commit()
            
        except Exception as e:
            logger.error(f"Workflow failed for loan {loan.id}: {e}")
            loan.status = LoanStatus.REJECTED
            loan.workflow_data = {
                "error": str(e),
                "completed_steps": workflow_steps,
            }
            await db.commit()
            raise

