import { apiClient } from './client';
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
    return apiClient.post<ApiResponse<AuthTokens>>('/auth/register', payload);
  },

  login(payload: LoginPayload) {
    return apiClient.post<ApiResponse<AuthTokens>>('/auth/login', payload);
  },

  refresh(refreshToken: string) {
    return apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh',
      { refreshToken },
    );
  },

  logout() {
    return apiClient.post('/auth/logout');
  },
};
