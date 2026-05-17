import type { Activity, ActivityTabFilter, TaskStatus } from '@/types';
import { EventType } from '@/types';
import { formatTaskStatus } from '@/lib/utils';

function displayName(
  userId: string,
  currentUserId: string,
  nameByUserId: Map<string, string>,
): string {
  if (userId === currentUserId) return 'You';
  return nameByUserId.get(userId) ?? 'Someone';
}

function taskTitle(payload: Record<string, unknown>): string {
  const snap = payload.snapshot as Record<string, unknown> | undefined;
  const t = snap?.title;
  return typeof t === 'string' && t.trim() ? t : 'this task';
}

function projectName(payload: Record<string, unknown>): string {
  const snap = payload.snapshot as Record<string, unknown> | undefined;
  const n = snap?.name ?? snap?.title;
  return typeof n === 'string' && n.trim() ? n : 'this project';
}

/**
 * Human-readable, actor-aware activity line for the timeline.
 */
export function formatActivityLine(
  activity: Activity,
  currentUserId: string,
  nameByUserId: Map<string, string>,
): string {
  const actorId = activity.triggeredBy;
  const subject = displayName(actorId, currentUserId, nameByUserId);
  const p = activity.payload as Record<string, unknown>;
  const snap = p.snapshot as Record<string, unknown> | undefined;
  const changes = p.changes as Record<string, unknown> | undefined;

  switch (activity.eventType) {
    case EventType.TASK_CREATED: {
      const title = taskTitle(p);
      return `${subject} created task “${title}”`;
    }
    case EventType.TASK_UPDATED: {
      const title = taskTitle(p);
      if (
        changes?.status &&
        typeof changes.status === 'string' &&
        snap?.statusBefore &&
        typeof snap.statusBefore === 'string'
      ) {
        const from = formatTaskStatus(snap.statusBefore as TaskStatus);
        const to = formatTaskStatus(changes.status as TaskStatus);
        return `${subject} moved “${title}” from ${from} to ${to}`;
      }
      if (changes?.priority !== undefined) {
        return `${subject} updated priority for “${title}”`;
      }
      if (changes?.dueDate !== undefined || changes?.due_date !== undefined) {
        return `${subject} updated due date for “${title}”`;
      }
      if (changes?.assignedTo !== undefined && typeof changes.assignedTo === 'string') {
        const assigneeName = displayName(changes.assignedTo, currentUserId, nameByUserId);
        const label = assigneeName === 'You' ? 'you' : assigneeName;
        return `${subject} assigned “${title}” to ${label}`;
      }
      return `${subject} updated task “${title}”`;
    }
    case EventType.TASK_DELETED: {
      const title = taskTitle(p);
      return `${subject} deleted task “${title}”`;
    }
    case EventType.PROJECT_CREATED:
      return `${subject} created project “${projectName(p)}”`;
    case EventType.PROJECT_UPDATED:
      return `${subject} updated project “${projectName(p)}”`;
    case EventType.PROJECT_DELETED:
      return `${subject} deleted project “${projectName(p)}”`;
    case EventType.MEMBER_INVITED:
      return `${subject} invited a teammate`;
    case EventType.MEMBER_JOINED: {
      const joiner = displayName(actorId, currentUserId, nameByUserId);
      return joiner === 'You'
        ? 'You joined the organization'
        : `${joiner} joined the organization`;
    }
    case EventType.INVITE_CREATED:
      return `${subject} sent an invitation`;
    case EventType.ORGANIZATION_CREATED: {
      const orgName = (p.orgName as string) || (p.snapshot as Record<string, unknown>)?.name as string || 'the organization';
      return `${subject} created ${typeof orgName === 'string' ? orgName : 'the organization'}`;
    }
    case EventType.USER_REGISTERED:
      return `${subject} joined TaskForge`;
    default:
      return `${subject} ${activity.eventType.replace(/\./g, ' ')}`;
  }
}

export function filterActivities(
  items: Activity[],
  tab: ActivityTabFilter,
  currentUserId: string,
): Activity[] {
  switch (tab) {
    case 'all':
      return items;
    case 'mine':
      return items.filter((a) => a.triggeredBy === currentUserId);
    case 'assigned':
      return items.filter((a) => isAssignedToMeActivity(a, currentUserId));
    case 'tasks':
      return items.filter((a) => a.entityType === 'task');
    case 'projects':
      return items.filter((a) => a.entityType === 'project');
    case 'team':
      return items.filter((a) =>
        ['member', 'organization', 'invite', 'user'].includes(a.entityType),
      );
    default:
      return items;
  }
}

function isAssignedToMeActivity(a: Activity, userId: string): boolean {
  if (a.entityType !== 'task') return false;
  const p = a.payload as {
    snapshot?: { assignedTo?: string };
    changes?: { assignedTo?: string };
  };
  if (a.eventType === EventType.TASK_CREATED && p.snapshot?.assignedTo === userId) {
    return true;
  }
  if (p.changes?.assignedTo === userId) return true;
  return false;
}

export function groupActivitiesByDate(
  activities: Activity[],
): { label: string; items: Activity[] }[] {
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
