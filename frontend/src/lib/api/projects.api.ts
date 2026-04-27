import { apiClient } from './client';
import type { ApiResponse, Project, PaginationParams } from '@/types';

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export const projectsApi = {
  create(payload: CreateProjectPayload) {
    return apiClient.post<ApiResponse<Project>>('/projects', payload);
  },

  list(params?: PaginationParams) {
    return apiClient.get<ApiResponse<Project[]>>('/projects', { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
  },

  update(id: string, payload: UpdateProjectPayload) {
    return apiClient.patch<ApiResponse<Project>>(`/projects/${id}`, payload);
  },

  delete(id: string) {
    return apiClient.delete<ApiResponse<void>>(`/projects/${id}`);
  },
};
