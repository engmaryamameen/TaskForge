'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useCurrentOrganization, useCurrentOrgRole } from '@/features/organizations/hooks/useOrganizations';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useClickOutside } from '@/hooks/useClickOutside';
import { Avatar } from '@/components/ui/avatar';
import {
  IconChevronDown,
  IconUserCircle,
  IconSettings,
  IconBell,
  IconPalette,
  IconBuilding,
  IconLifebuoy,
  IconLogOut,
} from '@/components/icons';
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
  const user = useAuthStore((s) => s.user);
  const { data: currentOrg } = useCurrentOrganization();
  const role = useCurrentOrgRole();
  const logout = useLogout();

  // Profile dropdown
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const closeProfile = useCallback(() => setProfileOpen(false), []);
  useClickOutside(profileRef, closeProfile);

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
        {/* ── Org header (static — rail handles switching) ── */}
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

        {/* ── User profile with dropdown ── */}
        {user && (
          <div ref={profileRef} className="relative shrink-0 border-t border-neutral-100 px-3 py-2.5">
            <button
              onClick={() => setProfileOpen((p) => !p)}
              className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-neutral-100 cursor-pointer"
            >
              <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" />
              <div className="min-w-0 text-left flex-1">
                <p className="text-[13px] font-semibold text-neutral-800 truncate leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
              </div>
              <IconChevronDown className={`h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-3 right-3 z-50 mb-2 rounded-xl border border-neutral-200 bg-white shadow-overlay animate-dropdown-in">
                {/* User header */}
                <div className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar firstName={user.firstName} lastName={user.lastName} size="lg" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-neutral-900 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                      <span className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-medium text-success-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-neutral-100" />

                <div className="py-1.5">
                  <Link href="/settings" onClick={closeProfile} className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors">
                    <IconUserCircle className="h-4 w-4 text-neutral-400" />
                    My profile
                  </Link>
                  <Link href="/settings" onClick={closeProfile} className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors">
                    <IconSettings className="h-4 w-4 text-neutral-400" />
                    Account settings
                  </Link>
                  <Link href="/settings" onClick={closeProfile} className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors">
                    <IconBell className="h-4 w-4 text-neutral-400" />
                    Notification settings
                  </Link>
                  <Link href="/settings" onClick={closeProfile} className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors">
                    <IconPalette className="h-4 w-4 text-neutral-400" />
                    Appearance
                  </Link>
                </div>

                <div className="h-px bg-neutral-100" />

                <div className="py-1.5">
                  <Link href="/organizations" onClick={closeProfile} className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors">
                    <IconBuilding className="h-4 w-4 text-neutral-400" />
                    My organizations
                  </Link>
                  <button onClick={closeProfile} className="flex w-full items-center gap-2.5 px-4 py-2 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors">
                    <IconLifebuoy className="h-4 w-4 text-neutral-400" />
                    Help &amp; support
                  </button>
                </div>

                <div className="h-px bg-neutral-100" />

                <div className="py-1.5">
                  <button
                    onClick={() => { logout.mutate(); closeProfile(); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-[13px] text-danger-600 hover:bg-danger-50 transition-colors"
                  >
                    <IconLogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
