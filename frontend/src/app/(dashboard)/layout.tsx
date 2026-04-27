'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useSocketEvents } from '@/hooks/useSocketEvents';
import { connectSocket, joinOrgRoom } from '@/lib/socket';
import { authApi } from '@/lib/api/auth.api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {
    accessToken,
    refreshToken,
    currentOrganizationId,
    isAuthenticated,
    _hasHydrated,
    setAuth,
    logout,
  } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);

  // Verify session with backend after hydration
  useEffect(() => {
    if (!_hasHydrated) return;

    if (!accessToken) {
      setIsVerifying(false);
      router.push('/login');
      return;
    }

    authApi.me()
      .then(({ data }) => {
        const serverUser = data.data!.user;
        setAuth(serverUser, accessToken!, refreshToken!);
        setIsVerifying(false);
      })
      .catch(() => {
        logout();
        router.push('/login');
      });
  }, [_hasHydrated]);

  // Connect socket and join org room
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = connectSocket(accessToken);

    if (currentOrganizationId) {
      socket.on('connect', () => joinOrgRoom(currentOrganizationId));
      if (socket.connected) {
        joinOrgRoom(currentOrganizationId);
      }
    }
  }, [isAuthenticated, accessToken, currentOrganizationId]);

  // Wire up socket → React Query cache invalidation
  useSocketEvents();

  if (!_hasHydrated || isVerifying) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
