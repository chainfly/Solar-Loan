"""
Credit Service
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.credit import CreditCheck, CreditStatus
from app.services.audit_service import AuditService
from app.models.audit import AuditAction
from datetime import datetime, timedelta
from uuid import UUID
import json
import httpx
import asyncio
import logging
from app.core.config import settings
from app.core.security import encrypt_sensitive_data

logger = logging.getLogger(__name__)


class CreditService:
    """Credit bureau service"""
    
    async def fetch_cibil(
        self,
        db: AsyncSession,
        user_id: UUID,
        loan_id: UUID,
        pan: str,
        consent_text: str = None,
        consent_ip: str = None,
    ) -> CreditCheck:
        """Fetch CIBIL credit report"""
        # Check for existing valid report (30 days)
        result = await db.execute(
            select(CreditCheck).where(
                CreditCheck.user_id == user_id,
                CreditCheck.status == CreditStatus.COMPLETED,
                CreditCheck.expires_at > datetime.utcnow(),
            ).order_by(CreditCheck.created_at.desc())
        )
        existing = result.scalar_one_or_none()
        if existing:
            return existing
        
        # Create credit check record
        credit_check = CreditCheck(
            user_id=user_id,
            loan_application_id=loan_id,
            status=CreditStatus.IN_PROGRESS,
            consent_text=consent_text or "I consent to credit check",
            consent_timestamp=datetime.utcnow(),
            consent_ip=consent_ip,
        )
        db.add(credit_check)
        await db.commit()
        
        try:
            if settings.USE_MOCKS:
                # Mock CIBIL response
                await asyncio.sleep(1)  # Simulate API call
                report_data = {
                    "credit_score": 750,
                    "credit_rating": "Good",
                    "total_accounts": 5,
                    "active_accounts": 3,
                    "overdue_amount": 0,
                }
            else:
                # Real CIBIL API call
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        f"{settings.CIBIL_API_BASE}/credit-report",
                        headers={"Authorization": f"Bearer {settings.CIBIL_API_KEY}"},
                        json={"pan": pan},
                    )
                    response.raise_for_status()
                    report_data = response.json()
            
            # Encrypt raw report
            credit_check.encrypted_report = encrypt_sensitive_data(json.dumps(report_data))
            credit_check.credit_score = report_data.get("credit_score")
            credit_check.credit_rating = report_data.get("credit_rating")
            credit_check.report_summary = {
                "total_accounts": report_data.get("total_accounts"),
                "active_accounts": report_data.get("active_accounts"),
                "overdue_amount": report_data.get("overdue_amount"),
            }
            credit_check.status = CreditStatus.COMPLETED
            credit_check.completed_at = datetime.utcnow()
            credit_check.expires_at = datetime.utcnow() + timedelta(days=30)
            credit_check.job_id = f"CIBIL_{credit_check.id}"
            
        except Exception as e:
            logger.error(f"CIBIL fetch failed: {e}")
            credit_check.status = CreditStatus.FAILED
            credit_check.meta_data = {"error": str(e)}
        
        await db.commit()
        await db.refresh(credit_check)
        
        # Audit log
        await AuditService.log_audit(
            db=db,
            user_id=user_id,
            loan_application_id=loan_id,
            action=AuditAction.CIBIL_FETCH,
            resource_type="credit",
            resource_id=str(credit_check.id),
            status="success" if credit_check.status == CreditStatus.COMPLETED else "failure",
        )
        
        return credit_check
    
    async def get_cibil_status(self, db: AsyncSession, job_id: str) -> CreditCheck:
        """Get CIBIL check status by job ID"""
        result = await db.execute(
            select(CreditCheck).where(CreditCheck.job_id == job_id)
        )
        credit_check = result.scalar_one_or_none()
        if not credit_check:
            raise ValueError("Credit check not found")
        return credit_check
    
    async def get_user_cibil(self, db: AsyncSession, user_id: UUID) -> CreditCheck:
        """Get latest CIBIL check for user"""
        result = await db.execute(
            select(CreditCheck)
            .where(CreditCheck.user_id == user_id)
            .order_by(CreditCheck.created_at.desc())
        )
        credit_check = result.scalar_one_or_none()
        if not credit_check:
            raise ValueError("No credit check found for user")
        return credit_check

