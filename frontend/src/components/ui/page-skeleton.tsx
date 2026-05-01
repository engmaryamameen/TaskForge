interface PageSkeletonProps {
  variant?: 'cards' | 'table' | 'detail';
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg bg-white p-6 shadow-soft animate-pulse">
          <div className="h-5 w-3/4 rounded bg-neutral-200" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full rounded bg-neutral-200" />
            <div className="h-3 w-2/3 rounded bg-neutral-200" />
          </div>
          <div className="mt-4 h-3 w-1/3 rounded bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-lg bg-white shadow-soft animate-pulse">
      <div className="border-b border-neutral-200 px-4 py-3">
        <div className="h-3 w-1/4 rounded bg-neutral-200" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-neutral-100 px-4 py-4 last:border-0">
          <div className="h-4 w-40 rounded bg-neutral-200" />
          <div className="h-5 w-20 rounded-full bg-neutral-200" />
          <div className="h-5 w-16 rounded-full bg-neutral-200" />
          <div className="h-4 w-24 rounded bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-32 rounded bg-neutral-200 mb-4" />
      <div className="h-8 w-2/3 rounded bg-neutral-200 mb-2" />
      <div className="h-4 w-1/2 rounded bg-neutral-200 mb-8" />
      <div className="space-y-4">
        <div className="rounded-lg bg-white p-6 shadow-soft">
          <div className="h-5 w-1/4 rounded bg-neutral-200 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 w-full rounded bg-neutral-200" />
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
  }
}
