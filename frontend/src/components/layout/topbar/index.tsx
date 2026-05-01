'use client';

import { useUIStore } from '@/store/ui.store';
import { useSocketStatus } from '@/hooks/useSocketStatus';
import { UserMenu } from './user-menu';
import { NotificationDropdown } from './notification-dropdown';
import { IconMenu } from '@/components/icons';

export function Topbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { connected } = useSocketStatus();

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
          aria-label="Toggle sidebar"
        >
          <IconMenu />
        </button>

        {!connected && (
          <span className="text-xs text-amber-600 animate-pulse">
            Reconnecting...
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <NotificationDropdown />
        <UserMenu />
      </div>
    </header>
  );
}
