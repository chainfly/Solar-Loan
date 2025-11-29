# API Examples

## cURL Examples

### Authentication

#### Register User
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "full_name": "John Doe",
    "phone": "+919876543210"
  }'
```

#### Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

#### Get Current User
```bash
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Loans

#### Create Loan Application
```bash
curl -X POST "http://localhost:8000/api/loans" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "loan_amount": "500000",
    "loan_tenure_years": 5,
    "system_capacity_kw": "5.0",
    "state": "Maharashtra",
    "annual_income": "1000000"
  }'
```

#### Submit Loan
```bash
curl -X POST "http://localhost:8000/api/loans/LOAN_ID/submit" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### KYC

#### Verify Aadhaar XML
```bash
curl -X POST "http://localhost:8000/api/kyc/aadhaar-xml" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "xml_content": "base64_encoded_xml",
    "share_code": "1234"
  }'
```

#### Verify PAN
```bash
curl -X POST "http://localhost:8000/api/kyc/pan" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pan": "ABCDE1234F",
    "name": "John Doe"
  }'
```

### Credit

#### Fetch CIBIL
```bash
curl -X POST "http://localhost:8000/api/credit/cibil/fetch" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pan": "ABCDE1234F",
    "consent_text": "I consent to credit check"
  }'
```

### AI/ML

#### Check Eligibility
```bash
curl -X POST "http://localhost:8000/api/ai/eligibility" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loan_application_id": "LOAN_ID"
  }'
```

#### Calculate ROI
```bash
curl -X POST "http://localhost:8000/api/ai/roi-prediction" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loan_application_id": "LOAN_ID",
    "system_capacity_kw": "5.0",
    "location": "Maharashtra"
  }'
```

### Calculations

#### Calculate EMI
```bash
curl -X POST "http://localhost:8000/api/calculate/emi" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "principal": "500000",
    "interest_rate": "8.5",
    "tenure_years": 5
  }'
```

#### Calculate Subsidy
```bash
curl -X POST "http://localhost:8000/api/calculate/subsidy" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "system_capacity_kw": "5.0",
    "state": "Maharashtra",
    "system_type": "residential"
  }'
```

### Documents

#### Upload Document
```bash
curl -X POST "http://localhost:8000/api/documents/upload" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "document_type=aadhaar" \
  -F "loan_application_id=LOAN_ID"
```

### Reports

#### Generate PDF Report
```bash
curl -X GET "http://localhost:8000/api/report/LOAN_ID/pdf" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  --output loan_report.pdf
```

## Python Examples

### Using httpx

```python
import httpx

# Login
async with httpx.AsyncClient() as client:
    response = await client.post(
        "http://localhost:8000/api/auth/login",
        json={
            "email": "user@example.com",
            "password": "SecurePassword123!"
        }
    )
    tokens = response.json()
    access_token = tokens["access_token"]
    
    # Create loan
    loan_response = await client.post(
        "http://localhost:8000/api/loans",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "full_name": "John Doe",
            "loan_amount": "500000",
            "loan_tenure_years": 5,
            "system_capacity_kw": "5.0",
            "state": "Maharashtra"
        }
    )
    loan = loan_response.json()
    print(f"Created loan: {loan['id']}")
```

## Postman Collection

Import the following collection into Postman:

```json
{
  "info": {
    "name": "Solar Loan AI API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"SecurePassword123!\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/register",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"SecurePassword123!\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/login",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000"
    },
    {
      "key": "access_token",
      "value": ""
    }
  ]
}
```

