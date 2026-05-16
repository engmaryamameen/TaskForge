'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useCurrentOrgRole } from '@/features/organizations/hooks/useOrganizations';
import { NavItem } from './nav-item';
import { OrgSwitcher } from './org-switcher';
import { Avatar } from '@/components/ui/avatar';
import {
  DashboardCardsIcon,
  ProjectsLayersIcon,
  TasksCircleCheckIcon,
  OrganizationsTeamIcon,
  ActivityTimelineIcon,
  SettingsSlidersIcon,
} from '@/assets/svg';
import { matchTasksSubNav } from '@/features/tasks/lib/task-subnav-match';

const navigation = [
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
  { href: '/organizations', label: 'Organizations', icon: OrganizationsTeamIcon, exact: false },
  { href: '/activity', label: 'Activity', icon: ActivityTimelineIcon, exact: false },
  { href: '/settings', label: 'Settings', icon: SettingsSlidersIcon, exact: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const role = useCurrentOrgRole();
  const collapsed = sidebarCollapsed;

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
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-neutral-200 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'md:w-16' : 'md:w-60'} w-60`}
      >
        {/* Logo */}
        <div className={`shrink-0 border-b border-neutral-100 ${collapsed ? 'flex justify-center px-2 py-5' : 'px-5 py-5'}`}>
          <Link href="/">
            {collapsed ? (
              <img src="/brand/taskforge-app-icon-transparent.png" alt="TaskForge" className="h-8 w-auto" />
            ) : (
              <img src="/brand/taskforge-primary-horizontal-transparent.png" alt="TaskForge" className="h-8 w-auto" />
            )}
          </Link>
        </div>

        {/* User profile section */}
        {!collapsed && user && (
          <div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-3.5">
            <Avatar firstName={user.firstName} lastName={user.lastName} size="md" className="bg-primary-600!" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-neutral-400 capitalize">{role ?? 'Member'}</p>
            </div>
          </div>
        )}

        {/* Org switcher */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-neutral-100">
            <OrgSwitcher />
          </div>
        )}

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-3 ${collapsed ? 'px-2' : 'px-3'}`}>
          <div className="space-y-1">
            {navigation.map((item) => {
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
                  collapsed={collapsed}
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
