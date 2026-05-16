'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useClickOutside } from '@/hooks/useClickOutside';
import { Avatar } from '@/components/ui/avatar';
import { IconSettings, IconLogOut, IconUsers } from '@/components/icons';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsOpen(false), []);
  useClickOutside(ref, close);

  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center rounded-full transition-all hover:ring-2 hover:ring-neutral-200 cursor-pointer"
        aria-label="User menu"
      >
        <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-neutral-200 bg-white shadow-overlay animate-slide-down">
          <div className="border-b border-neutral-100 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Avatar firstName={user.firstName} lastName={user.lastName} size="lg" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="py-1.5">
            <Link
              href="/organizations"
              onClick={close}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <IconUsers className="h-4 w-4 text-neutral-400" />
              Organizations
            </Link>
            <Link
              href="/settings"
              onClick={close}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <IconSettings className="h-4 w-4 text-neutral-400" />
              Settings
            </Link>
          </div>

          <div className="border-t border-neutral-100 py-1.5">
            <button
              onClick={() => { logout.mutate(); close(); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <IconLogOut className="h-4 w-4 text-neutral-400" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
