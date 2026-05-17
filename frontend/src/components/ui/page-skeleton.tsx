interface PageSkeletonProps {
  variant?: 'cards' | 'table' | 'detail' | 'dashboard' | 'kanban' | 'org' | 'project-detail' | 'auth';
}

function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-shimmer rounded-md ${className}`} />
  );
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
          <Shimmer className="h-5 w-3/4" />
          <div className="mt-3 space-y-2">
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-2/3" />
          </div>
          <div className="mt-5 flex items-center justify-between">
            <Shimmer className="h-6 w-16 rounded-full" />
            <Shimmer className="h-6 w-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
      <div className="border-b border-neutral-200 px-5 py-3.5">
        <Shimmer className="h-4 w-32" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-neutral-100 px-5 py-4 last:border-0">
          <Shimmer className="h-8 w-8 rounded-full" />
          <Shimmer className="h-4 w-40" />
          <Shimmer className="h-5 w-20 rounded-full" />
          <Shimmer className="h-5 w-16 rounded-full" />
          <div className="ml-auto">
            <Shimmer className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div>
      <Shimmer className="h-4 w-32 mb-4" />
      <Shimmer className="h-8 w-2/3 mb-2" />
      <Shimmer className="h-4 w-1/2 mb-8" />
      <div className="space-y-5">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs">
          <Shimmer className="h-5 w-1/4 mb-5" />
          <div className="grid grid-cols-2 gap-4">
            <Shimmer className="h-10 w-full rounded-lg" />
            <Shimmer className="h-10 w-full rounded-lg" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Shimmer className="h-10 w-full rounded-lg" />
            <Shimmer className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs">
          <Shimmer className="h-5 w-1/3 mb-5" />
          <div className="space-y-4">
            <Shimmer className="h-10 w-full rounded-lg" />
            <Shimmer className="h-10 w-2/3 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Welcome header */}
      <div>
        <Shimmer className="h-4 w-40" />
        <Shimmer className="mt-2 h-8 w-56" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Checklist card */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <Shimmer className="h-4 w-24" />
              <Shimmer className="h-5 w-10 rounded-full" />
            </div>
            <Shimmer className="mb-5 h-1.5 w-full rounded-full" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3.5 rounded-xl border border-neutral-200 px-4 py-3.5">
                  <Shimmer className="h-6 w-6 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Shimmer className="h-4 w-3/5" />
                    <Shimmer className="h-3 w-4/5" />
                  </div>
                  <Shimmer className="h-7 w-16 shrink-0 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Activity card */}
        <div className="lg:col-span-5">
          <div className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-4">
              <Shimmer className="h-4 w-4 rounded" />
              <Shimmer className="h-4 w-28" />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
              <Shimmer className="h-10 w-10 rounded-xl" />
              <Shimmer className="mt-3 h-4 w-24" />
              <Shimmer className="mt-2 h-3 w-40" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <Shimmer className="h-3 w-16" />
                <Shimmer className="h-9 w-12" />
                <Shimmer className="h-3 w-24" />
              </div>
              <Shimmer className="h-10 w-10 shrink-0 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Kanban board skeleton — 3 columns with card placeholders */
function KanbanSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Shimmer className="h-8 w-32" />
          <Shimmer className="mt-2 h-4 w-56" />
        </div>
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>
      {/* Stats bar */}
      <div className="mb-6 flex gap-3">
        <Shimmer className="h-8 w-24 rounded-lg" />
        <Shimmer className="h-6 w-20 rounded-full" />
        <Shimmer className="h-6 w-24 rounded-full" />
        <Shimmer className="h-6 w-16 rounded-full" />
      </div>
      {/* Columns */}
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="flex-1 min-w-0">
            <div className="mb-2 flex items-center justify-between px-2 py-1.5">
              <Shimmer className="h-4 w-20" />
              <Shimmer className="h-5 w-5 rounded-full" />
            </div>
            <div className="rounded-xl bg-neutral-50 p-1.5 space-y-1.5">
              {Array.from({ length: col === 0 ? 3 : col === 1 ? 2 : 1 }).map((_, card) => (
                <div key={card} className="rounded-lg border border-neutral-200 bg-white p-3 shadow-xs">
                  <Shimmer className="h-4 w-full" />
                  <Shimmer className="mt-1.5 h-4 w-3/4" />
                  <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2">
                    <Shimmer className="h-6 w-6 rounded-full" />
                    <Shimmer className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Organizations page skeleton — org cards grid + members list */
function OrgSkeleton() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Shimmer className="h-8 w-40" />
          <Shimmer className="mt-2 h-4 w-64" />
        </div>
        <Shimmer className="h-9 w-40 rounded-lg" />
      </div>
      {/* Org cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <Shimmer className="h-12 w-12 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Shimmer className="h-5 w-40" />
                <Shimmer className="h-3 w-24" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Shimmer className="h-7 w-24 rounded-lg" />
              <Shimmer className="h-7 w-24 rounded-lg" />
              <Shimmer className="h-7 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      {/* Team members */}
      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Shimmer className="h-6 w-32" />
            <Shimmer className="mt-1 h-4 w-48" />
          </div>
          <Shimmer className="h-8 w-32 rounded-lg" />
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-xs overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4 last:border-0">
              <Shimmer className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Shimmer className="h-4 w-32" />
                <Shimmer className="h-3 w-44" />
              </div>
              <div className="flex gap-2">
                <Shimmer className="h-5 w-14 rounded-full" />
                <Shimmer className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Project detail page skeleton */
function ProjectDetailSkeleton() {
  return (
    <div>
      {/* Breadcrumb + header */}
      <Shimmer className="h-4 w-24 mb-4" />
      <div className="flex items-center justify-between mb-2">
        <Shimmer className="h-8 w-1/3" />
        <div className="flex gap-2">
          <Shimmer className="h-8 w-16 rounded-lg" />
          <Shimmer className="h-8 w-16 rounded-lg" />
        </div>
      </div>
      <Shimmer className="h-4 w-2/3 mb-8" />
      {/* Tasks section header */}
      <div className="flex items-center justify-between mb-4">
        <Shimmer className="h-6 w-16" />
        <div className="flex gap-2">
          <Shimmer className="h-8 w-20 rounded-lg" />
          <Shimmer className="h-8 w-20 rounded-lg" />
          <Shimmer className="h-8 w-28 rounded-lg" />
        </div>
      </div>
      {/* Task table skeleton */}
      <div className="rounded-lg border border-neutral-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-2.5">
          <div className="flex gap-8">
            <Shimmer className="h-3 w-12" />
            <Shimmer className="h-3 w-12" />
            <Shimmer className="h-3 w-14" />
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-3 w-16" />
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 border-b border-neutral-100 px-4 py-3 last:border-0">
            <Shimmer className="h-4 w-44" />
            <Shimmer className="h-5 w-20 rounded-full" />
            <Shimmer className="h-5 w-16 rounded-full" />
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Auth page skeleton — matches AuthShell two-panel layout */
function AuthSkeleton() {
  return (
    <div className="flex min-h-screen">
      {/* Visual panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[480px] lg:shrink-0 lg:items-center lg:justify-center bg-neutral-100">
        <Shimmer className="h-32 w-32 rounded-2xl" />
      </div>
      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-[430px] space-y-6">
          <div>
            <Shimmer className="h-8 w-48 mb-2" />
            <Shimmer className="h-4 w-72" />
          </div>
          <div className="space-y-4">
            <div>
              <Shimmer className="h-4 w-16 mb-1.5" />
              <Shimmer className="h-10 w-full rounded-lg" />
            </div>
            <div>
              <Shimmer className="h-4 w-20 mb-1.5" />
              <Shimmer className="h-10 w-full rounded-lg" />
            </div>
            <Shimmer className="h-11 w-full rounded-lg" />
          </div>
          <Shimmer className="h-4 w-56 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton({ variant = 'cards' }: PageSkeletonProps) {
  switch (variant) {
    case 'cards': return <CardsSkeleton />;
    case 'table': return <TableSkeleton />;
    case 'detail': return <DetailSkeleton />;
    case 'dashboard': return <DashboardSkeleton />;
    case 'kanban': return <KanbanSkeleton />;
    case 'org': return <OrgSkeleton />;
    case 'project-detail': return <ProjectDetailSkeleton />;
    case 'auth': return <AuthSkeleton />;
  }
}
