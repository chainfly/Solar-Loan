/**
 * API Client for Backend Integration
 * Base configuration and utilities for API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle empty responses
      let data: any = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const text = await response.text();
          data = text ? JSON.parse(text) : {};
        } catch {
          data = {};
        }
      }

      if (!response.ok) {
        const errorMessage = 
          data.detail || 
          data.message || 
          data.error ||
          (typeof data === 'string' ? data : null) ||
          `HTTP ${response.status}: ${response.statusText}`;
        
        return {
          error: errorMessage,
        };
      }

      return { data };
    } catch (error) {
      // Better error handling for network issues
      if (error instanceof TypeError) {
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          return {
            error: `Cannot connect to backend server. Please ensure the backend is running at ${this.baseURL.replace('/api', '')}. Check QUICK_FIX.md for setup instructions.`,
          };
        }
        return {
          error: `Network error: ${error.message}`,
        };
      }
      
      return {
        error: error instanceof Error ? error.message : 'Network error occurred. Please check if the backend server is running.',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          error: data.detail || data.message || `HTTP ${response.status}`,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
  }) => apiClient.post('/auth/register', data),

  login: async (data: { email: string; password: string }) => {
    const response = await apiClient.post<{
      access_token: string;
      refresh_token: string;
      token_type: string;
    }>('/auth/login', data);
    if (response.data) {
      apiClient.setToken(response.data.access_token);
    }
    return response;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    apiClient.setToken(null);
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<{
      access_token: string;
      refresh_token: string;
    }>('/auth/refresh', { refresh_token: refreshToken });
    if (response.data) {
      apiClient.setToken(response.data.access_token);
    }
    return response;
  },

  getMe: () => apiClient.get('/auth/me'),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    }),

  verifyEmail: (email: string, otp: string) =>
    apiClient.post('/auth/verify-email', {
      email,
      otp,
    }),

  resendVerification: (email: string) =>
    apiClient.post('/auth/resend-verification', {
      email,
    }),
};

// Loans API
export const loansApi = {
  create: (data: any) => apiClient.post('/loans', data),
  list: () => apiClient.get('/loans'),
  get: (id: string) => apiClient.get(`/loans/${id}`),
  update: (id: string, data: any) => apiClient.patch(`/loans/${id}`, data),
  submit: (id: string) => apiClient.post(`/loans/${id}/submit`),
};

// KYC API
export const kycApi = {
  verifyAadhaar: (xmlContent: string, shareCode: string, loanId?: string) =>
    apiClient.post('/kyc/aadhaar-xml', {
      xml_content: xmlContent,
      share_code: shareCode,
      loan_application_id: loanId,
    }),
  verifyPAN: (pan: string, name: string, loanId?: string) =>
    apiClient.post('/kyc/pan', {
      pan,
      name,
      loan_application_id: loanId,
    }),
  verifyBank: (
    accountNumber: string,
    ifsc: string,
    name: string,
    loanId?: string
  ) =>
    apiClient.post('/kyc/bank', {
      account_number: accountNumber,
      ifsc,
      name,
      loan_application_id: loanId,
    }),
  getStatus: (userId: string) => apiClient.get(`/kyc/status/${userId}`),
};

// Credit API
export const creditApi = {
  fetchCIBIL: (pan: string, consentText: string, loanId?: string) =>
    apiClient.post('/credit/cibil/fetch', {
      pan,
      consent_text: consentText,
      loan_application_id: loanId,
    }),
  getCIBILStatus: (jobId: string) =>
    apiClient.get(`/credit/cibil/status/${jobId}`),
  getUserCIBIL: (userId: string) => apiClient.get(`/credit/cibil/${userId}`),
};

// AI API
export const aiApi = {
  checkEligibility: (loanId: string, features?: any) =>
    apiClient.post('/ai/eligibility', {
      loan_application_id: loanId,
      features,
    }),
  predictROI: (
    loanId: string,
    systemCapacity: number,
    location: string,
    roofAngle?: number
  ) =>
    apiClient.post('/ai/roi-prediction', {
      loan_application_id: loanId,
      system_capacity_kw: systemCapacity,
      location,
      roof_angle: roofAngle,
    }),
  optimizeAngle: (
    loanId: string,
    latitude: number,
    longitude: number,
    roofArea: number
  ) =>
    apiClient.post('/ai/angle-optimization', {
      loan_application_id: loanId,
      latitude,
      longitude,
      roof_area_sqft: roofArea,
    }),
  prequal: (data: {
    annual_income: number;
    existing_loans: number;
    credit_score?: number;
    loan_amount: number;
    loan_tenure_years: number;
  }) => apiClient.post('/ai/prequal', data),
  explain: (loanId: string, predictionType?: string) =>
    apiClient.get(`/ai/explain/${loanId}?prediction_type=${predictionType || 'eligibility'}`),
};

// Calculations API
export const calculationsApi = {
  calculateEMI: (principal: number, interestRate: number, tenureYears: number) =>
    apiClient.post('/calculate/emi', {
      principal,
      interest_rate: interestRate,
      tenure_years: tenureYears,
    }),
  calculateSubsidy: (
    systemCapacity: number,
    state: string,
    systemType?: string
  ) =>
    apiClient.post('/calculate/subsidy', {
      system_capacity_kw: systemCapacity,
      state,
      system_type: systemType || 'residential',
    }),
};

// Documents API
export const documentsApi = {
  upload: async (
    file: File,
    documentType: string,
    loanId?: string
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    if (loanId) {
      formData.append('loan_application_id', loanId);
    }
    return apiClient.upload('/documents/upload', formData);
  },
  get: (id: string) => apiClient.get(`/documents/${id}`),
  processOCR: (id: string) => apiClient.post(`/documents/${id}/ocr`),
};

// Reports API
export const reportsApi = {
  getPDF: async (loanId: string): Promise<Blob | null> => {
    const url = `${API_BASE_URL}/report/${loanId}/pdf`;
    const token = apiClient.getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { headers });
      if (!response.ok) return null;
      return await response.blob();
    } catch {
      return null;
    }
  },
};

