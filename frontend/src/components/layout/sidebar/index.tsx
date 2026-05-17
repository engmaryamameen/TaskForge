'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { useCurrentOrganization, useCurrentOrgRole } from '@/features/organizations/hooks/useOrganizations';
import { NavItem } from './nav-item';
import {
  DashboardCardsIcon,
  ProjectsLayersIcon,
  TasksCircleCheckIcon,
  ActivityTimelineIcon,
  SettingsSlidersIcon,
  OrganizationsTeamIcon,
} from '@/assets/svg';
import { matchTasksSubNav } from '@/features/tasks/lib/task-subnav-match';

/* ── Navigation definitions ── */

interface NavEntry {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact: boolean;
  adminOnly?: boolean;
  subLinks?: { href: string; label: string }[];
}

const mainNav: NavEntry[] = [
  { href: '/', label: 'Dashboard', icon: DashboardCardsIcon, exact: true },
  { href: '/projects', label: 'Projects', icon: ProjectsLayersIcon, exact: false },
  {
    href: '/tasks',
    label: 'Tasks',
    icon: TasksCircleCheckIcon,
    exact: false,
    subLinks: [
      { href: '/tasks', label: 'Board view' },
      { href: '/tasks?assignee=me', label: 'My tasks' },
    ],
  },
  { href: '/activity', label: 'Activity', icon: ActivityTimelineIcon, exact: false },
];

const adminNav: NavEntry[] = [
  { href: '/organizations', label: 'Organizations', icon: OrganizationsTeamIcon, exact: false },
  { href: '/settings', label: 'Settings', icon: SettingsSlidersIcon, exact: false },
];

/* ── Component ── */

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { data: currentOrg } = useCurrentOrganization();
  const role = useCurrentOrgRole();

  const isAdmin = role === 'admin';

  function closeMobileSidebar() {
    setSidebarOpen(false);
  }

  function renderItem(item: NavEntry) {
    const isActive = item.exact
      ? pathname === item.href
      : pathname.startsWith(item.href);
    return (
      <NavItem
        key={item.href}
        href={item.href}
        label={item.label}
        icon={item.icon}
        isActive={isActive}
        onClick={closeMobileSidebar}
        subLinks={item.subLinks}
        subLinkIsActive={
          item.href === '/tasks'
            ? (subHref) => matchTasksSubNav(pathname, searchParams, subHref)
            : undefined
        }
      />
    );
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileSidebar}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-neutral-200 bg-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:relative md:z-auto md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* ── Org header ── */}
        <div className="shrink-0 px-4 pt-4 pb-3">
          {currentOrg ? (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-[11px] font-bold text-white">
                {currentOrg.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-neutral-900 truncate leading-tight">{currentOrg.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  {role ?? 'Member'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 animate-shimmer rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-20 animate-shimmer rounded" />
                <div className="h-2.5 w-12 animate-shimmer rounded" />
              </div>
            </div>
          )}
        </div>

        <div className="mx-4 h-px bg-neutral-100" />

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-2.5 pt-3 pb-2">
          <div className="space-y-0.5">
            {mainNav.map(renderItem)}
          </div>

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="mx-1 my-3 h-px bg-neutral-100" />
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Admin
              </p>
              <div className="space-y-0.5">
                {adminNav.map(renderItem)}
              </div>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
