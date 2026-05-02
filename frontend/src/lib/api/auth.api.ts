import { apiClient } from './client';
import { normalizeError } from './errors';
import type { ApiResponse } from '@/types';
import type { User } from '@/types';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignupSuccessPayload {
  message: string;
  nextStep: 'VERIFY_EMAIL';
  email: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
}

export const authApi = {
  register(payload: RegisterPayload) {
    return apiClient
      .post<ApiResponse<SignupSuccessPayload>>('/auth/register', payload)
      .catch(normalizeError);
  },

  verifyEmail(token: string) {
    return apiClient
      .post<
        ApiResponse<{
          message: string;
          user: User;
          accessToken: string;
          refreshToken: string;
        }>
      >('/auth/verify-email', { token })
      .catch(normalizeError);
  },

  resendVerificationEmail(email: string) {
    return apiClient
      .post<ApiResponse<{ message: string }>>('/auth/resend-verification-email', {
        email,
      })
      .catch(normalizeError);
  },

  forgotPassword(email: string) {
    return apiClient
      .post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email })
      .catch(normalizeError);
  },

  resetPassword(token: string, password: string) {
    return apiClient
      .post<ApiResponse<{ message: string }>>('/auth/reset-password', {
        token,
        password,
      })
      .catch(normalizeError);
  },

  login(payload: LoginPayload) {
    return apiClient
      .post<ApiResponse<AuthTokens>>('/auth/login', payload)
      .catch(normalizeError);
  },

  refresh(refreshToken: string) {
    return apiClient
      .post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
        '/auth/refresh',
        { refreshToken },
      )
      .catch(normalizeError);
  },

  me() {
    return apiClient
      .get<ApiResponse<{ user: User }>>('/auth/me')
      .catch(normalizeError);
  },

  updateProfile(payload: UpdateProfilePayload) {
    return apiClient
      .patch<ApiResponse<{ user: User }>>('/auth/me', payload)
      .catch(normalizeError);
  },

  logout() {
    return apiClient.post('/auth/logout').catch(normalizeError);
  },
};
