import { apiClient } from './client';
import { normalizeError } from './errors';

export interface Notification {
  id: string;
  userId: string;
  organizationId: string;
  type: string;
  title: string;
  message: string | null;
  entityType: string | null;
  entityId: string | null;
  read: boolean;
  actorId: string | null;
  createdAt: string;
  actor?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export const notificationsApi = {
  list(params?: { page?: number; limit?: number }) {
    return apiClient
      .get<{ data: Notification[]; meta: { page: number; total: number } }>('/notifications', { params })
      .catch(normalizeError);
  },

  unreadCount() {
    return apiClient
      .get<{ count: number }>('/notifications/unread-count')
      .catch(normalizeError);
  },

  markAsRead(id: string) {
    return apiClient
      .post(`/notifications/${id}/read`)
      .catch(normalizeError);
  },

  markAllAsRead() {
    return apiClient
      .post('/notifications/read-all')
      .catch(normalizeError);
  },
};
