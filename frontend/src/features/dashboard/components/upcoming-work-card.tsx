'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconCalendar, IconArrowRight } from '@/components/icons';
import type { Task } from '@/types';
import { DashboardWidgetCardHeader } from './dashboard-widget-card-header';

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseDue(iso: string): Date {
  return startOfDay(new Date(iso));
}

interface UpcomingWorkCardProps {
  tasks: Task[];
  currentUserId: string | undefined;
}

export function UpcomingWorkCard({ tasks, currentUserId }: UpcomingWorkCardProps) {
  const mine = currentUserId ? tasks.filter((t) => t.assignedTo === currentUserId) : [];
  const now = startOfDay(new Date());

  const withDue = mine.filter((t) => t.dueDate);
  const overdue = withDue.filter((t) => parseDue(t.dueDate!) < now);
  const dueToday = withDue.filter((t) => parseDue(t.dueDate!).getTime() === now.getTime());
  const upcoming = withDue.filter((t) => {
    const d = parseDue(t.dueDate!);
    return d > now;
  });
  const noDue = mine.filter((t) => !t.dueDate);

  const hasAny = mine.length > 0;

  if (!hasAny) {
    return (
      <Card padding="lg" hover className="flex h-full min-w-0 flex-col">
        <DashboardWidgetCardHeader
          icon={<IconCalendar className="h-4 w-4 text-neutral-600" />}
          eyebrow="My work"
          title="Your assignments"
          subtitle="Nothing assigned yet"
        />
        <p className="mt-5 flex-1 text-sm leading-relaxed text-neutral-500">
          When you’re assigned work, counts by due window will show here.
        </p>
        <Link
          href="/tasks"
          className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          Browse tasks <IconArrowRight className="h-3 w-3" />
        </Link>
      </Card>
    );
  }

  return (
    <Card padding="lg" hover className="flex h-full min-w-0 flex-col">
      <DashboardWidgetCardHeader
        icon={<IconCalendar className="h-4 w-4 text-neutral-600" />}
        eyebrow="My work"
        title={`${mine.length} assigned`}
        subtitle="Buckets by due date"
        action={
          <Link href="/tasks" className="text-xs font-medium text-primary-600 hover:text-primary-700">
            View all
          </Link>
        }
      />
      <ul className="mt-5 flex-1 space-y-2.5 text-sm">
        <li className="flex items-center justify-between gap-2">
          <span className="text-neutral-600">Overdue</span>
          <Badge variant={overdue.length ? 'danger' : 'todo'}>{overdue.length}</Badge>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className="text-neutral-600">Due today</span>
          <Badge variant={dueToday.length ? 'warning' : 'todo'}>{dueToday.length}</Badge>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className="text-neutral-600">Upcoming</span>
          <span className="font-semibold tabular-nums text-neutral-900">{upcoming.length}</span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className="text-neutral-600">No due date</span>
          <span className="font-semibold tabular-nums text-neutral-900">{noDue.length}</span>
        </li>
      </ul>
    </Card>
  );
}
