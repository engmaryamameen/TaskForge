'use client';

import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { getInitials } from '@/lib/utils';

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const logout = useLogout();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <button
        onClick={toggleSidebar}
        className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
        aria-label="Toggle sidebar"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <button
              onClick={() => logout.mutate()}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
