import { apiClient } from './client';
import { normalizeError } from './errors';
import type { ApiResponse, Activity, ActivityListParams } from '@/types';

export const activityApi = {
  list(params?: ActivityListParams) {
    return apiClient.get<ApiResponse<Activity[]>>('/activity', { params })
      .catch(normalizeError);
  },
};
