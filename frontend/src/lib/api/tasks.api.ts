import { apiClient } from './client';
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
    );
  },

  listByProject(projectId: string, params?: TaskFilters) {
    return apiClient.get<ApiResponse<Task[]>>(
      `/projects/${projectId}/tasks`,
      { params },
    );
  },

  listAll(params?: TaskFilters) {
    return apiClient.get<ApiResponse<Task[]>>('/tasks', { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
  },

  update(id: string, payload: UpdateTaskPayload) {
    return apiClient.patch<ApiResponse<Task>>(`/tasks/${id}`, payload);
  },

  delete(id: string) {
    return apiClient.delete<ApiResponse<void>>(`/tasks/${id}`);
  },
};
