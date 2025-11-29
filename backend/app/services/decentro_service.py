"""
Decentro Integration Service
"""
import httpx
import json
import hmac
import hashlib
from typing import Dict, Any, Optional
from app.core.config import settings
from app.core.security import encrypt_sensitive_data, decrypt_sensitive_data, verify_webhook_signature
from app.core.redis_client import get_redis
import logging
import asyncio

logger = logging.getLogger(__name__)


class DecentroService:
    """Decentro API integration service"""
    
    def __init__(self):
        self.base_url = settings.DECENTRO_API_BASE
        self.client_id = settings.DECENTRO_CLIENT_ID
        self.client_secret = settings.DECENTRO_CLIENT_SECRET
        # Module secrets
        self.kyc_module_secret = settings.DECENTRO_KYC_MODULE_SECRET
        self.core_banking_module_secret = settings.DECENTRO_CORE_BANKING_MODULE_SECRET
        self.bytes_module_secret = settings.DECENTRO_BYTES_MODULE_SECRET
        self.idfc_bank_provider_secret = settings.DECENTRO_IDFC_BANK_PROVIDER_SECRET
        self.payments_module_secret = settings.DECENTRO_PAYMENTS_MODULE_SECRET
        self.financial_services_module_secret = settings.DECENTRO_FINANCIAL_SERVICES_MODULE_SECRET
        self.equifax_provider_secret = settings.DECENTRO_EQUIFAX_PROVIDER_SECRET
        # Legacy/Default
        self.api_key = settings.DECENTRO_API_KEY
        self.webhook_secret = settings.DECENTRO_WEBHOOK_SECRET
        self.use_mocks = settings.USE_MOCKS
    
    def _get_module_secret(self, endpoint: str) -> str:
        """Get the appropriate module secret based on endpoint"""
        if "kyc" in endpoint or "aadhaar" in endpoint or "pan" in endpoint or "bank" in endpoint or "ckyc" in endpoint:
            return self.kyc_module_secret
        elif "payment" in endpoint:
            return self.payments_module_secret
        elif "financial" in endpoint or "credit" in endpoint or "cibil" in endpoint:
            return self.financial_services_module_secret
        elif "equifax" in endpoint:
            return self.equifax_provider_secret
        elif "idfc" in endpoint:
            return self.idfc_bank_provider_secret
        elif "core" in endpoint or "banking" in endpoint:
            return self.core_banking_module_secret
        elif "bytes" in endpoint:
            return self.bytes_module_secret
        else:
            # Default to KYC module secret
            return self.kyc_module_secret
    
    async def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        retries: int = 3,
        module_secret: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Make HTTP request with retries and exponential backoff"""
        if self.use_mocks:
            return await self._mock_request(method, endpoint, data)
        
        url = f"{self.base_url}{endpoint}"
        # Use provided module_secret or determine from endpoint
        secret = module_secret or self._get_module_secret(endpoint)
        
        headers = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "module_secret": secret,
            "Content-Type": "application/json",
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            for attempt in range(retries):
                try:
                    if method == "GET":
                        response = await client.get(url, headers=headers, params=data)
                    elif method == "POST":
                        response = await client.post(url, headers=headers, json=data)
                    else:
                        raise ValueError(f"Unsupported method: {method}")
                    
                    response.raise_for_status()
                    return response.json()
                except httpx.HTTPError as e:
                    if attempt == retries - 1:
                        raise
                    wait_time = 2 ** attempt
                    logger.warning(f"Request failed, retrying in {wait_time}s: {e}")
                    await asyncio.sleep(wait_time)
        
        raise Exception("Request failed after retries")
    
    async def _mock_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Mock Decentro API responses"""
        await asyncio.sleep(0.1)  # Simulate network delay
        
        if "aadhaar" in endpoint:
            return {
                "status": "SUCCESS",
                "data": {
                    "operation_id": f"MOCK_OP_{hash(str(data))}",
                    "reference_id": f"MOCK_REF_{hash(str(data))}",
                    "verification_status": "verified",
                    "name": "MOCK USER",
                    "dob": "1990-01-01",
                    "gender": "M",
                },
            }
        elif "pan" in endpoint:
            return {
                "status": "SUCCESS",
                "data": {
                    "operation_id": f"MOCK_OP_{hash(str(data))}",
                    "pan_verified": True,
                    "name": "MOCK USER",
                },
            }
        elif "bank" in endpoint:
            return {
                "status": "SUCCESS",
                "data": {
                    "operation_id": f"MOCK_OP_{hash(str(data))}",
                    "account_verified": True,
                    "account_holder_name": "MOCK USER",
                },
            }
        elif "ckyc" in endpoint:
            return {
                "status": "SUCCESS",
                "data": {
                    "operation_id": f"MOCK_OP_{hash(str(data))}",
                    "ckyc_found": True,
                    "kyc_data": {"name": "MOCK USER"},
                },
            }
        elif "sms" in endpoint or "email" in endpoint:
            return {
                "status": "SUCCESS",
                "data": {
                    "operation_id": f"MOCK_OP_{hash(str(data))}",
                    "message_sent": True,
                },
            }
        elif "payment" in endpoint:
            return {
                "status": "SUCCESS",
                "data": {
                    "operation_id": f"MOCK_OP_{hash(str(data))}",
                    "payment_id": f"MOCK_PAY_{hash(str(data))}",
                    "status": "initiated",
                },
            }
        elif "status" in endpoint:
            return {
                "status": "SUCCESS",
                "data": {
                    "operation_id": data.get("operation_id") if data else "MOCK_OP",
                    "status": "completed",
                    "result": {"verified": True},
                },
            }
        
        return {"status": "SUCCESS", "data": {}}
    
    async def verify_aadhaar_xml(self, xml_content: str, share_code: str) -> Dict[str, Any]:
        """Verify Aadhaar XML"""
        endpoint = "/kyc/aadhaar/xml/verify"
        payload = {
            "xml_content": xml_content,
            "share_code": share_code,
        }
        
        result = await self._make_request("POST", endpoint, payload, module_secret=self.kyc_module_secret)
        
        # Encrypt sensitive data
        if "data" in result and result["data"]:
            encrypted = encrypt_sensitive_data(json.dumps(result["data"]))
            result["encrypted_data"] = encrypted
        
        return result
    
    async def verify_pan(self, pan: str, name: str) -> Dict[str, Any]:
        """Verify PAN"""
        endpoint = "/kyc/pan/verify"
        payload = {
            "pan": pan,
            "name": name,
        }
        
        result = await self._make_request("POST", endpoint, payload, module_secret=self.kyc_module_secret)
        
        # Encrypt sensitive data
        if "data" in result and result["data"]:
            encrypted = encrypt_sensitive_data(json.dumps(result["data"]))
            result["encrypted_data"] = encrypted
        
        return result
    
    async def verify_bank(self, account_number: str, ifsc: str, name: str) -> Dict[str, Any]:
        """Verify bank account"""
        endpoint = "/kyc/bank/verify"
        payload = {
            "account_number": account_number,
            "ifsc": ifsc,
            "name": name,
        }
        
        result = await self._make_request("POST", endpoint, payload, module_secret=self.kyc_module_secret)
        
        # Encrypt sensitive data
        if "data" in result and result["data"]:
            encrypted = encrypt_sensitive_data(json.dumps(result["data"]))
            result["encrypted_data"] = encrypted
        
        return result
    
    async def fetch_ckyc(self, pan: str) -> Dict[str, Any]:
        """Fetch CKYC data"""
        endpoint = "/kyc/ckyc/fetch"
        payload = {"pan": pan}
        
        result = await self._make_request("POST", endpoint, payload, module_secret=self.kyc_module_secret)
        
        # Encrypt sensitive data
        if "data" in result and result["data"]:
            encrypted = encrypt_sensitive_data(json.dumps(result["data"]))
            result["encrypted_data"] = encrypted
        
        return result
    
    async def send_sms(self, phone: str, message: str) -> Dict[str, Any]:
        """Send SMS"""
        endpoint = "/notifications/sms/send"
        payload = {
            "phone": phone,
            "message": message,
        }
        # Notifications typically use Bytes module
        return await self._make_request("POST", endpoint, payload, module_secret=self.bytes_module_secret)
    
    async def send_email(self, email: str, subject: str, body: str) -> Dict[str, Any]:
        """Send email"""
        endpoint = "/notifications/email/send"
        payload = {
            "email": email,
            "subject": subject,
            "body": body,
        }
        # Notifications typically use Bytes module
        return await self._make_request("POST", endpoint, payload, module_secret=self.bytes_module_secret)
    
    async def initiate_payment(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Initiate payment"""
        endpoint = "/payments/initiate"
        return await self._make_request("POST", endpoint, payload, module_secret=self.payments_module_secret)
    
    async def get_operation_status(self, operation_id: str) -> Dict[str, Any]:
        """Get operation status"""
        endpoint = f"/operations/{operation_id}/status"
        return await self._make_request("GET", endpoint)
    
    def validate_webhook(self, headers: Dict[str, str], body: str) -> bool:
        """Validate webhook signature"""
        signature = headers.get("x-decentro-signature") or headers.get("X-Decentro-Signature")
        if not signature:
            return False
        
        return verify_webhook_signature(body, signature, self.webhook_secret)
    
    async def initiate_payout(
        self,
        account_number: str,
        ifsc: str,
        amount: float,
        purpose: str,
        beneficiary_name: str,
        reference_id: str
    ) -> Dict[str, Any]:
        """Initiate Payout (Loan Disbursement)"""
        endpoint = "/payouts/initiate"
        payload = {
            "reference_id": reference_id,
            "purpose_message": purpose,
            "transfer_amount": amount,
            "beneficiary_details": {
                "payee_account_number": account_number,
                "payee_ifsc": ifsc,
                "payee_name": beneficiary_name
            },
            "currency_code": "INR",
            "transfer_type": "IMPS"
        }
        
        # Use mock if enabled
        if self.use_mocks:
            return await self._mock_request("POST", endpoint, payload)
            
        return await self._make_request("POST", endpoint, payload, module_secret=self.payments_module_secret)

    async def get_payout_status(self, transfer_id: str) -> Dict[str, Any]:
        """Get Payout Status"""
        endpoint = f"/payouts/{transfer_id}/status"
        
        if self.use_mocks:
            return await self._mock_request("GET", endpoint)
            
        return await self._make_request("GET", endpoint, module_secret=self.payments_module_secret)

    async def create_mandate(
        self,
        amount: float,
        frequency: str,
        start_date: str,
        end_date: str,
        payer_name: str,
        payer_account: str,
        payer_ifsc: str
    ) -> Dict[str, Any]:
        """Create UPI Autopay Mandate"""
        endpoint = "/mandates/create"
        payload = {
            "amount": amount,
            "frequency": frequency,
            "start_date": start_date,
            "end_date": end_date,
            "payer_name": payer_name,
            "payer_account": payer_account,
            "payer_ifsc": payer_ifsc,
            "mandate_type": "UPI"
        }
        
        if self.use_mocks:
            return await self._mock_request("POST", endpoint, payload)
            
        return await self._make_request("POST", endpoint, payload, module_secret=self.payments_module_secret)

    async def get_mandate_status(self, mandate_id: str) -> Dict[str, Any]:
        """Get Mandate Status"""
        endpoint = f"/mandates/{mandate_id}/status"
        
        if self.use_mocks:
            return await self._mock_request("GET", endpoint)
            
        return await self._make_request("GET", endpoint, module_secret=self.payments_module_secret)

    async def present_mandate(self, mandate_id: str, amount: float, reference_id: str) -> Dict[str, Any]:
        """Present Mandate (Collect EMI)"""
        endpoint = "/mandates/present"
        payload = {
            "mandate_id": mandate_id,
            "amount": amount,
            "reference_id": reference_id
        }
        
        if self.use_mocks:
            return await self._mock_request("POST", endpoint, payload)
            
        return await self._make_request("POST", endpoint, payload, module_secret=self.payments_module_secret)

    async def cache_kyc_result(self, user_id: str, kyc_type: str, result: Dict[str, Any], ttl: int = 86400):
        """Cache KYC result in Redis (24 hours default)"""
        redis = await get_redis()
        key = f"kyc:{user_id}:{kyc_type}"
        await redis.setex(key, ttl, json.dumps(result))
    
    async def get_cached_kyc_result(self, user_id: str, kyc_type: str) -> Optional[Dict[str, Any]]:
        """Get cached KYC result"""
        redis = await get_redis()
        key = f"kyc:{user_id}:{kyc_type}"
        cached = await redis.get(key)
        if cached:
            return json.loads(cached)
        return None

