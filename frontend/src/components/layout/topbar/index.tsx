'use client';

import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { useSocketStatus } from '@/hooks/useSocketStatus';
import { useCommandPalette } from '@/features/command/use-command-palette';
import { SearchInput } from './search-input';
import { NotificationDropdown } from './notification-dropdown';
import { IconMenu } from '@/components/icons';
import { SearchIcon } from '@/assets/svg';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/organizations': 'Organizations',
  '/activity': 'Activity',
  '/settings': 'Settings',
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/projects/')) return 'Project Details';
  return 'Dashboard';
}

export function Topbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { connected } = useSocketStatus();
  const { open: openPalette } = useCommandPalette();
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4 md:px-5">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors md:hidden"
          aria-label="Toggle sidebar"
        >
          <IconMenu className="h-5 w-5" />
        </button>

        <h1 className="text-sm font-semibold text-neutral-800 truncate">{title}</h1>

        {!connected && (
          <span className="shrink-0 rounded-full bg-warning-50 px-2 py-0.5 text-[11px] font-medium text-warning-700 ring-1 ring-warning-500/20 animate-pulse">
            Reconnecting
          </span>
        )}
      </div>

      <div className="hidden md:block flex-1 max-w-md mx-auto">
        <SearchInput />
      </div>

      <div className="flex items-center gap-1 ml-auto shrink-0">
        <button
          onClick={() => openPalette()}
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors md:hidden"
          aria-label="Search"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
        <NotificationDropdown />
      </div>
    </header>
  );
}
