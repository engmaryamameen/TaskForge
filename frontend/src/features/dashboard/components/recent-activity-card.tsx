'use client';

import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRelative } from '@/lib/utils';
import type { Activity } from '@/types';
import type { Membership } from '@/types';
import { formatActivityLine, resolveActorDisplayName } from '@/features/dashboard/lib/activity-format';
import { IconBolt, IconArrowRight } from '@/components/icons';

const ENTITY_ICONS: Record<string, { bg: string; text: string; letter: string }> = {
  task: { bg: 'bg-primary-100', text: 'text-primary-700', letter: 'T' },
  project: { bg: 'bg-purple-100', text: 'text-purple-700', letter: 'P' },
  member: { bg: 'bg-success-100', text: 'text-success-700', letter: 'M' },
  invite: { bg: 'bg-warning-100', text: 'text-warning-700', letter: 'I' },
};

interface RecentActivityCardProps {
  activities: Activity[];
  members: Membership[] | undefined;
  currentUserId: string | undefined;
  onCreateTask: () => void;
}

function memberNameMap(members: Membership[] | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!members) return map;
  for (const m of members) {
    const u = m.user;
    const label =
      u?.firstName || u?.lastName
        ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
        : u?.email ?? 'Member';
    map.set(m.userId, label);
  }
  return map;
}

export function RecentActivityCard({
  activities,
  members,
  currentUserId,
  onCreateTask,
}: RecentActivityCardProps) {
  const names = memberNameMap(members);
  const activityIsEmpty = activities.length === 0;

  return (
    <Card className="h-full" padding="lg" hover>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-50 ring-1 ring-neutral-200/80">
            <IconBolt className="h-4 w-4 text-neutral-600" />
          </div>
          <div>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Latest updates</CardDescription>
          </div>
        </div>
        <Link href="/activity">
          <Button variant="ghost" size="xs" rightIcon={<IconArrowRight className="h-3 w-3" />}>
            All
          </Button>
        </Link>
      </CardHeader>

      {!activityIsEmpty ? (
        <div className="-mx-1 max-h-[320px] space-y-0.5 overflow-y-auto pr-1">
          {activities.map((activity) => {
            const entityType = activity.entityType || activity.eventType?.split('.')[0] || 'default';
            const icon = ENTITY_ICONS[entityType] || {
              bg: 'bg-neutral-100',
              text: 'text-neutral-600',
              letter: '?',
            };
            const actor = resolveActorDisplayName(activity.triggeredBy, names, currentUserId);
            const line = formatActivityLine(activity, actor);

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-neutral-50"
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${icon.bg} ${icon.text}`}
                >
                  {icon.letter}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-neutral-800">{line}</p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">{formatRelative(activity.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-200/90 bg-gradient-to-b from-neutral-50/80 to-white px-4 py-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-xs ring-1 ring-neutral-100">
            <IconBolt className="h-5 w-5 text-primary-500" />
          </div>
          <p className="text-sm font-semibold text-neutral-800">Nothing in the feed yet</p>
          <p className="mx-auto mt-2 max-w-[240px] text-xs leading-relaxed text-neutral-500">
            Create a task or invite someone — updates will appear here as your team works.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button type="button" variant="secondary" size="sm" onClick={onCreateTask}>
              Create task
            </Button>
            <Link href="/organizations">
              <Button variant="ghost" size="sm">
                Invite teammates
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}
