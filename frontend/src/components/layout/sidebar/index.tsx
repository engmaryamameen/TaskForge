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

const navigation: NavEntry[] = [
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
  { href: '/organizations', label: 'Members', icon: OrganizationsTeamIcon, exact: false, adminOnly: true },
  { href: '/settings', label: 'Settings', icon: SettingsSlidersIcon, exact: false, adminOnly: true },
];

/* ── Component ── */

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { data: currentOrg } = useCurrentOrganization();
  const role = useCurrentOrgRole();

  const isAdmin = role === 'admin';

  const visibleNav = navigation.filter((item) => !item.adminOnly || isAdmin);

  function closeMobileSidebar() {
    setSidebarOpen(false);
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
        <div className="shrink-0 border-b border-neutral-100 px-5 py-4">
          {currentOrg ? (
            <div>
              <p className="text-sm font-bold text-neutral-900 truncate">{currentOrg.name}</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                {role ?? 'Member'}
              </p>
            </div>
          ) : (
            <div className="h-9 animate-shimmer rounded-lg" />
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <div className="space-y-1">
            {visibleNav.map((item) => {
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
            })}
          </div>
        </nav>

        {/* Footer spacer */}
        <div className="shrink-0 h-3" />
      </aside>
    </>
  );
}
