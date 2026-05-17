import { EventType } from '@/types';

/**
 * Socket event names that the frontend listens to.
 * These match the backend's domain event types broadcast via RealtimeListener.
 */
export const SocketEvents = {
  // Tasks
  TASK_CREATED: EventType.TASK_CREATED,
  TASK_UPDATED: EventType.TASK_UPDATED,
  TASK_DELETED: EventType.TASK_DELETED,

  // Projects
  PROJECT_CREATED: EventType.PROJECT_CREATED,
  PROJECT_UPDATED: EventType.PROJECT_UPDATED,
  PROJECT_DELETED: EventType.PROJECT_DELETED,

  // Members
  MEMBER_INVITED: EventType.MEMBER_INVITED,
  MEMBER_JOINED: EventType.MEMBER_JOINED,

  // Billing
  SUBSCRIPTION_CREATED: EventType.SUBSCRIPTION_CREATED,
  SUBSCRIPTION_UPDATED: EventType.SUBSCRIPTION_UPDATED,
  SUBSCRIPTION_CANCELED: EventType.SUBSCRIPTION_CANCELED,

  // Direct notification from NotificationsService
  NOTIFICATION: 'notification',
} as const;

export type SocketEventName = (typeof SocketEvents)[keyof typeof SocketEvents];
