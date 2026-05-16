'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { NavItem } from './nav-item';
import { OrgSwitcher } from './org-switcher';
import { IconBolt, IconChevronLeft } from '@/components/icons';
import {
  DashboardCardsIcon,
  ProjectsLayersIcon,
  TasksCircleCheckIcon,
  OrganizationsTeamIcon,
  ActivityTimelineIcon,
  SettingsSlidersIcon,
  SearchIcon,
} from '@/components/icons-taskforge';
import { useCommandPalette } from '@/features/command/use-command-palette';
import { matchTasksSubNav } from '@/features/tasks/lib/task-subnav-match';

const navigation = [
  {
    section: 'Main',
    items: [
      { href: '/', label: 'Dashboard', icon: DashboardCardsIcon, exact: true },
      {
        href: '/projects',
        label: 'Projects',
        icon: ProjectsLayersIcon,
        exact: false,
        subLinks: [
          { href: '/projects', label: 'All Projects' },
        ],
      },
      {
        href: '/tasks',
        label: 'Tasks',
        icon: TasksCircleCheckIcon,
        exact: false,
        subLinks: [
          { href: '/tasks', label: 'Board view' },
          { href: '/tasks?status=todo', label: 'To Do' },
          { href: '/tasks?status=in-progress', label: 'In progress' },
          { href: '/tasks?status=done', label: 'Done' },
          { href: '/tasks?assignee=me', label: 'My tasks' },
          { href: '/tasks?due=soon', label: 'Due soon' },
        ],
      },
    ],
  },
  {
    section: 'Workspace',
    items: [
      {
        href: '/organizations',
        label: 'Organizations',
        icon: OrganizationsTeamIcon,
        exact: false,
        subLinks: [
          { href: '/organizations', label: 'My Organizations' },
        ],
      },
      { href: '/activity', label: 'Activity', icon: ActivityTimelineIcon, exact: false },
      {
        href: '/settings',
        label: 'Settings',
        icon: SettingsSlidersIcon,
        exact: false,
        subLinks: [
          { href: '/settings', label: 'General' },
        ],
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const { open: openPalette } = useCommandPalette();
  const collapsed = sidebarCollapsed;

  function closeMobileSidebar() {
    setSidebarOpen(false);
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-neutral-900/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileSidebar}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-neutral-200 transition-all duration-200 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'md:w-16' : 'md:w-64'} w-64`}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 shadow-soft">
            <IconBolt className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <Link href="/" className="text-lg font-bold tracking-tight text-neutral-900">
              TaskForge
            </Link>
          )}
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-4 pb-3">
            <button
              onClick={() => { openPalette(); closeMobileSidebar(); }}
              className="flex w-full items-center gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50/80 px-3 py-2 text-sm text-neutral-400 transition-all hover:border-neutral-300 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <SearchIcon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">Search...</span>
              <kbd className="hidden rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-neutral-400 sm:inline-block">
                &#8984;K
              </kbd>
            </button>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center pb-3">
            <button
              onClick={() => { openPalette(); closeMobileSidebar(); }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 cursor-pointer"
              title="Search (⌘K)"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Org switcher */}
        {!collapsed && (
          <div className="px-4 pb-2">
            <OrgSwitcher />
          </div>
        )}

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto pt-1 ${collapsed ? 'px-2' : 'px-3'}`}>
          {navigation.map((group) => (
            <div key={group.section} className="mb-2">
              {!collapsed && (
                <p className="px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                  {group.section}
                </p>
              )}
              {collapsed && <div className="my-2 border-t border-neutral-100" />}
              <div className="space-y-0.5">
                {group.items.map((item) => {
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
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-neutral-100 p-4">
          {!collapsed && (
            <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 p-3.5 border border-primary-200/50">
              <p className="text-xs font-semibold text-primary-800">TaskForge Pro</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-primary-600/80">
                Unlock advanced analytics, automations, and more.
              </p>
              <button className="mt-2.5 w-full rounded-lg bg-primary-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-primary-700 cursor-pointer">
                Upgrade Now
              </button>
            </div>
          )}

          {/* Collapse toggle — desktop only */}
          <button
            onClick={toggleSidebarCollapsed}
            className={`hidden md:flex items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 cursor-pointer ${
              collapsed ? 'mx-auto mt-0 h-9 w-9' : 'mt-3 w-full gap-2 px-3 py-1.5 text-xs'
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <IconChevronLeft className={`h-4 w-4 shrink-0 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
