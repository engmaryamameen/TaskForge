import { apiClient } from './client';
import { normalizeError } from './errors';
import type { ApiResponse, Organization, Membership, Role, PendingInvite } from '@/types';

export interface CreateOrganizationPayload {
  name: string;
}

export interface CreateInvitePayload {
  email: string;
  role?: Role;
}

export const organizationsApi = {
  create(payload: CreateOrganizationPayload) {
    return apiClient.post<ApiResponse<Organization>>('/organizations', payload)
      .catch(normalizeError);
  },

  list() {
    return apiClient.get<ApiResponse<Organization[]>>('/organizations')
      .catch(normalizeError);
  },

  switchOrg(organizationId: string) {
    return apiClient.post<ApiResponse<void>>('/organizations/switch', {
      organizationId,
    }).catch(normalizeError);
  },

  getCurrent() {
    return apiClient.get<ApiResponse<Organization>>('/organizations/current')
      .catch(normalizeError);
  },

  getMembers() {
    return apiClient.get<ApiResponse<Membership[]>>('/organizations/members')
      .catch(normalizeError);
  },

  listPendingInvites() {
    return apiClient.get<ApiResponse<PendingInvite[]>>('/organizations/invites')
      .catch(normalizeError);
  },

  createInvite(payload: CreateInvitePayload) {
    return apiClient.post<ApiResponse<{ emailSent: boolean }>>(
      '/organizations/invites',
      payload,
    ).catch(normalizeError);
  },

  resendInvite(inviteId: string) {
    return apiClient.post<ApiResponse<{ emailSent: boolean }>>(
      `/organizations/invites/${inviteId}/resend`,
    ).catch(normalizeError);
  },

  validateInvite(token: string) {
    return apiClient.get<ApiResponse<{ organizationName: string; email: string | null; role: string }>>(
      '/invitations/validate',
      { params: { token } },
    ).catch(normalizeError);
  },

  acceptInvite(token: string) {
    return apiClient.post<ApiResponse<Membership>>(
      '/invitations/accept',
      { token },
    ).catch(normalizeError);
  },
};
