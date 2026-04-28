'use client';

import { useUIStore } from '@/store/ui.store';
import { UserMenu } from './user-menu';
import { IconMenu } from '@/components/icons';

export function Topbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      <button
        onClick={toggleSidebar}
        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
        aria-label="Toggle sidebar"
      >
        <IconMenu />
      </button>

      <div className="flex-1" />

      <UserMenu />
    </header>
  );
}
