'use client';

import { useActivity } from '@/features/activity/hooks/useActivity';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { formatRelative } from '@/lib/utils';
import type { Activity } from '@/types';

function getActivityMessage(activity: Activity): string {
  switch (activity.eventType) {
    case 'task.created':
      return 'created a task';
    case 'task.updated':
      return 'updated a task';
    case 'task.deleted':
      return 'deleted a task';
    case 'project.created':
      return 'created a project';
    case 'project.updated':
      return 'updated a project';
    case 'project.deleted':
      return 'deleted a project';
    case 'member.invited':
      return 'invited a member';
    case 'member.joined':
      return 'joined the organization';
    default:
      return activity.eventType;
  }
}

function getActivityEntityType(activity: Activity): string | undefined {
  if (activity.entityType === 'task' || activity.eventType.startsWith('task.')) return 'task';
  if (activity.entityType === 'project' || activity.eventType.startsWith('project.')) return 'project';
  return undefined;
}

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
        <h1 className="mb-6 text-2xl font-bold text-neutral-900">Activity</h1>
        <EmptyState
          title="No activity yet"
          description="Activity will appear here as your team creates projects and tasks."
        />
      </div>
    );
  }

  const groups = groupByDate(activities);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Activity</h1>

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <h2 className="mb-3 text-sm font-medium text-neutral-500">{group.label}</h2>
            <div className="rounded-lg bg-white shadow-soft">
              {group.items.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 border-b border-neutral-100 px-5 py-4 last:border-0"
                >
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700">
                    {getActivityEntityType(activity)?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-900">
                      {getActivityMessage(activity)}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {formatRelative(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
