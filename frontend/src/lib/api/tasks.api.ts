import { apiClient } from './client';
import { normalizeError } from './errors';
import type { ApiResponse, Task, TaskFilters, TaskStatus, TaskPriority } from '@/types';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export const tasksApi = {
  create(projectId: string, payload: CreateTaskPayload) {
    return apiClient.post<ApiResponse<Task>>(
      `/projects/${projectId}/tasks`,
      payload,
    ).catch(normalizeError);
  },

  listByProject(projectId: string, params?: TaskFilters) {
    return apiClient.get<ApiResponse<Task[]>>(
      `/projects/${projectId}/tasks`,
      { params },
    ).catch(normalizeError);
  },

  listAll(params?: TaskFilters) {
    return apiClient.get<ApiResponse<Task[]>>('/tasks', { params })
      .catch(normalizeError);
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<Task>>(`/tasks/${id}`)
      .catch(normalizeError);
  },

  update(id: string, payload: UpdateTaskPayload) {
    return apiClient.patch<ApiResponse<Task>>(`/tasks/${id}`, payload)
      .catch(normalizeError);
  },

  delete(id: string) {
    return apiClient.delete<ApiResponse<void>>(`/tasks/${id}`)
      .catch(normalizeError);
  },
};
