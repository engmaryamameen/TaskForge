import { apiClient } from './client';
import { normalizeError } from './errors';
import type { ApiResponse, Activity, PaginationParams } from '@/types';

export const activityApi = {
  list(params?: PaginationParams) {
    return apiClient.get<ApiResponse<Activity[]>>('/activity', { params })
      .catch(normalizeError);
  },
};
