'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import blankProfilePic from '@/assets/images/blank-profile-pic.png';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useClickOutside } from '@/hooks/useClickOutside';
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
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2.5 transition-colors hover:bg-neutral-100"
        aria-label="User menu"
      >
        <Image
          src={blankProfilePic}
          alt={user.firstName}
          width={28}
          height={28}
          className="h-7 w-7 rounded-full object-cover"
        />
        <span className="hidden md:block text-sm font-medium text-neutral-700">{user.firstName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-9999 mt-2 w-64 rounded-xl border border-neutral-200 bg-white shadow-overlay animate-dropdown-in">
          <div className="border-b border-neutral-100 px-4 py-3.5">
            <p className="text-sm font-semibold text-neutral-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-neutral-500 truncate">{user.email}</p>
          </div>

          <div className="py-1.5">
            <Link
              href="/settings"
              onClick={close}
              className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <IconSettings className="h-4 w-4 text-neutral-400" />
              Settings
            </Link>
          </div>

          <div className="border-t border-neutral-100 py-1.5">
            <button
              onClick={() => { logout.mutate(); close(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors"
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
