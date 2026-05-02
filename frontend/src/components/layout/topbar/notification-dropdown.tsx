'use client';

import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/store/notification.store';
import { useClickOutside } from '@/hooks/useClickOutside';
import { IconBell, IconInbox } from '@/components/icons';
import { formatRelative } from '@/lib/utils';

const ROUTE_MAP: Record<string, (id: string) => string> = {
  task: () => `/tasks`,
  project: (id) => `/projects/${id}`,
  organization: () => '/organizations',
  notification: () => '/activity',
};

const TYPE_ICONS: Record<string, { bg: string; emoji: string }> = {
  task_assigned: { bg: 'bg-primary-100', emoji: '\u{1F4CB}' },
  task_updated: { bg: 'bg-warning-100', emoji: '\u{270F}\u{FE0F}' },
  member_joined: { bg: 'bg-success-100', emoji: '\u{1F44B}' },
  member_invited: { bg: 'bg-purple-100', emoji: '\u{2709}\u{FE0F}' },
  default: { bg: 'bg-neutral-100', emoji: '\u{1F514}' },
};

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsOpen(false), []);
  useClickOutside(ref, close);
  const router = useRouter();

  const { notifications, unreadCount, markAllRead } = useNotificationStore();

  function handleClick(entityType?: string, entityId?: string) {
    if (entityType && entityId) {
      const getRoute = ROUTE_MAP[entityType];
      if (getRoute) {
        router.push(getRoute(entityId));
      }
    }
    close();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
        aria-label="Notifications"
      >
        <IconBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-96 rounded-xl border border-neutral-200 bg-white shadow-overlay animate-slide-down">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-neutral-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-100 px-1.5 text-[10px] font-semibold text-danger-600">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center px-5 py-10 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
                  <IconInbox className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-neutral-700">All caught up</p>
                <p className="mt-0.5 text-xs text-neutral-500">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => {
                const typeConfig = TYPE_ICONS[n.type || ''] || TYPE_ICONS.default;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n.entityType, n.entityId)}
                    className={`flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-neutral-50 border-b border-neutral-50 last:border-0 ${
                      !n.read ? 'bg-primary-50/40' : ''
                    }`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${typeConfig.bg} text-sm`}>
                      {typeConfig.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-800 leading-snug">{n.message}</p>
                      <p className="mt-1 text-[11px] text-neutral-400">
                        {formatRelative(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
