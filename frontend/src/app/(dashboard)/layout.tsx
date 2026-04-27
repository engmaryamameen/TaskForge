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
  const { isAuthenticated, currentOrganizationId } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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
