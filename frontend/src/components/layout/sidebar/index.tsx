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
  IconSearch,
} from '@/components/icons';
import { useCommandPalette } from '@/features/command/use-command-palette';

const mainNav = [
  { href: '/', label: 'Dashboard', icon: IconHome, exact: true },
  { href: '/projects', label: 'Projects', icon: IconFolder, exact: false },
  { href: '/tasks', label: 'Tasks', icon: IconCheckSquare, exact: false },
];

const manageNav = [
  { href: '/organizations', label: 'Organizations', icon: IconUsers, exact: false },
  { href: '/activity', label: 'Activity', icon: IconActivity, exact: false },
  { href: '/settings', label: 'Settings', icon: IconSettings, exact: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { open: openPalette } = useCommandPalette();

  function closeMobileSidebar() {
    setSidebarOpen(false);
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-neutral-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileSidebar}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-white border-r border-neutral-200/80 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 flex-shrink-0 items-center gap-2.5 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-soft">
            <IconBolt className="h-4.5 w-4.5 text-white" />
          </div>
          <Link href="/" className="text-lg font-bold tracking-tight text-neutral-900">
            TaskForge
          </Link>
        </div>

        {/* Search trigger */}
        <div className="px-4 pb-3">
          <button
            onClick={() => { openPalette(); closeMobileSidebar(); }}
            className="flex w-full items-center gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-400 transition-colors hover:border-neutral-300 hover:bg-white"
          >
            <IconSearch className="h-4 w-4" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="hidden rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 sm:inline-block">
              &#8984;K
            </kbd>
          </button>
        </div>

        {/* Org switcher */}
        <div className="px-4 pb-3">
          <OrgSwitcher />
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3">
          <div className="mb-1">
            <p className="px-3 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
              Main
            </p>
            <div className="space-y-0.5">
              {mainNav.map((item) => {
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
            </div>
          </div>

          <div className="mb-1">
            <p className="px-3 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
              Manage
            </p>
            <div className="space-y-0.5">
              {manageNav.map((item) => {
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
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-neutral-100 px-4 py-3">
          <div className="rounded-lg bg-primary-50 p-3">
            <p className="text-xs font-semibold text-primary-800">TaskForge Pro</p>
            <p className="mt-0.5 text-[11px] text-primary-600">Upgrade for advanced features</p>
          </div>
        </div>
      </aside>
    </>
  );
}
