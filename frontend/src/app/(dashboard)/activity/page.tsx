'use client';

import { useMemo, useCallback, useState } from 'react';
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
import { ActivityItem } from '@/features/activity/components/activity-item';
import { ActivityDetailPanel } from '@/features/activity/components/activity-detail-panel';
import { ActivityEmptyState } from '@/features/activity/components/activity-empty-state';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { PageHero } from '@/components/ui/page-hero';
import type { Activity, ActivityTabFilter } from '@/types';

const VALID_TABS = new Set<ActivityTabFilter>(['all', 'mine', 'assigned', 'tasks', 'projects', 'team']);

export default function ActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const { data: members } = useOrgMembers();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const viewRaw = searchParams.get('view') || '';
  const tab: ActivityTabFilter = VALID_TABS.has(viewRaw as ActivityTabFilter)
    ? (viewRaw as ActivityTabFilter)
    : 'all';

  const setTab = useCallback(
    (next: ActivityTabFilter) => {
      const p = new URLSearchParams(searchParams.toString());
      if (next === 'all') p.delete('view');
      else p.set('view', next);
      const qs = p.toString();
      router.replace(qs ? `/activity?${qs}` : '/activity');
    },
    [router, searchParams],
  );

  const { data, isLoading, isError, refetch } = useActivity({ limit: 100 });

  const nameByUserId = useMemo(() => {
    const m = new Map<string, string>();
    if (user) m.set(user.id, `${user.firstName} ${user.lastName}`.trim());
    members?.forEach((mem) => {
      if (mem.user) m.set(mem.userId, `${mem.user.firstName} ${mem.user.lastName}`.trim());
    });
    return m;
  }, [user, members]);

  const activities = data?.data;
  const filtered = useMemo(() => {
    if (!activities || !user) return [];
    return filterActivities(activities, tab, user.id);
  }, [activities, tab, user]);

  const groups = useMemo(() => groupActivitiesByDate(filtered), [filtered]);

  const selectedActivity = useMemo(
    () => filtered.find((a) => a.id === selectedId) ?? null,
    [filtered, selectedId],
  );

  function getActorName(activity: Activity): string {
    if (!user) return 'Someone';
    if (activity.triggeredBy === user.id) return 'You';
    return nameByUserId.get(activity.triggeredBy) ?? 'Someone';
  }

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError) return <ErrorState onRetry={refetch} />;

  if (!activities || activities.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHero title="Activity" subtitle="A living timeline of what happens in your organization." />
        <div className="mt-6"><ActivityFilters active={tab} onChange={setTab} /></div>
        <div className="mt-8"><ActivityEmptyState /></div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <PageHero title="Activity" subtitle="Follow organization updates and your team's work in one place." />
      <div className="mt-6"><ActivityFilters active={tab} onChange={setTab} /></div>

      <div className="mt-6 flex gap-6">
        <div className={`flex-1 min-w-0 space-y-6 ${selectedActivity ? 'max-w-[60%]' : ''}`}>
          {filtered.length === 0 ? (
            <p className="mt-8 text-center text-sm text-neutral-500">
              Nothing in this view yet. Try another filter.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{group.label}</span>
                  <div className="h-px flex-1 bg-neutral-100" />
                </div>
                <div className="space-y-1">
                  {group.items.map((activity) => {
                    const msg = user ? formatActivityLine(activity, user.id, nameByUserId) : '';
                    return (
                      <ActivityItem
                        key={activity.id}
                        activity={activity}
                        message={msg}
                        actorName={getActorName(activity)}
                        selected={activity.id === selectedId}
                        onClick={() => setSelectedId(activity.id === selectedId ? null : activity.id)}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedActivity && (
          <div className="hidden lg:block w-[380px] shrink-0 sticky top-0 h-[calc(100vh-160px)] rounded-xl overflow-hidden shadow-soft">
            <ActivityDetailPanel
              activity={selectedActivity}
              message={user ? formatActivityLine(selectedActivity, user.id, nameByUserId) : ''}
              actorName={getActorName(selectedActivity)}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
