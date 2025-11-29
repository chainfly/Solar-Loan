# Email Verification Setup Guide

## Overview

Email verification is now fully integrated between frontend and backend. The flow works as follows:

1. **User Registration** (Step 1 & 2) → User fills account and profile info
2. **Registration API Call** → When moving to Step 3, user is registered and OTP is generated
3. **Email Verification** (Step 3) → User enters 6-digit OTP code
4. **Verification API Call** → OTP is verified against Redis cache
5. **Success** → User is marked as verified and redirected to login

## Backend Implementation

### New Endpoints

1. **POST /api/auth/verify-email**
   - Verifies email with 6-digit OTP
   - Request: `{ "email": "user@example.com", "otp": "123456" }`
   - Response: User object with `is_verified: true`

2. **POST /api/auth/resend-verification**
   - Resends verification code
   - Request: `{ "email": "user@example.com" }`
   - Response: Success message

### How It Works

1. **Registration** (`AuthService.register`):
   - Generates 6-digit OTP (100000-999999)
   - Stores OTP in Redis with 10-minute expiration
   - Stores OTP in user's `verification_token` field
   - Logs OTP (in development, for testing)

2. **Verification** (`AuthService.verify_email`):
   - Checks OTP in Redis
   - Validates OTP matches
   - Marks user as verified
   - Deletes OTP from Redis

3. **Resend** (`AuthService.resend_verification_code`):
   - Generates new OTP
   - Updates Redis and database
   - Logs new OTP

## Frontend Implementation

### Updated Components

1. **Signup.tsx**:
   - Calls `authApi.register()` when moving from Step 2 to Step 3
   - Shows loading state during registration
   - Passes email to verification step

2. **SignupStep3Verify.tsx**:
   - Calls `authApi.verifyEmail()` when user submits OTP
   - Calls `authApi.resendVerification()` for resend
   - Shows countdown timer (30 seconds)
   - Handles errors and success states

### API Client Methods

```typescript
// Verify email
authApi.verifyEmail(email, otp)

// Resend verification code
authApi.resendVerification(email)
```

## Testing

### Development Mode

In development, OTPs are logged to console/backend logs:

```bash
# Backend logs will show:
User registered: user@example.com (OTP: 123456)
```

### Testing Flow

1. **Start Backend:**
   ```bash
   cd backend
   docker-compose up -d
   # Check logs for OTP
   docker-compose logs -f backend
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Test Registration:**
   - Go to `/auth/signup`
   - Fill Step 1 (Account) → Next
   - Fill Step 2 (Profile) → Register & Verify
   - Check backend logs for OTP
   - Enter OTP in Step 3
   - Should redirect to login

### Getting OTP for Testing

**Option 1: Check Backend Logs**
```bash
docker-compose logs backend | grep OTP
```

**Option 2: Check Redis (if needed)**
```bash
docker-compose exec redis redis-cli
> GET email_verification:user@example.com
```

**Option 3: Check Database**
```bash
docker-compose exec postgres psql -U postgres -d solar_loan_ai
> SELECT email, verification_token FROM users WHERE email = 'user@example.com';
```

## Production Setup

### Email Service Integration

Currently, OTPs are only logged. For production, integrate an email service:

1. **Update `AuthService.register`:**
   ```python
   from app.services.decentro_service import DecentroService
   
   decentro = DecentroService()
   await decentro.send_email(
       email=user.email,
       subject="Verify Your ChainFly Account",
       body=f"Your verification code is: {otp}"
   )
   ```

2. **Update `AuthService.resend_verification_code`:**
   ```python
   await decentro.send_email(
       email=user.email,
       subject="Your New Verification Code",
       body=f"Your new verification code is: {otp}"
   )
   ```

### Environment Variables

Make sure these are set:
```env
USE_MOCKS=false  # Set to false for real email sending
DECENTRO_BYTES_MODULE_SECRET=your_secret  # For email service
```

## Error Handling

### Common Errors

1. **"Invalid or expired verification code"**
   - OTP expired (10 minutes)
   - Wrong OTP entered
   - OTP already used

2. **"Email already verified"**
   - User already verified
   - Try logging in instead

3. **"User not found"**
   - Registration didn't complete
   - Start signup process again

## Security Features

- ✅ OTP expires in 10 minutes
- ✅ OTP stored in Redis (not in database after verification)
- ✅ Rate limiting on resend (5 per minute)
- ✅ OTP deleted after successful verification
- ✅ One-time use OTP

## Next Steps

1. ✅ Backend endpoints created
2. ✅ Frontend integration complete
3. ⏳ Add email service integration (Decentro or SMTP)
4. ⏳ Add email templates
5. ⏳ Add email delivery tracking

## API Examples

### Verify Email
```bash
curl -X POST "http://localhost:8000/api/auth/verify-email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

### Resend Verification
```bash
curl -X POST "http://localhost:8000/api/auth/resend-verification" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

