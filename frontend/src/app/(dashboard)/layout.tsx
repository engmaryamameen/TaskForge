'use client';

import { useSessionGuard } from '@/features/auth/hooks/useSessionGuard';
import { useSocketEvents } from '@/hooks/useSocketEvents';
import { DashboardShell } from '@/components/layout/dashboard-shell';

function AppShellSkeleton() {
  return (
    <div className="flex h-screen bg-white">
      {/* Org rail skeleton */}
      <div className="hidden md:flex md:w-17 md:shrink-0 md:flex-col md:items-center md:border-r md:border-neutral-200 md:bg-neutral-50 md:py-4">
        <div className="h-10 w-10 animate-shimmer rounded-2xl" />
        <div className="mx-auto my-3 h-px w-8 bg-neutral-200" />
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 w-10 animate-shimmer rounded-2xl" />
          ))}
        </div>
      </div>
      {/* Nav sidebar skeleton */}
      <div className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-neutral-200">
        <div className="px-5 py-4">
          <div className="h-5 w-28 animate-shimmer rounded-md" />
          <div className="mt-2 h-3 w-16 animate-shimmer rounded-md" />
        </div>
        <div className="flex-1 space-y-1 px-3 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <div className="h-5 w-5 animate-shimmer rounded" />
              <div className="h-4 animate-shimmer rounded-md" style={{ width: `${60 + (i % 3) * 20}px` }} />
            </div>
          ))}
        </div>
      </div>
      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar skeleton */}
        <div className="flex h-14 shrink-0 items-center gap-4 border-b border-neutral-200 px-5">
          <div className="h-4 w-20 animate-shimmer rounded-md" />
          <div className="mx-auto hidden md:block h-8 w-full max-w-md animate-shimmer rounded-lg" />
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="h-7 w-7 animate-shimmer rounded-lg" />
            <div className="h-7 w-7 animate-shimmer rounded-full" />
          </div>
        </div>
        {/* Content placeholder */}
        <div className="flex-1 bg-white p-5 md:p-5 lg:p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="h-5 w-36 animate-shimmer rounded-md" />
            <div className="h-8 w-56 animate-shimmer rounded-md" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 animate-shimmer rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = useSessionGuard('protected');

  useSocketEvents();

  if (status !== 'authenticated') {
    return <AppShellSkeleton />;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
