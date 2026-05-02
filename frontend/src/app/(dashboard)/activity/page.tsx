'use client';

import { useActivity } from '@/features/activity/hooks/useActivity';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card } from '@/components/ui/card';
import { formatRelative } from '@/lib/utils';
import { IconActivity } from '@/components/icons';
import type { Activity } from '@/types';

function getActivityMessage(activity: Activity): string {
  const snapshot = (activity.payload as Record<string, any>)?.snapshot;
  const entityName = snapshot?.title || snapshot?.name || '';

  switch (activity.eventType) {
    case 'task.created':
      return `Created task${entityName ? ` "${entityName}"` : ''}`;
    case 'task.updated':
      return `Updated task${entityName ? ` "${entityName}"` : ''}`;
    case 'task.deleted':
      return `Deleted task${entityName ? ` "${entityName}"` : ''}`;
    case 'project.created':
      return `Created project${entityName ? ` "${entityName}"` : ''}`;
    case 'project.updated':
      return `Updated project${entityName ? ` "${entityName}"` : ''}`;
    case 'project.deleted':
      return `Deleted project${entityName ? ` "${entityName}"` : ''}`;
    case 'member.invited':
      return 'Invited a team member';
    case 'member.joined':
      return 'Joined the organization';
    case 'invite.created':
      return 'Created an invitation';
    default:
      return activity.eventType.replace('.', ' ');
  }
}

const ENTITY_CONFIG: Record<string, { color: string; icon: string }> = {
  task: { color: 'bg-primary-100 text-primary-700', icon: 'T' },
  project: { color: 'bg-purple-100 text-purple-700', icon: 'P' },
  member: { color: 'bg-success-100 text-success-700', icon: 'M' },
  invite: { color: 'bg-warning-100 text-warning-700', icon: 'I' },
  organization: { color: 'bg-teal-50 text-teal-600', icon: 'O' },
  user: { color: 'bg-info-100 text-info-600', icon: 'U' },
};

function groupByDate(activities: Activity[]): { label: string; items: Activity[] }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: Activity[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Earlier', items: [] },
  ];

  for (const activity of activities) {
    const date = new Date(activity.createdAt);
    date.setHours(0, 0, 0, 0);
    if (date.getTime() >= today.getTime()) {
      groups[0].items.push(activity);
    } else if (date.getTime() >= yesterday.getTime()) {
      groups[1].items.push(activity);
    } else {
      groups[2].items.push(activity);
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

export default function ActivityPage() {
  const { data, isLoading, isError, refetch } = useActivity();

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const activities = data?.data;
  if (!activities || activities.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Activity</h1>
          <p className="mt-1 text-sm text-neutral-500">Track all changes across your workspace.</p>
        </div>
        <EmptyState
          title="No activity yet"
          description="Activity will appear here as your team creates projects, tasks, and invites members."
          icon={<IconActivity className="h-6 w-6" />}
        />
      </div>
    );
  }

  const groups = groupByDate(activities);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Activity</h1>
        <p className="mt-1 text-sm text-neutral-500">Track all changes across your workspace.</p>
      </div>

      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.label}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">{group.label}</h2>
            <Card padding="none">
              {group.items.map((activity, index) => {
                const entityType = activity.entityType || activity.eventType?.split('.')[0] || 'default';
                const config = ENTITY_CONFIG[entityType] || { color: 'bg-neutral-100 text-neutral-600', icon: '?' };
                return (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-3.5 px-5 py-4 ${
                      index < group.items.length - 1 ? 'border-b border-neutral-100' : ''
                    }`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${config.color}`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-800 leading-snug">
                        {getActivityMessage(activity)}
                      </p>
                      <p className="mt-1 text-[11px] text-neutral-400">
                        {formatRelative(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
