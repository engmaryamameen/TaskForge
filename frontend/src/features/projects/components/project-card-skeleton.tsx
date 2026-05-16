export function ProjectCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 pt-6 shadow-xs animate-pulse">
      <div className="flex gap-4">
        <div className="h-12 w-12 shrink-0 rounded-2xl bg-neutral-100" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-4 w-2/3 rounded-md bg-neutral-100" />
          <div className="h-3 w-full rounded-md bg-neutral-100/90" />
          <div className="h-3 w-4/5 rounded-md bg-neutral-100/90" />
        </div>
      </div>
      <div className="mt-5 flex justify-between border-t border-neutral-100 pt-4">
        <div className="h-3 w-24 rounded bg-neutral-100" />
        <div className="h-3 w-14 rounded bg-neutral-100" />
      </div>
    </div>
  );
}
