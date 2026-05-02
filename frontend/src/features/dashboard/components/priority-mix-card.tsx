'use client';

import type { Task } from '@/types';
import { TaskPriority } from '@/types';
import { Card } from '@/components/ui/card';
import { DashboardWidgetCardHeader } from './dashboard-widget-card-header';
import { IconBarChart } from '@/components/icons';

/** Risk / urgency: red → orange → indigo (calm “normal”) → neutral */
const ROWS: { key: TaskPriority; label: string; bar: string }[] = [
  { key: TaskPriority.URGENT, label: 'Urgent', bar: 'bg-red-600 shadow-sm shadow-red-600/25' },
  { key: TaskPriority.HIGH, label: 'High', bar: 'bg-orange-600 shadow-sm shadow-orange-600/22' },
  { key: TaskPriority.MEDIUM, label: 'Medium', bar: 'bg-indigo-500 shadow-sm shadow-indigo-500/20' },
  { key: TaskPriority.LOW, label: 'Low', bar: 'bg-slate-500 shadow-sm shadow-slate-500/15' },
];

interface PriorityMixCardProps {
  tasks: Task[];
}

export function PriorityMixCard({ tasks }: PriorityMixCardProps) {
  const total = tasks.length;
  const max = Math.max(...ROWS.map((r) => tasks.filter((t) => t.priority === r.key).length), 1);

  return (
    <Card padding="lg" hover className="flex h-full min-w-0 flex-col">
      <DashboardWidgetCardHeader
        icon={<IconBarChart className="h-4 w-4 text-neutral-600" />}
        eyebrow="Priority mix"
        title="By priority"
        subtitle="Where urgent work stacks up"
      />
      <div className="mt-5 flex flex-1 flex-col space-y-3.5">
        {ROWS.map((row) => {
          const count = tasks.filter((t) => t.priority === row.key).length;
          const pct = total > 0 ? Math.round((count / max) * 100) : 0;
          return (
            <div key={row.key}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-neutral-700">{row.label}</span>
                <span className="tabular-nums text-sm font-semibold text-neutral-900">{count}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-200/60">
                <div className={`h-2.5 rounded-full transition-all duration-300 ${row.bar}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
