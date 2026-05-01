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
    <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden"
          aria-label="Toggle sidebar"
        >
          <IconMenu className="h-4 w-4" />
        </button>

        {!connected && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 animate-pulse">
            Reconnecting...
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <NotificationDropdown />
        <UserMenu />
      </div>
    </header>
  );
}
