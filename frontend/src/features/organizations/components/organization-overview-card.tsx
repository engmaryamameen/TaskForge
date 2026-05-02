'use client';

import type { OrganizationWithRole } from '@/types';
import { Role } from '@/types';
import { formatDate, formatRelative } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconCheck, IconFolder, IconCheckSquare, IconUsers } from '@/components/icons';

interface OrganizationOverviewCardProps {
  org: OrganizationWithRole;
  isCurrent: boolean;
  onSwitch: () => void;
  switchPending: boolean;
  memberCount?: number;
  projectCount?: number;
  taskCount?: number;
}

export function OrganizationOverviewCard({
  org,
  isCurrent,
  onSwitch,
  switchPending,
  memberCount,
  projectCount,
  taskCount,
}: OrganizationOverviewCardProps) {
  const showStats =
    isCurrent &&
    memberCount !== undefined &&
    projectCount !== undefined &&
    taskCount !== undefined;

  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        isCurrent
          ? 'border-primary-200/90 bg-linear-to-br from-primary-50/40 to-white shadow-sm'
          : 'border-neutral-200 bg-white shadow-xs'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold ${
              isCurrent
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {org.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`truncate text-base font-semibold ${
                  isCurrent ? 'text-primary-800' : 'text-neutral-900'
                }`}
              >
                {org.name}
              </h3>
              <Badge variant={org.role === Role.ADMIN ? 'admin' : 'member'}>
                {org.role}
              </Badge>
            </div>
            <p className="mt-0.5 font-mono text-xs text-neutral-500">{org.slug}</p>
            <p className="mt-1 text-[12px] text-neutral-400">
              Created {formatDate(org.createdAt)} · {formatRelative(org.createdAt)}
            </p>
            {showStats && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg border border-neutral-200/80 bg-white px-2.5 py-1 text-[12px] text-neutral-600">
                  <IconUsers className="h-3.5 w-3.5" />
                  {memberCount} {memberCount === 1 ? 'member' : 'members'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-neutral-200/80 bg-white px-2.5 py-1 text-[12px] text-neutral-600">
                  <IconFolder className="h-3.5 w-3.5" />
                  {projectCount} {projectCount === 1 ? 'project' : 'projects'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-neutral-200/80 bg-white px-2.5 py-1 text-[12px] text-neutral-600">
                  <IconCheckSquare className="h-3.5 w-3.5" />
                  {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
          {isCurrent ? (
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-primary-600">
              <IconCheck className="h-3.5 w-3.5" />
              Active workspace
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={onSwitch}
              disabled={switchPending}
            >
              Switch
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
