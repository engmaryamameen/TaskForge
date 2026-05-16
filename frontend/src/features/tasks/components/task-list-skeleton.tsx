export function TaskListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow-soft">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs font-medium uppercase text-neutral-500">
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Assignee</th>
            <th className="px-4 py-3">Due Date</th>
            <th className="px-4 py-3 w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td className="px-4 py-3"><div className="h-4 w-40 animate-shimmer rounded" /></td>
              <td className="px-4 py-3"><div className="h-5 w-20 animate-shimmer rounded-full" /></td>
              <td className="px-4 py-3"><div className="h-5 w-16 animate-shimmer rounded-full" /></td>
              <td className="px-4 py-3"><div className="h-4 w-24 animate-shimmer rounded" /></td>
              <td className="px-4 py-3"><div className="h-4 w-20 animate-shimmer rounded" /></td>
              <td className="px-4 py-3"><div className="h-4 w-8 animate-shimmer rounded" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
