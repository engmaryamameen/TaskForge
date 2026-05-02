import type { Activity } from '@/types';
import { EventType, TaskStatus } from '@/types';

function formatTaskStatus(status: string | undefined): string {
  if (status == null || typeof status !== 'string') return 'Unknown';
  switch (status) {
    case TaskStatus.TODO:
      return 'To do';
    case TaskStatus.IN_PROGRESS:
      return 'In progress';
    case TaskStatus.DONE:
      return 'Done';
    default:
      return status.replace(/_/g, ' ');
  }
}

type Snapshot = { title?: string; name?: string; status?: string; projectId?: string };

export function formatActivityLine(activity: Activity, actorDisplayName: string): string {
  const payload = activity.payload as {
    snapshot?: Snapshot;
    changes?: Partial<{ status: string; title: string }>;
    email?: string;
  };

  const snap = payload.snapshot;
  const title = typeof snap?.title === 'string' ? snap.title : undefined;
  const projectName = typeof snap?.name === 'string' ? snap.name : undefined;

  switch (activity.eventType as EventType) {
    case EventType.TASK_CREATED:
      return title
        ? `${actorDisplayName} created task "${title}"`
        : `${actorDisplayName} created a task`;
    case EventType.TASK_UPDATED: {
      const newStatus = payload.changes?.status;
      const oldStatus = snap?.status;
      if (title && newStatus && oldStatus && oldStatus !== newStatus) {
        return `${actorDisplayName} moved "${title}" to ${formatTaskStatus(newStatus)}`;
      }
      return title ? `${actorDisplayName} updated "${title}"` : `${actorDisplayName} updated a task`;
    }
    case EventType.TASK_DELETED:
      return title ? `${actorDisplayName} removed "${title}"` : `${actorDisplayName} removed a task`;
    case EventType.PROJECT_CREATED:
      return projectName
        ? `${actorDisplayName} created project "${projectName}"`
        : `${actorDisplayName} created a project`;
    case EventType.PROJECT_UPDATED:
      return projectName ? `${actorDisplayName} updated "${projectName}"` : `${actorDisplayName} updated a project`;
    case EventType.PROJECT_DELETED:
      return projectName ? `${actorDisplayName} removed "${projectName}"` : `${actorDisplayName} removed a project`;
    case EventType.MEMBER_JOINED:
      return `${actorDisplayName} joined the workspace`;
    case EventType.INVITE_CREATED: {
      const email = payload.email;
      return email
        ? `${actorDisplayName} invited "${email}"`
        : `${actorDisplayName} sent an invitation`;
    }
    case EventType.MEMBER_INVITED:
      return `${actorDisplayName} invited a teammate`;
    default: {
      const raw = activity.eventType ?? 'update';
      return `${actorDisplayName} ${String(raw).replace(/\./g, ' ')}`;
    }
  }
}

export function resolveActorDisplayName(
  triggeredByUserId: string | null | undefined,
  memberNamesByUserId: Map<string, string>,
  currentUserId?: string,
): string {
  if (!triggeredByUserId) return 'Someone';
  if (currentUserId && triggeredByUserId === currentUserId) return 'You';
  return memberNamesByUserId.get(triggeredByUserId) ?? 'Someone';
}
