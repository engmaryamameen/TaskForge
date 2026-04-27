'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useSocketEvents } from '@/hooks/useSocketEvents';
import { connectSocket, joinOrgRoom } from '@/lib/socket';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, currentOrganizationId, _hasHydrated } = useAuthStore();

  // Redirect to login if not authenticated (only after store has rehydrated)
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // Connect socket and join org room
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = connectSocket();

    if (currentOrganizationId) {
      socket.on('connect', () => joinOrgRoom(currentOrganizationId));
      if (socket.connected) {
        joinOrgRoom(currentOrganizationId);
      }
    }
  }, [isAuthenticated, currentOrganizationId]);

  // Wire up socket → React Query cache invalidation
  useSocketEvents();

  if (!_hasHydrated || !isAuthenticated) return null;

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
