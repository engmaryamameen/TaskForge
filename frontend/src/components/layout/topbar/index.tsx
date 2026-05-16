'use client';

import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { useSocketStatus } from '@/hooks/useSocketStatus';
import { UserMenu } from './user-menu';
import { NotificationDropdown } from './notification-dropdown';
import { IconMenu, IconChevronRight } from '@/components/icons';

interface Crumb {
  label: string;
  href?: string;
}

function buildBreadcrumbs(pathname: string): Crumb[] {
  if (pathname === '/') return [{ label: 'Overview' }];
  if (pathname === '/projects') return [{ label: 'Projects' }];
  if (pathname.startsWith('/projects/'))
    return [{ label: 'Projects', href: '/projects' }, { label: 'Project Details' }];
  if (pathname === '/tasks') return [{ label: 'Tasks' }];
  if (pathname === '/organizations') return [{ label: 'Organizations' }];
  if (pathname === '/activity') return [{ label: 'Activity' }];
  if (pathname === '/settings') return [{ label: 'Settings' }];
  return [{ label: 'Overview' }];
}

export function Topbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { connected } = useSocketStatus();
  const pathname = usePathname();
  const crumbs = buildBreadcrumbs(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors md:hidden"
          aria-label="Toggle sidebar"
        >
          <IconMenu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <IconChevronRight className="h-3.5 w-3.5 text-neutral-300" />}
                {isLast ? (
                  <span className="text-sm font-semibold text-neutral-900">{crumb.label}</span>
                ) : (
                  <span className="text-sm text-neutral-400">{crumb.label}</span>
                )}
              </span>
            );
          })}
        </nav>

        {/* Mobile: show current page name */}
        <span className="text-sm font-semibold text-neutral-900 md:hidden">
          {crumbs[crumbs.length - 1].label}
        </span>

        {!connected && (
          <span className="rounded-full bg-warning-50 px-2.5 py-1 text-[11px] font-medium text-warning-700 ring-1 ring-warning-500/20 animate-pulse">
            Reconnecting...
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <NotificationDropdown />
        <UserMenu />
      </div>
    </header>
  );
}
