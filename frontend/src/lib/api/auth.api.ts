import { apiClient } from './client';
import { normalizeError } from './errors';
import type { ApiResponse } from '@/types';
import type { User } from '@/types';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
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

export const authApi = {
  register(payload: RegisterPayload) {
    return apiClient.post<ApiResponse<AuthTokens>>('/auth/register', payload)
      .catch(normalizeError);
  },

  login(payload: LoginPayload) {
    return apiClient.post<ApiResponse<AuthTokens>>('/auth/login', payload)
      .catch(normalizeError);
  },

  refresh(refreshToken: string) {
    return apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh',
      { refreshToken },
    ).catch(normalizeError);
  },

  me() {
    return apiClient.get<ApiResponse<{ user: User }>>('/auth/me')
      .catch(normalizeError);
  },

  logout() {
    return apiClient.post('/auth/logout')
      .catch(normalizeError);
  },
};
