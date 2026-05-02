'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { IconCalendar } from '@/components/icons';
import type { Task } from '@/types';
import { formatDueDateLabel } from '@/features/dashboard/lib/due-date-label';
import { DashboardWidgetCardHeader } from './dashboard-widget-card-header';

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

interface UpcomingDeadlinesCardProps {
  tasks: Task[];
}

export function UpcomingDeadlinesCard({ tasks }: UpcomingDeadlinesCardProps) {
  const withDue = tasks.filter((t) => t.dueDate);
  const sorted = [...withDue].sort(
    (a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
  );
  const top = sorted.slice(0, 5);
  const now = startOfDay(new Date());

  return (
    <Card padding="lg" hover className="flex h-full min-w-0 flex-col">
      <DashboardWidgetCardHeader
        icon={<IconCalendar className="h-4 w-4 text-neutral-600" />}
        eyebrow="Deadlines"
        title="Nearest due dates"
        subtitle="Soonest work with a due date"
        action={
          <Link href="/tasks" className="text-xs font-medium text-primary-600 hover:text-primary-700">
            Tasks
          </Link>
        }
      />

      {top.length === 0 ? (
        <p className="mt-5 flex-1 text-sm leading-relaxed text-neutral-500">
          No upcoming deadlines. Tasks with due dates will appear here so nothing slips.
        </p>
      ) : (
        <ul className="mt-5 flex-1 space-y-3">
          {top.map((t) => {
            const due = t.dueDate ? startOfDay(new Date(t.dueDate)) : null;
            const overdue = due !== null && due < now;
            const caption = t.dueDate ? formatDueDateLabel(t.dueDate) : 'No due date';

            return (
              <li key={t.id} className="border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                <span className="block truncate text-sm font-medium text-neutral-900">{t.title}</span>
                <span
                  className={`mt-0.5 block text-xs ${overdue ? 'font-medium text-rose-600' : 'text-neutral-600'}`}
                >
                  {caption}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
