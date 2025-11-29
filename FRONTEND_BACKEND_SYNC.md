# Frontend-Backend Sync Status

## Current Status: ⚠️ **NOT FULLY SYNCED**

### What's Complete ✅

1. **Backend API Endpoints** - All endpoints are implemented:
   - ✅ Authentication (register, login, refresh, logout, forgot/reset password, me)
   - ✅ Loans (CRUD, submit)
   - ✅ KYC (Aadhaar, PAN, Bank, CKYC)
   - ✅ Credit (CIBIL fetch, status)
   - ✅ AI/ML (eligibility, ROI, angle optimization, prequal, simulate, explain)
   - ✅ Calculations (EMI, subsidy)
   - ✅ Documents (upload, get, OCR)
   - ✅ Reports (PDF generation)

2. **API Client Created** - `src/lib/api.ts` provides:
   - ✅ API client with token management
   - ✅ All API methods matching backend endpoints
   - ✅ Type-safe interfaces

### What Needs Integration 🔄

The frontend currently uses **mock/simulated API calls**. These files need to be updated:

1. **`src/pages/auth/Login.tsx`**
   - Currently: Mock setTimeout
   - Needs: `authApi.login()` call

2. **`src/pages/auth/Signup.tsx`**
   - Currently: Mock implementation
   - Needs: `authApi.register()` call

3. **`src/pages/auth/ForgotPassword.tsx`**
   - Currently: Mock API call
   - Needs: `authApi.forgotPassword()` call

4. **`src/pages/auth/ResetPassword.tsx`**
   - Currently: Mock API call
   - Needs: `authApi.resetPassword()` call

5. **`src/components/loan/LoanApplicationForm.tsx`**
   - Currently: Mock setTimeout
   - Needs: `loansApi.create()` and `loansApi.submit()` calls

6. **Document Upload Steps**
   - Needs: `documentsApi.upload()` integration

7. **KYC Steps** (if any)
   - Needs: `kycApi` methods integration

8. **Dashboard/Status Pages**
   - Needs: `loansApi.list()` and `loansApi.get()` calls

## Integration Steps

### Step 1: Add Environment Variable
Create `.env` file in root:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Step 2: Update Login Component
Replace mock with:
```typescript
import { authApi } from '@/lib/api';

const onSubmit = async (data: LoginFormData) => {
  setIsLoading(true);
  const response = await authApi.login(data);
  if (response.error) {
    toast({
      title: "Login Failed",
      description: response.error,
      variant: "destructive",
    });
  } else {
    toast({
      title: "Login Successful",
      description: "Welcome back!",
    });
    navigate("/dashboard");
  }
  setIsLoading(false);
};
```

### Step 3: Update Loan Application Form
Replace mock with:
```typescript
import { loansApi } from '@/lib/api';

const handleSubmit = async () => {
  // Create loan
  const createResponse = await loansApi.create(formData);
  if (createResponse.error) {
    toast({
      title: "Error",
      description: createResponse.error,
      variant: "destructive",
    });
    return;
  }

  // Submit loan
  const submitResponse = await loansApi.submit(createResponse.data.id);
  if (submitResponse.error) {
    toast({
      title: "Submission Error",
      description: submitResponse.error,
      variant: "destructive",
    });
    return;
  }

  toast({
    title: "Application Submitted!",
    description: "Processing your loan application...",
  });
  onComplete();
};
```

### Step 4: Add Token Refresh Interceptor
Add to `src/lib/api.ts`:
```typescript
// Auto-refresh token on 401
// Add to request method
if (response.status === 401 && this.token) {
  // Try refresh token
  const refreshToken = localStorage.getItem('refresh_token');
  if (refreshToken) {
    const refreshResponse = await authApi.refreshToken(refreshToken);
    if (refreshResponse.data) {
      // Retry original request
      return this.request<T>(endpoint, options);
    }
  }
}
```

## API Endpoint Mapping

| Frontend Need | Backend Endpoint | Status |
|--------------|------------------|--------|
| User Login | `POST /api/auth/login` | ✅ Ready |
| User Register | `POST /api/auth/register` | ✅ Ready |
| Get Current User | `GET /api/auth/me` | ✅ Ready |
| Create Loan | `POST /api/loans` | ✅ Ready |
| List Loans | `GET /api/loans` | ✅ Ready |
| Get Loan | `GET /api/loans/{id}` | ✅ Ready |
| Submit Loan | `POST /api/loans/{id}/submit` | ✅ Ready |
| Upload Document | `POST /api/documents/upload` | ✅ Ready |
| Verify Aadhaar | `POST /api/kyc/aadhaar-xml` | ✅ Ready |
| Verify PAN | `POST /api/kyc/pan` | ✅ Ready |
| Fetch CIBIL | `POST /api/credit/cibil/fetch` | ✅ Ready |
| Check Eligibility | `POST /api/ai/eligibility` | ✅ Ready |
| Calculate EMI | `POST /api/calculate/emi` | ✅ Ready |
| Calculate Subsidy | `POST /api/calculate/subsidy` | ✅ Ready |
| Generate PDF | `GET /api/report/{id}/pdf` | ✅ Ready |

## Testing Sync

1. Start backend: `cd backend && docker-compose up` or `uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Test login flow
4. Test loan creation
5. Test document upload
6. Verify API calls in browser DevTools Network tab

## Next Steps

1. ✅ API client created (`src/lib/api.ts`)
2. ⏳ Update Login component
3. ⏳ Update Signup component
4. ⏳ Update Loan Application Form
5. ⏳ Update Document Upload
6. ⏳ Add error handling
7. ⏳ Add loading states
8. ⏳ Test end-to-end flow

