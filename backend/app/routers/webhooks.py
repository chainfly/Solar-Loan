"""
Webhooks Router
"""
from fastapi import APIRouter, Request, HTTPException, status, Header
from app.services.decentro_service import DecentroService
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/decentro")
async def decentro_webhook(
    request: Request,
    x_decentro_signature: str = Header(None, alias="x-decentro-signature"),
):
    """Handle Decentro webhook"""
    try:
        body = await request.body()
        body_str = body.decode()
        
        # Get headers
        headers = dict(request.headers)
        
        # Validate signature
        decentro_service = DecentroService()
        if not decentro_service.validate_webhook(headers, body_str):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature")
        
        # Parse webhook data
        webhook_data = json.loads(body_str)
        
        # Process webhook (update KYC status, payment status, etc.)
        logger.info(f"Received Decentro webhook: {webhook_data}")
        
        event_type = webhook_data.get("type")
        payload = webhook_data.get("data", {})
        
        if event_type == "KYC_VERIFICATION_SUCCESSFUL":
            # Handle KYC success
            pass
        elif event_type == "PAYOUT_SUCCESSFUL":
            # Handle Payout success
            logger.info(f"Payout successful: {payload.get('transfer_id')}")
        elif event_type == "PAYOUT_FAILED":
            # Handle Payout failure
            logger.error(f"Payout failed: {payload.get('transfer_id')}")
        elif event_type in ["MANDATE_REGISTERED", "MANDATE_ACTIVE"]:
            # Handle Mandate success
            logger.info(f"Mandate active: {payload.get('mandate_id')}")
        elif event_type == "MANDATE_FAILED":
            # Handle Mandate failure
            logger.error(f"Mandate failed: {payload.get('mandate_id')}")
        
        return {"status": "success", "message": "Webhook processed"}
    except Exception as e:
        logger.error(f"Webhook processing failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

