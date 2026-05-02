'use client';

import type { Task } from '@/types';
import { buildStatusDistribution } from '@/features/dashboard/lib/chart-data';

/** Workflow semantics: backlog = blue, active = amber, complete = green */
const BAR: Record<string, string> = {
  todo: 'bg-blue-600 shadow-sm shadow-blue-600/20',
  in_progress: 'bg-amber-500 shadow-sm shadow-amber-500/25',
  done: 'bg-emerald-600 shadow-sm shadow-emerald-600/20',
};

interface StatusHorizontalBarsProps {
  tasks: Task[];
}

export function StatusHorizontalBars({ tasks }: StatusHorizontalBarsProps) {
  const rows = buildStatusDistribution(tasks);
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="space-y-3.5 pt-1">
      {rows.map((row) => {
        const pct = max > 0 ? Math.round((row.value / max) * 100) : 0;
        return (
          <div key={row.key}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-neutral-700">{row.name}</span>
              <span className="tabular-nums text-sm font-semibold text-neutral-900">{row.value}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-200/60">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${BAR[row.key] ?? 'bg-blue-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
