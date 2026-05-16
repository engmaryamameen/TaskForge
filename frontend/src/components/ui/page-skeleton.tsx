interface PageSkeletonProps {
  variant?: 'cards' | 'table' | 'detail' | 'dashboard';
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
        <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5">
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
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
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
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <Shimmer className="h-5 w-1/4 mb-5" />
          <div className="grid grid-cols-2 gap-4">
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs">
        <Shimmer className="mb-2 h-4 w-20" />
        <Shimmer className="mb-2 h-9 w-48" />
        <Shimmer className="h-4 w-full max-w-lg" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <Shimmer className="h-4 w-24" />
              <Shimmer className="h-11 w-11 rounded-xl" />
            </div>
            <Shimmer className="mb-1 h-9 w-20" />
            <Shimmer className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
          <div className="border-b border-neutral-100 px-6 py-5">
            <Shimmer className="mb-2 h-5 w-40" />
            <Shimmer className="h-4 w-56" />
          </div>
          <Shimmer className="m-4 h-[300px] w-[calc(100%-2rem)] rounded-lg" />
        </div>
        <div className="xl:col-span-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
          <div className="border-b border-neutral-100 px-6 py-5">
            <Shimmer className="mb-2 h-5 w-32" />
            <Shimmer className="h-4 w-44" />
          </div>
          <Shimmer className="m-6 mx-auto h-56 max-w-[220px] rounded-full" />
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
  }
}
