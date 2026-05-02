import { create } from 'zustand';

const MAX_NOTIFICATIONS = 50;
const DEDUP_WINDOW_MS = 2000;

export interface AppNotification {
  id: string;
  type: string;
  message: string;
  entityId?: string;
  entityType?: 'task' | 'project' | 'organization';
  actorId: string;
  createdAt: string;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: AppNotification) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (n) => {
    const { notifications } = get();

    // Dedup: same type + entityId within window
    const isDuplicate = notifications.some(
      (existing) =>
        existing.type === n.type &&
        existing.entityId === n.entityId &&
        Date.now() - new Date(existing.createdAt).getTime() < DEDUP_WINDOW_MS,
    );
    if (isDuplicate) return;

    const updated = [n, ...notifications].slice(0, MAX_NOTIFICATIONS);
    set({
      notifications: updated,
      unreadCount: updated.filter((x) => !x.read).length,
    });
  },

  markAllRead: () => {
    // Fire-and-forget API call
    import('@/lib/api/notifications.api').then(({ notificationsApi }) => {
      notificationsApi.markAllAsRead().catch(() => {});
    });
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  clearNotifications: () =>
    set({ notifications: [], unreadCount: 0 }),
}));
