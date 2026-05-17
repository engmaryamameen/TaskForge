'use client';

import { useSessionGuard } from '@/features/auth/hooks/useSessionGuard';
import { useSocketEvents } from '@/hooks/useSocketEvents';
import { DashboardShell } from '@/components/layout/dashboard-shell';

function AppShellSkeleton() {
  return (
    <div className="flex h-screen bg-white">
      {/* Org rail skeleton */}
      <div className="hidden md:flex md:w-16 md:shrink-0 md:flex-col md:items-center md:border-r md:border-neutral-200 md:bg-neutral-50/80 md:py-3">
        <div className="h-9 w-9 animate-shimmer rounded-xl" />
        <div className="mx-auto my-2 h-px w-7 bg-neutral-200" />
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-9 w-9 animate-shimmer rounded-2xl" />
          ))}
        </div>
      </div>
      {/* Nav sidebar skeleton */}
      <div className="hidden md:flex md:w-20 md:flex-col md:items-center md:border-r md:border-neutral-200 md:py-3">
        <div className="h-9 w-9 animate-shimmer rounded-xl" />
        <div className="mt-1 h-3 w-12 animate-shimmer rounded" />
        <div className="mx-3 my-2 h-px w-10 bg-neutral-100" />
        <div className="flex-1 space-y-2 px-2 w-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1 py-2">
              <div className="h-5 w-5 animate-shimmer rounded" />
              <div className="h-2.5 w-10 animate-shimmer rounded" />
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
