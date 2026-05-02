interface PageSkeletonProps {
  variant?: 'cards' | 'table' | 'detail' | 'dashboard';
}

function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-neutral-200/70 ${className}`} />
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
    <div>
      <Shimmer className="h-8 w-64 mb-2" />
      <Shimmer className="h-4 w-48 mb-8" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <Shimmer className="h-4 w-24" />
              <Shimmer className="h-9 w-9 rounded-lg" />
            </div>
            <Shimmer className="h-8 w-16 mb-1" />
            <Shimmer className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-7">
        <div className="lg:col-span-4 rounded-xl border border-neutral-200 bg-white p-5">
          <Shimmer className="h-5 w-32 mb-5" />
          <Shimmer className="h-48 w-full rounded-lg" />
        </div>
        <div className="lg:col-span-3 rounded-xl border border-neutral-200 bg-white p-5">
          <Shimmer className="h-5 w-32 mb-5" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Shimmer className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Shimmer className="h-3.5 w-full mb-1.5" />
                  <Shimmer className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
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
