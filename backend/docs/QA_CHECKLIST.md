# QA Checklist

## Setup & Configuration

- [ ] Environment variables configured correctly
- [ ] Database migrations run successfully
- [ ] Redis connection working
- [ ] S3/MinIO connection working
- [ ] All services start without errors

## Authentication

- [ ] User registration works
- [ ] Duplicate email registration fails
- [ ] User login returns tokens
- [ ] Invalid credentials rejected
- [ ] Token refresh works
- [ ] Logout revokes refresh token
- [ ] Password reset flow works
- [ ] `/api/auth/me` returns correct user data

## Loan Management

- [ ] Create loan application
- [ ] List user's loans
- [ ] Get loan by ID
- [ ] Update loan application
- [ ] Submit loan triggers workflow
- [ ] Workflow completes all steps (KYC → CIBIL → AI → Subsidy → EMI)
- [ ] Loan status updates correctly

## Document Management

- [ ] Upload document to S3
- [ ] Document metadata stored in database
- [ ] File size validation works
- [ ] File type validation works
- [ ] OCR processing works (mock)
- [ ] Get document by ID

## KYC Integration

- [ ] Aadhaar XML verification (mock mode)
- [ ] PAN verification (mock mode)
- [ ] Bank verification (mock mode)
- [ ] CKYC search (mock mode)
- [ ] KYC results cached in Redis
- [ ] Consent tracking works
- [ ] KYC status endpoint returns correct data

## Credit Bureau

- [ ] CIBIL fetch creates credit check record
- [ ] Credit report encrypted
- [ ] Credit score stored correctly
- [ ] Consent tracking works
- [ ] Cached reports reused (30 days)
- [ ] CIBIL status endpoint works

## AI/ML Endpoints

- [ ] Eligibility check returns score
- [ ] ROI prediction works
- [ ] Angle optimization works
- [ ] Prequalification works
- [ ] Simulation works
- [ ] Explainability endpoint returns SHAP values
- [ ] Batch scoring creates job and processes

## Calculations

- [ ] EMI calculation correct
- [ ] Subsidy calculation correct (central + state)
- [ ] ROI calculation correct

## Reports

- [ ] PDF generation works
- [ ] PDF cached in S3
- [ ] PDF download works

## Webhooks

- [ ] Decentro webhook signature validation
- [ ] Webhook processing updates records

## Security

- [ ] PII masking in logs
- [ ] Sensitive data encrypted
- [ ] Rate limiting works
- [ ] JWT tokens expire correctly
- [ ] Webhook signatures validated

## Performance

- [ ] API response times acceptable
- [ ] Database queries optimized
- [ ] Redis caching works
- [ ] S3 uploads/downloads fast

## Error Handling

- [ ] Invalid requests return 400
- [ ] Unauthorized requests return 401
- [ ] Not found returns 404
- [ ] Server errors return 500
- [ ] Error messages are clear

## Testing

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Test coverage > 80%

## Documentation

- [ ] API docs accessible at /api/docs
- [ ] README complete
- [ ] API contracts documented
- [ ] Decentro integration guide complete

