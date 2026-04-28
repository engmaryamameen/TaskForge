'use client';

import { useSessionGuard } from '@/features/auth/hooks/useSessionGuard';
import { useSocketEvents } from '@/hooks/useSocketEvents';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = useSessionGuard('protected');

  useSocketEvents();

  if (status !== 'authenticated') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
