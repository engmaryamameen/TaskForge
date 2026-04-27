import { apiClient } from './client';
import type { ApiResponse, Activity, PaginationParams } from '@/types';

export const activityApi = {
  list(params?: PaginationParams) {
    return apiClient.get<ApiResponse<Activity[]>>('/activity', { params });
  },
};
