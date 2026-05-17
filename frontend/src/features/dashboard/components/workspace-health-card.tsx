'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { IconArrowRight, IconUsers } from '@/components/icons';
import { DashboardWidgetCardHeader } from './dashboard-widget-card-header';

interface WorkspaceHealthCardProps {
  totalMembers: number;
  totalProjects: number;
  activeTasks: number;
  completionRate: number;
  pendingInviteCount: number;
}

export function WorkspaceHealthCard({
  totalMembers,
  totalProjects,
  activeTasks,
  completionRate,
  pendingInviteCount,
}: WorkspaceHealthCardProps) {
  return (
    <Card padding="lg" hover className="flex h-full min-w-0 flex-col">
      <DashboardWidgetCardHeader
        icon={<IconUsers className="h-4 w-4 text-neutral-600" />}
        eyebrow="Insights"
        title="Organization health"
        subtitle="People, work, and throughput"
      />
      <dl className="mt-5 flex flex-1 flex-col space-y-3">
        <div className="flex items-center justify-between text-sm">
          <dt className="text-neutral-500">Members</dt>
          <dd className="font-semibold tabular-nums text-neutral-900">{totalMembers}</dd>
        </div>
        <div className="flex items-center justify-between text-sm">
          <dt className="text-neutral-500">Projects</dt>
          <dd className="font-semibold tabular-nums text-neutral-900">{totalProjects}</dd>
        </div>
        <div className="flex items-center justify-between text-sm">
          <dt className="text-neutral-500">Active tasks</dt>
          <dd className="font-semibold tabular-nums text-neutral-900">{activeTasks}</dd>
        </div>
        <div className="flex items-center justify-between text-sm">
          <dt className="text-neutral-500">Completion rate</dt>
          <dd className="font-semibold tabular-nums text-emerald-700">{completionRate}%</dd>
        </div>
        {pendingInviteCount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <dt className="text-neutral-500">Pending invites</dt>
            <dd className="font-semibold tabular-nums text-amber-700">{pendingInviteCount}</dd>
          </div>
        )}
      </dl>
      <Link
        href="/organizations"
        className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
      >
        Manage organization <IconArrowRight className="h-3 w-3" />
      </Link>
    </Card>
  );
}
