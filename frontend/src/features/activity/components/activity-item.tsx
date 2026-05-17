'use client';

import { Avatar } from '@/components/ui/avatar';
import { formatRelative } from '@/lib/utils';
import type { Activity } from '@/types';

const ENTITY_ICONS: Record<string, { bg: string; color: string; label: string }> = {
  task:         { bg: 'bg-primary-100', color: 'text-primary-600', label: 'Task' },
  project:      { bg: 'bg-purple-100',  color: 'text-purple-600',  label: 'Project' },
  member:       { bg: 'bg-success-100', color: 'text-success-600', label: 'Member' },
  invite:       { bg: 'bg-warning-100', color: 'text-warning-600', label: 'Invite' },
  organization: { bg: 'bg-info-100',    color: 'text-info-600',    label: 'Organization' },
  user:         { bg: 'bg-neutral-100', color: 'text-neutral-600', label: 'User' },
};

interface ActivityItemProps {
  activity: Activity;
  message: string;
  actorName: string;
  selected?: boolean;
  onClick?: () => void;
}

export function ActivityItem({ activity, message, actorName, selected, onClick }: ActivityItemProps) {
  const entityType = activity.entityType || activity.eventType?.split('.')[0] || 'default';
  const config = ENTITY_ICONS[entityType] || { bg: 'bg-neutral-100', color: 'text-neutral-500', label: entityType };
  const initials = actorName === 'You' ? undefined : actorName;

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3.5 rounded-xl px-4 py-3.5 text-left transition-all ${
        selected
          ? 'bg-primary-50 shadow-xs'
          : 'hover:bg-neutral-50'
      }`}
    >
      {initials ? (
        <Avatar firstName={initials.split(' ')[0]} lastName={initials.split(' ')[1]} size="sm" />
      ) : (
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${config.bg} ${config.color}`}>
          <span className="text-[10px] font-bold">{config.label.charAt(0)}</span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm text-neutral-900 leading-snug">{message}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${config.bg} ${config.color}`}>
            {config.label}
          </span>
          <span className="text-[11px] text-neutral-400">{formatRelative(activity.createdAt)}</span>
        </div>
      </div>
    </button>
  );
}
