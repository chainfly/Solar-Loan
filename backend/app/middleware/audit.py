"""
Audit Middleware
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.services.audit_service import AuditService
from app.models.audit import AuditAction
import logging

logger = logging.getLogger(__name__)


class AuditMiddleware(BaseHTTPMiddleware):
    """Middleware to log audit events"""
    
    async def dispatch(self, request: Request, call_next):
        # Skip audit for health checks and docs
        if request.url.path in ["/health", "/api/docs", "/api/openapi.json", "/api/redoc"]:
            return await call_next(request)
        
        # Get user from request state (set by auth dependency)
        user_id = getattr(request.state, "user_id", None)
        
        # Process request
        response = await call_next(request)
        
        # Log audit event (async background task would be better, but keeping simple for now)
        # Note: This is a simplified version. In production, use background tasks
        try:
            action = self._get_action(request.method, request.url.path)
            if action:
                # Audit will be logged in individual endpoints for better context
                pass
        except Exception as e:
            logger.error(f"Audit logging failed: {e}")
        
        return response
    
    def _get_action(self, method: str, path: str) -> AuditAction:
        """Determine audit action from method and path"""
        if "login" in path:
            return AuditAction.LOGIN
        elif "logout" in path:
            return AuditAction.LOGOUT
        elif "kyc" in path:
            return AuditAction.KYC_VERIFY
        elif "cibil" in path or "credit" in path:
            return AuditAction.CIBIL_FETCH
        elif "ai" in path or "predict" in path:
            return AuditAction.AI_PREDICT
        elif "document" in path and method == "POST":
            return AuditAction.DOCUMENT_UPLOAD
        elif "submit" in path:
            return AuditAction.LOAN_SUBMIT
        elif method == "POST":
            return AuditAction.CREATE
        elif method == "PATCH" or method == "PUT":
            return AuditAction.UPDATE
        elif method == "DELETE":
            return AuditAction.DELETE
        return None
    
    def _get_resource_type(self, path: str) -> str:
        """Extract resource type from path"""
        parts = path.split("/")
        if len(parts) >= 3:
            return parts[2]  # e.g., /api/loans -> "loans"
        return None

