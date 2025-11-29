"""
KYC Service
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.kyc import KYCRecord, KYCType, KYCStatus
from app.services.decentro_service import DecentroService
from app.services.audit_service import AuditService
from app.models.audit import AuditAction
from datetime import datetime
from uuid import UUID
import json
import logging

logger = logging.getLogger(__name__)


class KYCService:
    """KYC verification service"""
    
    def __init__(self):
        self.decentro = DecentroService()
    
    async def verify_aadhaar_xml(
        self,
        db: AsyncSession,
        user_id: UUID,
        loan_id: UUID,
        xml_content: str,
        share_code: str,
        consent_text: str,
        consent_ip: str,
    ) -> KYCRecord:
        """Verify Aadhaar XML"""
        # Check cache
        cached = await self.decentro.get_cached_kyc_result(str(user_id), "aadhaar")
        if cached:
            # Create record from cache
            kyc_record = KYCRecord(
                user_id=user_id,
                loan_application_id=loan_id,
                kyc_type=KYCType.AADHAAR_XML,
                status=KYCStatus.VERIFIED,
                verification_result=cached.get("data"),
                is_verified=True,
                consent_text=consent_text,
                consent_timestamp=datetime.utcnow(),
                consent_ip=consent_ip,
            )
            db.add(kyc_record)
            await db.commit()
            return kyc_record
        
        # Create KYC record
        kyc_record = KYCRecord(
            user_id=user_id,
            loan_application_id=loan_id,
            kyc_type=KYCType.AADHAAR_XML,
            status=KYCStatus.IN_PROGRESS,
            consent_text=consent_text,
            consent_timestamp=datetime.utcnow(),
            consent_ip=consent_ip,
        )
        db.add(kyc_record)
        await db.commit()
        
        try:
            # Call Decentro
            result = await self.decentro.verify_aadhaar_xml(xml_content, share_code)
            
            # Encrypt and store
            kyc_record.encrypted_request_data = json.dumps({"xml_content": xml_content, "share_code": share_code})
            kyc_record.encrypted_response_data = result.get("encrypted_data", "")
            kyc_record.decentro_operation_id = result.get("data", {}).get("operation_id")
            kyc_record.decentro_reference_id = result.get("data", {}).get("reference_id")
            kyc_record.verification_result = result.get("data", {})
            kyc_record.is_verified = result.get("data", {}).get("verification_status") == "verified"
            kyc_record.status = KYCStatus.COMPLETED if kyc_record.is_verified else KYCStatus.FAILED
            kyc_record.completed_at = datetime.utcnow()
            
            # Cache result
            await self.decentro.cache_kyc_result(str(user_id), "aadhaar", result.get("data", {}))
            
        except Exception as e:
            logger.error(f"Aadhaar verification failed: {e}")
            kyc_record.status = KYCStatus.FAILED
            kyc_record.meta_data = {"error": str(e)}
        
        await db.commit()
        await db.refresh(kyc_record)
        
        # Audit log
        await AuditService.log_audit(
            db=db,
            user_id=user_id,
            loan_application_id=loan_id,
            action=AuditAction.KYC_VERIFY,
            resource_type="kyc",
            resource_id=str(kyc_record.id),
            status="success" if kyc_record.is_verified else "failure",
        )
        
        return kyc_record
    
    async def verify_pan(
        self,
        db: AsyncSession,
        user_id: UUID,
        loan_id: UUID,
        pan: str,
        name: str,
        consent_text: str,
        consent_ip: str,
    ) -> KYCRecord:
        """Verify PAN"""
        # Similar implementation to aadhaar
        kyc_record = KYCRecord(
            user_id=user_id,
            loan_application_id=loan_id,
            kyc_type=KYCType.PAN,
            status=KYCStatus.IN_PROGRESS,
            consent_text=consent_text,
            consent_timestamp=datetime.utcnow(),
            consent_ip=consent_ip,
        )
        db.add(kyc_record)
        await db.commit()
        
        try:
            result = await self.decentro.verify_pan(pan, name)
            kyc_record.encrypted_request_data = json.dumps({"pan": pan, "name": name})
            kyc_record.encrypted_response_data = result.get("encrypted_data", "")
            kyc_record.decentro_operation_id = result.get("data", {}).get("operation_id")
            kyc_record.verification_result = result.get("data", {})
            kyc_record.is_verified = result.get("data", {}).get("pan_verified", False)
            kyc_record.status = KYCStatus.COMPLETED if kyc_record.is_verified else KYCStatus.FAILED
            kyc_record.completed_at = datetime.utcnow()
            
            await self.decentro.cache_kyc_result(str(user_id), "pan", result.get("data", {}))
        except Exception as e:
            logger.error(f"PAN verification failed: {e}")
            kyc_record.status = KYCStatus.FAILED
            kyc_record.meta_data = {"error": str(e)}
        
        await db.commit()
        await db.refresh(kyc_record)
        
        await AuditService.log_audit(
            db=db,
            user_id=user_id,
            loan_application_id=loan_id,
            action=AuditAction.KYC_VERIFY,
            resource_type="kyc",
            resource_id=str(kyc_record.id),
            status="success" if kyc_record.is_verified else "failure",
        )
        
        return kyc_record
    
    async def verify_bank(
        self,
        db: AsyncSession,
        user_id: UUID,
        loan_id: UUID,
        account_number: str,
        ifsc: str,
        name: str,
        consent_text: str,
        consent_ip: str,
    ) -> KYCRecord:
        """Verify bank account"""
        kyc_record = KYCRecord(
            user_id=user_id,
            loan_application_id=loan_id,
            kyc_type=KYCType.BANK,
            status=KYCStatus.IN_PROGRESS,
            consent_text=consent_text,
            consent_timestamp=datetime.utcnow(),
            consent_ip=consent_ip,
        )
        db.add(kyc_record)
        await db.commit()
        
        try:
            result = await self.decentro.verify_bank(account_number, ifsc, name)
            kyc_record.encrypted_request_data = json.dumps({"account_number": account_number, "ifsc": ifsc, "name": name})
            kyc_record.encrypted_response_data = result.get("encrypted_data", "")
            kyc_record.decentro_operation_id = result.get("data", {}).get("operation_id")
            kyc_record.verification_result = result.get("data", {})
            kyc_record.is_verified = result.get("data", {}).get("account_verified", False)
            kyc_record.status = KYCStatus.COMPLETED if kyc_record.is_verified else KYCStatus.FAILED
            kyc_record.completed_at = datetime.utcnow()
        except Exception as e:
            logger.error(f"Bank verification failed: {e}")
            kyc_record.status = KYCStatus.FAILED
            kyc_record.meta_data = {"error": str(e)}
        
        await db.commit()
        await db.refresh(kyc_record)
        
        await AuditService.log_audit(
            db=db,
            user_id=user_id,
            loan_application_id=loan_id,
            action=AuditAction.KYC_VERIFY,
            resource_type="kyc",
            resource_id=str(kyc_record.id),
            status="success" if kyc_record.is_verified else "failure",
        )
        
        return kyc_record
    
    async def fetch_ckyc(
        self,
        db: AsyncSession,
        user_id: UUID,
        loan_id: UUID,
        pan: str,
        consent_text: str,
        consent_ip: str,
    ) -> KYCRecord:
        """Fetch CKYC data"""
        kyc_record = KYCRecord(
            user_id=user_id,
            loan_application_id=loan_id,
            kyc_type=KYCType.CKYC,
            status=KYCStatus.IN_PROGRESS,
            consent_text=consent_text,
            consent_timestamp=datetime.utcnow(),
            consent_ip=consent_ip,
        )
        db.add(kyc_record)
        await db.commit()
        
        try:
            result = await self.decentro.fetch_ckyc(pan)
            kyc_record.encrypted_request_data = json.dumps({"pan": pan})
            kyc_record.encrypted_response_data = result.get("encrypted_data", "")
            kyc_record.decentro_operation_id = result.get("data", {}).get("operation_id")
            kyc_record.verification_result = result.get("data", {})
            kyc_record.is_verified = result.get("data", {}).get("ckyc_found", False)
            kyc_record.status = KYCStatus.COMPLETED if kyc_record.is_verified else KYCStatus.FAILED
            kyc_record.completed_at = datetime.utcnow()
        except Exception as e:
            logger.error(f"CKYC fetch failed: {e}")
            kyc_record.status = KYCStatus.FAILED
            kyc_record.meta_data = {"error": str(e)}
        
        await db.commit()
        await db.refresh(kyc_record)
        
        return kyc_record
    
    async def run_kyc_checks(self, db: AsyncSession, user_id: UUID, loan_id: UUID) -> dict:
        """Run all KYC checks for a loan"""
        # This would run all necessary KYC checks
        # For now, return a summary
        result = await db.execute(
            select(KYCRecord).where(
                KYCRecord.user_id == user_id,
                KYCRecord.loan_application_id == loan_id,
            )
        )
        records = result.scalars().all()
        
        return {
            "total_checks": len(records),
            "verified": sum(1 for r in records if r.is_verified),
            "records": [{"type": r.kyc_type.value, "status": r.status.value} for r in records],
        }
    
    async def get_kyc_status(self, db: AsyncSession, user_id: UUID) -> dict:
        """Get KYC status for user"""
        from sqlalchemy import select
        
        result = await db.execute(
            select(KYCRecord).where(KYCRecord.user_id == user_id)
        )
        records = result.scalars().all()
        
        return {
            "user_id": str(user_id),
            "kyc_records": records,
            "overall_status": "completed" if all(r.is_verified for r in records) else "pending",
        }

