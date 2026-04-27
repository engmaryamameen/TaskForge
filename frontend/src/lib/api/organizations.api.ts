import { apiClient } from './client';
import type { ApiResponse, Organization, Membership, Role } from '@/types';

export interface CreateOrganizationPayload {
  name: string;
}

export interface CreateInvitePayload {
  email?: string;
  role?: Role;
}

export const organizationsApi = {
  create(payload: CreateOrganizationPayload) {
    return apiClient.post<ApiResponse<Organization>>('/organizations', payload);
  },

  list() {
    return apiClient.get<ApiResponse<Organization[]>>('/organizations');
  },

  switchOrg(organizationId: string) {
    return apiClient.post<ApiResponse<void>>('/organizations/switch', {
      organizationId,
    });
  },

  getCurrent() {
    return apiClient.get<ApiResponse<Organization>>('/organizations/current');
  },

  getMembers() {
    return apiClient.get<ApiResponse<Membership[]>>('/organizations/members');
  },

  createInvite(payload: CreateInvitePayload) {
    return apiClient.post<ApiResponse<{ token: string }>>(
      '/organizations/invites',
      payload,
    );
  },
};
