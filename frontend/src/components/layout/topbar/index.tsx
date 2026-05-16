'use client';

import { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { useSocketStatus } from '@/hooks/useSocketStatus';
import { useCommandPalette } from '@/features/command/use-command-palette';
import { UserMenu } from './user-menu';
import { NotificationDropdown } from './notification-dropdown';
import { IconMenu, IconChevronLeft } from '@/components/icons';
import { SearchIcon } from '@/assets/svg';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/organizations': 'Organizations',
  '/activity': 'Activity',
  '/settings': 'Settings',
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/projects/')) return 'Project Details';
  return 'Dashboard';
}

export function Topbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);
  const { connected } = useSocketStatus();
  const { open: openPalette } = useCommandPalette();
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 1) {
      openPalette(val);
      setQuery('');
      inputRef.current?.blur();
    }
  }

  function handleSearchFocus() {
    if (query.length > 0) {
      openPalette(query);
      setQuery('');
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      openPalette(query);
      setQuery('');
      inputRef.current?.blur();
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-neutral-200 bg-white px-4 md:px-5">
      {/* Left: sidebar toggle + page title */}
      <div className="flex items-center gap-2">
        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors md:hidden"
          aria-label="Toggle sidebar"
        >
          <IconMenu className="h-5 w-5" />
        </button>
        {/* Desktop collapse toggle */}
        <button
          onClick={toggleSidebarCollapsed}
          className="hidden md:flex items-center justify-center rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors cursor-pointer"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <IconChevronLeft className={`h-4 w-4 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
        <h1 className="text-sm font-semibold text-neutral-800">{title}</h1>

        {!connected && (
          <span className="rounded-full bg-warning-50 px-2 py-0.5 text-[11px] font-medium text-warning-700 ring-1 ring-warning-500/20 animate-pulse">
            Reconnecting
          </span>
        )}
      </div>

      {/* Center: real search input */}
      <div className="hidden md:block flex-1 max-w-sm mx-auto">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search..."
            className="w-full rounded-lg border border-neutral-200 bg-white py-1.5 pl-9 pr-14 text-sm text-neutral-900 shadow-xs placeholder:text-neutral-400 transition-all focus:border-primary-300 focus:ring-2 focus:ring-primary-100 focus:outline-none hover:border-neutral-300"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[11px] font-medium text-neutral-400 pointer-events-none">
            &#8984;K
          </kbd>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Mobile search */}
        <button
          onClick={() => openPalette()}
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors md:hidden"
          aria-label="Search"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
        <NotificationDropdown />
        <div className="ml-1">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
