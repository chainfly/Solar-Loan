"""
Audit Service
"""
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit import AuditLog, AuditAction
from app.core.security import mask_pii
from datetime import datetime
from uuid import UUID
import json
import logging

logger = logging.getLogger(__name__)


class AuditService:
    """Audit logging service"""
    
    @staticmethod
    async def log_audit(
        db: AsyncSession,
        user_id: UUID = None,
        loan_application_id: UUID = None,
        action: AuditAction = None,
        resource_type: str = None,
        resource_id: str = None,
        ip_address: str = None,
        user_agent: str = None,
        request_path: str = None,
        request_method: str = None,
        changes: dict = None,
        old_values: dict = None,
        new_values: dict = None,
        status: str = None,
        error_message: str = None,
    ):
        """Log an audit event"""
        try:
            # Mask PII in changes
            if changes:
                changes_str = json.dumps(changes)
                changes = json.loads(mask_pii(changes_str))
            if old_values:
                old_values_str = json.dumps(old_values)
                old_values = json.loads(mask_pii(old_values_str))
            if new_values:
                new_values_str = json.dumps(new_values)
                new_values = json.loads(mask_pii(new_values_str))
            
            audit_log = AuditLog(
                user_id=user_id,
                loan_application_id=loan_application_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                ip_address=ip_address,
                user_agent=user_agent,
                request_path=request_path,
                request_method=request_method,
                changes=changes,
                old_values=old_values,
                new_values=new_values,
                status=status,
                error_message=error_message,
            )
            db.add(audit_log)
            await db.commit()
        except Exception as e:
            logger.error(f"Failed to log audit: {e}")
            # Don't fail the request if audit logging fails
            await db.rollback()

