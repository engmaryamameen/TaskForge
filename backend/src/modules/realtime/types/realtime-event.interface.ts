/**
 * Client-facing event shape emitted over WebSocket.
 * Flat, serializable, distinct from internal DomainEvent.
 *
 * Deduplication: clients MUST track eventId and ignore duplicates
 * (reconnect and Redis pub/sub can cause re-delivery).
 */
export interface RealtimeEvent {
  eventId: string;
  type: string;
  version: number;
  entity: string;
  entityId: string;
  data: any;
  actorId: string;
  timestamp: string;
  organizationId: string;
}
