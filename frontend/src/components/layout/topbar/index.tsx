'use client';

import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { useSocketStatus } from '@/hooks/useSocketStatus';
import { UserMenu } from './user-menu';
import { NotificationDropdown } from './notification-dropdown';
import { IconMenu } from '@/components/icons';

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
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(path) && path !== '/') return title;
  }
  return 'Dashboard';
}

export function Topbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { connected } = useSocketStatus();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-neutral-200/80 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors md:hidden"
          aria-label="Toggle sidebar"
        >
          <IconMenu className="h-5 w-5" />
        </button>

        <div className="hidden md:block">
          <h1 className="text-base font-semibold text-neutral-900">{pageTitle}</h1>
        </div>

        {!connected && (
          <span className="rounded-full bg-warning-50 px-2.5 py-1 text-[11px] font-medium text-warning-700 ring-1 ring-warning-500/20 animate-pulse">
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
