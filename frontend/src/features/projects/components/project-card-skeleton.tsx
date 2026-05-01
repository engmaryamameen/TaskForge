export function ProjectCardSkeleton() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm animate-pulse">
      <div className="h-5 w-3/4 rounded bg-gray-200" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-2/3 rounded bg-gray-200" />
      </div>
      <div className="mt-4 h-3 w-1/3 rounded bg-gray-200" />
    </div>
  );
}
