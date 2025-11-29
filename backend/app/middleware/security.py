"""
Security Middleware
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.security import mask_pii
import logging
import json

logger = logging.getLogger(__name__)


class SecurityMiddleware(BaseHTTPMiddleware):
    """Middleware for security features like PII masking in logs"""
    
    async def dispatch(self, request: Request, call_next):
        # Mask PII in request body for logging
        if request.method in ["POST", "PATCH", "PUT"]:
            try:
                body = await request.body()
                if body:
                    body_str = body.decode()
                    masked_body = mask_pii(body_str)
                    logger.debug(f"Request body (masked): {masked_body}")
            except Exception as e:
                logger.error(f"Error masking request body: {e}")
        
        response = await call_next(request)
        return response

