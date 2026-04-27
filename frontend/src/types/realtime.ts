export interface RealtimeEvent {
  eventId: string;
  type: string;
  version: number;
  entity: string;
  entityId: string;
  data: Record<string, unknown>;
  actorId: string;
  timestamp: string;
  organizationId: string;
}
