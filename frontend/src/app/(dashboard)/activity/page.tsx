'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActivity } from '@/features/activity/hooks/useActivity';
import { useOrgMembers } from '@/features/organizations/hooks/useOrganizations';
import { useAuthStore } from '@/store/auth.store';
import {
  formatActivityLine,
  filterActivities,
  groupActivitiesByDate,
} from '@/features/activity/lib/activity-format';
import { ActivityFilters } from '@/features/activity/components/activity-filters';
import { ActivityEmptyState } from '@/features/activity/components/activity-empty-state';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Card } from '@/components/ui/card';
import { PageHero } from '@/components/ui/page-hero';
import { formatRelative } from '@/lib/utils';
import type { ActivityTabFilter } from '@/types';

const VALID_TABS = new Set<ActivityTabFilter>([
  'all',
  'mine',
  'assigned',
  'tasks',
  'projects',
  'team',
]);

const ENTITY_CONFIG: Record<string, { color: string; icon: string }> = {
  task: { color: 'bg-primary-100 text-primary-700', icon: 'T' },
  project: { color: 'bg-purple-100 text-purple-700', icon: 'P' },
  member: { color: 'bg-success-100 text-success-700', icon: 'M' },
  invite: { color: 'bg-warning-100 text-warning-700', icon: 'I' },
  organization: { color: 'bg-teal-50 text-teal-600', icon: 'O' },
  user: { color: 'bg-info-100 text-info-600', icon: 'U' },
};

export default function ActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const { data: members } = useOrgMembers();

  const viewRaw = searchParams.get('view') || '';
  const tab: ActivityTabFilter = VALID_TABS.has(viewRaw as ActivityTabFilter)
    ? (viewRaw as ActivityTabFilter)
    : 'all';

  const setTab = useCallback(
    (next: ActivityTabFilter) => {
      const p = new URLSearchParams(searchParams.toString());
      if (next === 'all') {
        p.delete('view');
      } else {
        p.set('view', next);
      }
      const qs = p.toString();
      router.replace(qs ? `/activity?${qs}` : '/activity');
    },
    [router, searchParams],
  );

  const { data, isLoading, isError, refetch } = useActivity({ limit: 100 });

  const nameByUserId = useMemo(() => {
    const m = new Map<string, string>();
    if (user) {
      m.set(user.id, `${user.firstName} ${user.lastName}`.trim());
    }
    members?.forEach((mem) => {
      if (mem.user) {
        m.set(
          mem.userId,
          `${mem.user.firstName} ${mem.user.lastName}`.trim(),
        );
      }
    });
    return m;
  }, [user, members]);

  const activities = data?.data;
  const filtered = useMemo(() => {
    if (!activities || !user) return [];
    return filterActivities(activities, tab, user.id);
  }, [activities, tab, user]);

  const groups = useMemo(() => groupActivitiesByDate(filtered), [filtered]);

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError) return <ErrorState onRetry={refetch} />;

  if (!activities || activities.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHero title="Activity" subtitle="A living timeline of what happens in your organization." />
        <div className="mt-6">
          <ActivityFilters active={tab} onChange={setTab} />
        </div>
        <div className="mt-8">
          <ActivityEmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <PageHero title="Activity" subtitle="Follow organization updates and your team's work in one place." />

      <div className="mt-6">
        <ActivityFilters active={tab} onChange={setTab} />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-neutral-500">
          Nothing in this view yet. Try another filter or check back soon.
        </p>
      ) : (
        <div className="mt-8 space-y-8">
          {groups.map((group) => (
            <div key={group.label}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {group.label}
              </h2>
              <Card padding="none">
                {group.items.map((activity, index) => {
                  const entityType =
                    activity.entityType ||
                    activity.eventType?.split('.')[0] ||
                    'default';
                  const config = ENTITY_CONFIG[entityType] || {
                    color: 'bg-neutral-100 text-neutral-600',
                    icon: '?',
                  };
                  const message =
                    user &&
                    formatActivityLine(activity, user.id, nameByUserId);
                  return (
                    <div
                      key={activity.id}
                      className={`flex items-start gap-3.5 px-5 py-4 ${
                        index < group.items.length - 1
                          ? 'border-b border-neutral-100'
                          : ''
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${config.color}`}
                      >
                        {config.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug text-neutral-800">
                          {message}
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
      )}
    </div>
  );
}
