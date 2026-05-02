'use client';

import { useSessionGuard } from '@/features/auth/hooks/useSessionGuard';
import { useSocketEvents } from '@/hooks/useSocketEvents';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { DemoNotificationBootstrap } from '@/lib/demo/demo-notification-bootstrap';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = useSessionGuard('protected');

  useSocketEvents();
  return (
    <>
      <DemoNotificationBootstrap />
      {status !== 'authenticated' ? (
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : (
        <DashboardShell>{children}</DashboardShell>
      )}
    </>
  );
}
