'use client';

import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/store/notification.store';
import { useClickOutside } from '@/hooks/useClickOutside';
import { IconBell } from '@/components/icons';
import { formatRelative } from '@/lib/utils';

const ROUTE_MAP: Record<string, (id: string) => string> = {
  task: (id) => `/tasks`,
  project: (id) => `/projects/${id}`,
  organization: () => '/organizations',
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
        className="relative rounded-md p-2 text-neutral-500 hover:bg-neutral-100 transition-colors"
        aria-label="Notifications"
      >
        <IconBell />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-neutral-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-neutral-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-neutral-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n.entityType, n.entityId)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50 ${
                    !n.read ? 'bg-primary-50/50' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-900">{n.message}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {formatRelative(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
