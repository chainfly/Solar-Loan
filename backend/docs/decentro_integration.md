# Decentro Integration Guide

## Overview

The backend integrates with Decentro for KYC verification, payments, and notifications. The integration supports both production and mock modes.

## Configuration

Set the following environment variables:

```bash
DECENTRO_API_BASE=https://in.staging.decentro.tech
DECENTRO_CLIENT_ID=your_client_id
DECENTRO_CLIENT_SECRET=your_client_secret
DECENTRO_API_KEY=your_api_key
DECENTRO_WEBHOOK_SECRET=your_webhook_secret
USE_MOCKS=true  # Set to false for production
```

## KYC Services

### Aadhaar XML Verification

```python
from app.services.decentro_service import DecentroService

decentro = DecentroService()
result = await decentro.verify_aadhaar_xml(xml_content, share_code)
```

**Response:**
```json
{
  "status": "SUCCESS",
  "data": {
    "operation_id": "op_123",
    "reference_id": "ref_456",
    "verification_status": "verified",
    "name": "John Doe",
    "dob": "1990-01-01"
  }
}
```

### PAN Verification

```python
result = await decentro.verify_pan(pan="ABCDE1234F", name="John Doe")
```

### Bank Account Verification

```python
result = await decentro.verify_bank(
    account_number="1234567890",
    ifsc="BANK0001234",
    name="John Doe"
)
```

### CKYC Search

```python
result = await decentro.fetch_ckyc(pan="ABCDE1234F")
```

## Payment Services

### Initiate Payment

```python
payload = {
    "amount": 10000,
    "currency": "INR",
    "payment_method": "upi",
    "customer_details": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+919876543210"
    }
}
result = await decentro.initiate_payment(payload)
```

## Notification Services

### Send SMS

```python
result = await decentro.send_sms(
    phone="+919876543210",
    message="Your loan application has been approved"
)
```

### Send Email

```python
result = await decentro.send_email(
    email="john@example.com",
    subject="Loan Application Status",
    body="Your loan application has been approved"
)
```

## Webhook Handling

### Webhook Endpoint

The backend provides a webhook endpoint at `/api/webhooks/decentro` that:

1. Validates the webhook signature using HMAC
2. Processes the webhook payload
3. Updates relevant records in the database

### Webhook Signature Validation

The webhook signature is validated using HMAC-SHA256:

```python
def validate_webhook(payload: str, signature: str, secret: str) -> bool:
    expected_signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected_signature, signature)
```

## Caching

KYC results are cached in Redis for 24 hours to avoid redundant API calls:

```python
# Cache result
await decentro.cache_kyc_result(user_id, kyc_type, result, ttl=86400)

# Retrieve cached result
cached = await decentro.get_cached_kyc_result(user_id, kyc_type)
```

## Error Handling

The service includes:
- Retry logic with exponential backoff (3 retries)
- Timeout handling (30 seconds)
- Error logging
- Graceful degradation in mock mode

## Mock Mode

When `USE_MOCKS=true`, the service returns mock responses without making actual API calls. This is useful for:
- Development and testing
- CI/CD pipelines
- Local development without API credentials

Mock responses simulate realistic data structures and include operation IDs for testing webhook flows.

## Security

- All sensitive data (Aadhaar XML, PAN, bank details) is encrypted using Fernet before storage
- Webhook signatures are validated to prevent unauthorized requests
- Consent is tracked for all KYC operations (text, timestamp, IP address)
- Audit logs are created for all KYC operations

## Rate Limiting

KYC endpoints are rate-limited to 10 requests per minute per IP address to prevent abuse.

## Testing

Example test for Decentro service:

```python
@pytest.mark.asyncio
async def test_aadhaar_verification():
    decentro = DecentroService()
    result = await decentro.verify_aadhaar_xml("xml_content", "1234")
    assert result["status"] == "SUCCESS"
    assert "operation_id" in result["data"]
```

