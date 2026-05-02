'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  tasksApi,
  type CreateTaskPayload,
  type UpdateTaskPayload,
} from '@/lib/api/tasks.api';
import { useOrgWorkspaceContext } from '@/features/organizations/hooks/useOrgWorkspaceContext';
import type { TaskFilters, Task, ApiResponse } from '@/types';

function normalizeFilters(filters?: TaskFilters): TaskFilters | undefined {
  if (!filters) return undefined;
  return {
    ...filters,
    search: filters.search?.trim() || undefined,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    assignedTo: filters.assignedTo || undefined,
  };
}

export const taskKeys = {
  all: ['tasks'] as const,
  list: (filters?: TaskFilters) => ['tasks', 'list', normalizeFilters(filters)] as const,
  byProject: (projectId: string, filters?: TaskFilters) =>
    ['tasks', 'project', projectId, normalizeFilters(filters)] as const,
  detail: (id: string) => ['tasks', 'detail', id] as const,
};

export function useTasks(filters?: TaskFilters) {
  const normalized = normalizeFilters(filters);
  const { hasValidOrgContext } = useOrgWorkspaceContext();

  return useQuery({
    queryKey: taskKeys.list(normalized),
    queryFn: () => tasksApi.listAll(normalized).then((r) => r.data),
    enabled: hasValidOrgContext,
  });
}

export function useTasksByProject(projectId: string, filters?: TaskFilters) {
  const normalized = normalizeFilters(filters);
  const { hasValidOrgContext } = useOrgWorkspaceContext();

  return useQuery({
    queryKey: taskKeys.byProject(projectId, normalized),
    queryFn: () =>
      tasksApi.listByProject(projectId, normalized).then((r) => r.data),
    enabled: !!projectId && hasValidOrgContext,
  });
}

export function useTask(id: string) {
  const { hasValidOrgContext } = useOrgWorkspaceContext();

  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksApi.getById(id).then((r) => r.data.data!),
    enabled: !!id && hasValidOrgContext,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: CreateTaskPayload;
    }) => tasksApi.create(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) =>
      tasksApi.update(id, payload),
    onMutate: async ({ id, payload }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      // Snapshot all task caches for rollback
      const previousData = queryClient.getQueriesData<ApiResponse<Task[]>>({
        queryKey: taskKeys.all,
      });

      // Optimistically update task across all matching caches
      queryClient.setQueriesData<ApiResponse<Task[]>>(
        { queryKey: taskKeys.all },
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((t) =>
              t.id === id ? { ...t, ...payload } : t,
            ),
          };
        },
      );

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      // Rollback all caches on error
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: (_data, _err, { id }) => {
      // Reconcile with server
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
