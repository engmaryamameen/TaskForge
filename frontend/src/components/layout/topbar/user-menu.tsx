'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useClickOutside } from '@/hooks/useClickOutside';
import { getInitials } from '@/lib/utils';
import { IconSettings, IconLogOut } from '@/components/icons';

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
        className="flex items-center rounded-full p-0.5 hover:ring-2 hover:ring-gray-200 transition-all"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-[11px] font-semibold text-white">
          {getInitials(user.firstName, user.lastName)}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-60 rounded-lg border border-gray-200 bg-white shadow-overlay">
          {/* User info */}
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/settings"
              onClick={close}
              className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <IconSettings className="h-4 w-4 text-gray-400" />
              Settings
            </Link>
          </div>

          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => { logout.mutate(); close(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <IconLogOut className="h-4 w-4 text-gray-400" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
