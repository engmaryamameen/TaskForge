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
  IconSettings,
} from '@/components/icons';

const navItems = [
  { href: '/', label: 'Dashboard', icon: IconHome, exact: true },
  { href: '/projects', label: 'Projects', icon: IconFolder, exact: false },
  { href: '/tasks', label: 'Tasks', icon: IconCheckSquare, exact: false },
  { href: '/organizations', label: 'Organizations', icon: IconUsers, exact: false },
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
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 md:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileSidebar}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 flex-shrink-0 items-center border-b border-gray-200 px-6">
          <Link href="/" className="text-xl font-bold text-gray-900">
            TaskForge
          </Link>
        </div>

        {/* Org switcher */}
        <div className="pt-4">
          <OrgSwitcher />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-2">
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
