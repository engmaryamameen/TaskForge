import type { PaginationParams } from './api';
import { EventType } from './enums';

export interface Activity {
  id: string;
  organizationId: string;
  eventType: EventType;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
  triggeredBy: string;
  createdAt: string;
}

export interface ActivityListParams extends PaginationParams {
  entityType?: string;
  entityId?: string;
  triggeredBy?: string;
}

export type ActivityTabFilter =
  | 'all'
  | 'mine'
  | 'assigned'
  | 'tasks'
  | 'projects'
  | 'team';
