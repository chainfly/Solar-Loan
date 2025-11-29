# Backend API Contracts

## Authentication

### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe",
  "phone": "+919876543210"
}
```

**Response:** 201 Created
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+919876543210",
  "is_active": true,
  "is_verified": false,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### POST /api/auth/login
Login user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** 200 OK
```json
{
  "access_token": "jwt_token",
  "refresh_token": "jwt_refresh_token",
  "token_type": "bearer"
}
```

### POST /api/auth/refresh
Refresh access token.

**Request:**
```json
{
  "refresh_token": "jwt_refresh_token"
}
```

**Response:** 200 OK
```json
{
  "access_token": "new_jwt_token",
  "refresh_token": "new_jwt_refresh_token",
  "token_type": "bearer"
}
```

### GET /api/auth/me
Get current user information.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** 200 OK
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "is_verified": false,
  "last_login": "2024-01-01T00:00:00Z"
}
```

## Loans

### POST /api/loans
Create a new loan application.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "full_name": "John Doe",
  "loan_amount": "500000",
  "loan_tenure_years": 5,
  "system_capacity_kw": "5.0",
  "state": "Maharashtra",
  "annual_income": "1000000",
  "pan_number": "ABCDE1234F"
}
```

**Response:** 201 Created
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "full_name": "John Doe",
  "loan_amount": "500000",
  "status": "draft",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### GET /api/loans
List user's loan applications.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** 200 OK
```json
[
  {
    "id": "uuid",
    "loan_amount": "500000",
    "status": "draft",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### GET /api/loans/{loan_id}
Get loan application by ID.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** 200 OK
```json
{
  "id": "uuid",
  "loan_amount": "500000",
  "status": "emi_calculated",
  "emi_amount": "10000",
  "subsidy_amount": "50000",
  "ai_eligibility_score": "85.5"
}
```

### POST /api/loans/{loan_id}/submit
Submit loan application and trigger workflow.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** 200 OK
```json
{
  "loan_id": "uuid",
  "status": "submitted",
  "message": "Loan application submitted successfully",
  "workflow_steps": ["kyc_completed", "cibil_completed", "ai_eligibility_completed"]
}
```

## KYC

### POST /api/kyc/aadhaar-xml
Verify Aadhaar XML.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "xml_content": "base64_encoded_xml",
  "share_code": "1234"
}
```

**Response:** 201 Created
```json
{
  "id": "uuid",
  "kyc_type": "aadhaar_xml",
  "status": "completed",
  "is_verified": true,
  "decentro_operation_id": "op_123"
}
```

### POST /api/kyc/pan
Verify PAN.

**Request:**
```json
{
  "pan": "ABCDE1234F",
  "name": "John Doe"
}
```

### POST /api/kyc/bank
Verify bank account.

**Request:**
```json
{
  "account_number": "1234567890",
  "ifsc": "BANK0001234",
  "name": "John Doe"
}
```

## Credit

### POST /api/credit/cibil/fetch
Fetch CIBIL credit report.

**Request:**
```json
{
  "pan": "ABCDE1234F",
  "consent_text": "I consent to credit check",
  "consent_ip": "192.168.1.1"
}
```

**Response:** 201 Created
```json
{
  "id": "uuid",
  "status": "completed",
  "credit_score": "750",
  "credit_rating": "Good",
  "job_id": "CIBIL_123"
}
```

## AI/ML

### POST /api/ai/eligibility
Check loan eligibility.

**Request:**
```json
{
  "loan_application_id": "uuid",
  "features": {}
}
```

**Response:** 200 OK
```json
{
  "loan_application_id": "uuid",
  "eligibility_score": "85.5",
  "is_eligible": true,
  "reasons": ["Income sufficient", "Good credit history"],
  "confidence": "85.5"
}
```

### POST /api/ai/roi-prediction
Predict ROI.

**Request:**
```json
{
  "loan_application_id": "uuid",
  "system_capacity_kw": "5.0",
  "location": "Maharashtra",
  "roof_angle": "25.0"
}
```

## Calculations

### POST /api/calculate/emi
Calculate EMI.

**Request:**
```json
{
  "principal": "500000",
  "interest_rate": "8.5",
  "tenure_years": 5
}
```

**Response:** 200 OK
```json
{
  "emi_amount": "10250.50",
  "total_amount": "615030",
  "total_interest": "115030",
  "principal": "500000",
  "interest_rate": "8.5",
  "tenure_years": 5,
  "tenure_months": 60
}
```

### POST /api/calculate/subsidy
Calculate subsidy.

**Request:**
```json
{
  "system_capacity_kw": "5.0",
  "state": "Maharashtra",
  "system_type": "residential"
}
```

**Response:** 200 OK
```json
{
  "subsidy_amount": "50000",
  "central_subsidy": "30000",
  "state_subsidy": "20000",
  "system_capacity_kw": "5.0",
  "state": "Maharashtra",
  "system_type": "residential"
}
```

## Reports

### GET /api/report/{loan_id}/pdf
Generate PDF report for loan.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** 200 OK (PDF file)

## Webhooks

### POST /api/webhooks/decentro
Handle Decentro webhook.

**Headers:** `X-Decentro-Signature: <signature>`

**Request:** (Decentro webhook payload)

**Response:** 200 OK
```json
{
  "status": "success",
  "message": "Webhook processed"
}
```

