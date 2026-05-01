'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { NavItem } from './nav-item';
import { OrgSwitcher } from './org-switcher';
import {
  IconHome,
  IconFolder,
  IconCheckSquare,
  IconUsers,
  IconActivity,
  IconSettings,
  IconBolt,
} from '@/components/icons';

const navItems = [
  { href: '/', label: 'Dashboard', icon: IconHome, exact: true },
  { href: '/projects', label: 'Projects', icon: IconFolder, exact: false },
  { href: '/tasks', label: 'Tasks', icon: IconCheckSquare, exact: false },
  { href: '/organizations', label: 'Organizations', icon: IconUsers, exact: false },
  { href: '/activity', label: 'Activity', icon: IconActivity, exact: false },
  { href: '/settings', label: 'Settings', icon: IconSettings, exact: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  function closeMobileSidebar() {
    setSidebarOpen(false);
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 md:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileSidebar}
      />

      {/* Sidebar — clean white like Jira */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-neutral-200 bg-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 flex-shrink-0 items-center gap-2 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600">
            <IconBolt className="h-4 w-4 text-white" />
          </div>
          <Link href="/" className="text-base font-bold text-neutral-900">
            TaskForge
          </Link>
        </div>

        {/* Org switcher */}
        <div className="px-3 pb-2">
          <OrgSwitcher />
        </div>

        <div className="mx-3 border-t border-neutral-100" />

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 pt-3">
          {navItems.map((item) => {
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
              />
            );
          })}
        </nav>
      </aside>
    </>
  );
}
