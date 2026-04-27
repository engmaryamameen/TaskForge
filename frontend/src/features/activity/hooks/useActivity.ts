'use client';

import { useQuery } from '@tanstack/react-query';
import { activityApi } from '@/lib/api/activity.api';
import type { PaginationParams } from '@/types';

export const activityKeys = {
  all: ['activity'] as const,
  list: (params?: PaginationParams) => ['activity', 'list', params] as const,
};

export function useActivity(params?: PaginationParams) {
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: () => activityApi.list(params).then((r) => r.data),
  });
}
