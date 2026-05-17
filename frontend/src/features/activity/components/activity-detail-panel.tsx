'use client';

import { Avatar } from '@/components/ui/avatar';
import { IconX } from '@/components/icons';
import { formatRelative, formatDate } from '@/lib/utils';
import type { Activity } from '@/types';

const ENTITY_ICONS: Record<string, { bg: string; color: string; label: string }> = {
  task:         { bg: 'bg-primary-100', color: 'text-primary-600', label: 'Task' },
  project:      { bg: 'bg-purple-100',  color: 'text-purple-600',  label: 'Project' },
  member:       { bg: 'bg-success-100', color: 'text-success-600', label: 'Member' },
  invite:       { bg: 'bg-warning-100', color: 'text-warning-600', label: 'Invite' },
  organization: { bg: 'bg-info-100',    color: 'text-info-600',    label: 'Organization' },
  user:         { bg: 'bg-neutral-100', color: 'text-neutral-600', label: 'User' },
};

interface ActivityDetailPanelProps {
  activity: Activity;
  message: string;
  actorName: string;
  onClose: () => void;
}

export function ActivityDetailPanel({ activity, message, actorName, onClose }: ActivityDetailPanelProps) {
  const entityType = activity.entityType || activity.eventType?.split('.')[0] || 'default';
  const config = ENTITY_ICONS[entityType] || { bg: 'bg-neutral-100', color: 'text-neutral-500', label: entityType };
  const payload = activity.payload as Record<string, unknown>;
  const snapshot = payload?.snapshot as Record<string, unknown> | undefined;
  const changes = payload?.changes as Record<string, unknown> | undefined;

  return (
    <div className="flex h-full flex-col bg-white shadow-large animate-slide-in-right">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-neutral-900">Activity detail</h3>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
        >
          <IconX className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <div className="flex items-start gap-3">
          <Avatar firstName={actorName.split(' ')[0]} lastName={actorName.split(' ')[1]} size="md" />
          <div>
            <p className="text-sm font-semibold text-neutral-900">{actorName}</p>
            <p className="text-xs text-neutral-400">{formatRelative(activity.createdAt)}</p>
          </div>
        </div>

        <div className="rounded-xl bg-neutral-50 p-4">
          <p className="text-sm text-neutral-800 leading-relaxed">{message}</p>
        </div>

        <div className="space-y-3">
          <DetailRow label="Type">
            <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${config.bg} ${config.color}`}>
              {config.label}
            </span>
          </DetailRow>
          <DetailRow label="Event">{activity.eventType.replace(/\./g, ' ')}</DetailRow>
          <DetailRow label="Date">{formatDate(activity.createdAt)}</DetailRow>
          {activity.entityId && (
            <DetailRow label="Entity ID">
              <span className="font-mono text-xs">{activity.entityId}</span>
            </DetailRow>
          )}
        </div>

        {snapshot && Object.keys(snapshot).length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Snapshot</p>
            <div className="space-y-1.5">
              {Object.entries(snapshot).map(([key, val]) => (
                <DetailRow key={key} label={key}>{String(val)}</DetailRow>
              ))}
            </div>
          </div>
        )}

        {changes && Object.keys(changes).length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Changes</p>
            <div className="space-y-1.5">
              {Object.entries(changes).map(([key, val]) => (
                <DetailRow key={key} label={key}>{String(val)}</DetailRow>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-neutral-500 capitalize">{label}</span>
      <span className="text-right text-neutral-900">{children}</span>
    </div>
  );
}
