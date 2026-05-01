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
