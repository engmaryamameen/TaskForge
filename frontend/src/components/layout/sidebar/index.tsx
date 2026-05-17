'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import blankProfilePic from '@/assets/images/blank-profile-pic.png';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useCurrentOrganization, useCurrentOrgRole } from '@/features/organizations/hooks/useOrganizations';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useClickOutside } from '@/hooks/useClickOutside';
import { Avatar } from '@/components/ui/avatar';
import { NavItem } from './nav-item';
import { CreateMenu } from './create-menu';
import {
  DashboardCardsIcon,
  ProjectsLayersIcon,
  TasksCircleCheckIcon,
  ActivityTimelineIcon,
  SettingsSlidersIcon,
  OrganizationsTeamIcon,
} from '@/assets/svg';

/* ── Navigation definitions ── */

interface NavEntry {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact: boolean;
}

const mainNav: NavEntry[] = [
  { href: '/', label: 'Dashboard', icon: DashboardCardsIcon, exact: true },
  { href: '/projects', label: 'Projects', icon: ProjectsLayersIcon, exact: false },
  { href: '/tasks', label: 'Tasks', icon: TasksCircleCheckIcon, exact: false },
  { href: '/activity', label: 'Activity', icon: ActivityTimelineIcon, exact: false },
];

const adminNav: NavEntry[] = [
  { href: '/organizations', label: 'Org', icon: OrganizationsTeamIcon, exact: false },
  { href: '/settings', label: 'Settings', icon: SettingsSlidersIcon, exact: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const { data: currentOrg } = useCurrentOrganization();
  const role = useCurrentOrgRole();
  const logout = useLogout();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const closeProfile = useCallback(() => setProfileOpen(false), []);
  useClickOutside(profileRef, closeProfile);

  const isAdmin = role === 'admin' || role === 'owner';

  function closeMobile() {
    setSidebarOpen(false);
  }

  function isActive(item: NavEntry) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobile}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-21 flex-col items-center border-r border-neutral-200 bg-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:relative md:z-auto md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* ── Org header ── */}
        <div className="shrink-0 w-full px-3 pt-4 pb-3">
          {currentOrg ? (
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-sm font-bold text-white shadow-sm">
                {currentOrg.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
                {role ?? 'Member'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-10 w-10 animate-shimmer rounded-xl" />
              <div className="h-2.5 w-10 animate-shimmer rounded" />
            </div>
          )}
        </div>

        <div className="h-px w-10 bg-neutral-100" />

        {/* ── Main navigation ── */}
        <nav className="flex-1 overflow-y-auto w-full px-2.5 py-3">
          <div className="flex flex-col gap-1">
            {mainNav.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive(item)}
                onClick={closeMobile}
              />
            ))}
          </div>

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="mx-1.5 my-2.5 h-px bg-neutral-100" />
              <p className="mb-1 text-center text-[9px] font-semibold uppercase tracking-widest text-neutral-400">
                Admin
              </p>
              <div className="flex flex-col gap-1">
                {adminNav.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={isActive(item)}
                    onClick={closeMobile}
                  />
                ))}
              </div>
            </>
          )}
        </nav>

        {/* ── Bottom actions ── */}
        <div className="shrink-0 w-full px-3 pb-4">
          <div className="h-px w-full bg-neutral-100 mb-3" />

          <div className="flex flex-col items-center gap-2">
            <CreateMenu />

            {/* User profile */}
            {user && (
              <div ref={profileRef} className="relative mt-1">
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="relative rounded-full transition-shadow hover:shadow-md"
                >
                  <Image
                    src={blankProfilePic}
                    alt={user.firstName}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-success-500" />
                </button>

                {profileOpen && (
                  <div className="absolute bottom-0 left-full z-9999 ml-3 w-64 rounded-xl border border-neutral-200 bg-white shadow-overlay animate-dropdown-in">
                    {/* User header */}
                    <div className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar firstName={user.firstName} lastName={user.lastName} size="xl" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-neutral-900 truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success-600">
                            <span className="h-2 w-2 rounded-full bg-success-500" />
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-neutral-100" />

                    <div className="py-1.5">
                      <button onClick={closeProfile} className="flex w-full items-center px-4 py-2 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors">
                        Set yourself as <span className="ml-1 font-semibold">away</span>
                      </button>
                      <Link href="/settings" onClick={closeProfile} className="flex w-full items-center px-4 py-2 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors">
                        Notifications
                      </Link>
                    </div>

                    <div className="h-px bg-neutral-100" />

                    <div className="py-1.5">
                      <Link href="/settings" onClick={closeProfile} className="flex w-full items-center px-4 py-2 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors">
                        Profile
                      </Link>
                      <Link href="/settings" onClick={closeProfile} className="flex w-full items-center px-4 py-2 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors">
                        Preferences
                      </Link>
                    </div>

                    <div className="h-px bg-neutral-100" />

                    <div className="py-1.5">
                      <button
                        onClick={() => { logout.mutate(); closeProfile(); }}
                        className="flex w-full items-center px-4 py-2 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        Sign out of {currentOrg?.name ?? 'TaskForge'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
