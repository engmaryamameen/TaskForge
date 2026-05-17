'use client';

import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { useThemeStore } from '@/store/theme.store';
import { useSocketStatus } from '@/hooks/useSocketStatus';
import { useCurrentOrganization } from '@/features/organizations/hooks/useOrganizations';
import { NotificationDropdown } from './notification-dropdown';
import { IconMenu } from '@/components/icons';
import { IconSun } from '@/assets/svg/icon-sun';
import { IconMoon } from '@/assets/svg/icon-moon';


const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/organizations': 'Organizations',
  '/activity': 'Activity',
  '/settings': 'Settings',
};

function ThemeToggle() {
  const { resolved, setTheme } = useThemeStore();
  const isDark = resolved === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
    </button>
  );
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/projects/')) return 'Project Details';
  return 'Dashboard';
}

export function Topbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { connected } = useSocketStatus();
  const { data: currentOrg } = useCurrentOrganization();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 bg-white px-4 shadow-soft border-b border-neutral-200 md:px-5">
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors md:hidden"
          aria-label="Toggle sidebar"
        >
          <IconMenu className="h-5 w-5" />
        </button>

        <nav className="flex items-center gap-1.5 min-w-0 text-sm">
          {currentOrg && (
            <>
              <span className="text-neutral-500 truncate max-w-48 hidden sm:inline">{currentOrg.name}</span>
              <span className="text-neutral-300 hidden sm:inline">/</span>
            </>
          )}
          <span className="font-semibold text-neutral-800 truncate">{pageTitle}</span>
        </nav>

        {!connected && (
          <span className="shrink-0 rounded-full bg-warning-50 px-2 py-0.5 text-[11px] font-medium text-warning-700 ring-1 ring-warning-500/20 animate-pulse">
            Reconnecting
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 ml-auto shrink-0">
        <ThemeToggle />
        <NotificationDropdown />
      </div>
    </header>
  );
}
