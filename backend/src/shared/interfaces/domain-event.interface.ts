import { randomUUID } from 'crypto';

export interface DomainEvent<T = any> {
  eventId?: string;
  type: string;
  payload: T;
  occurredAt: Date;
  organizationId: string;
  triggeredBy: string;
}

/**
 * Factory for creating domain events with auto-generated eventId and timestamp.
 * All event emissions MUST use this factory — never construct raw objects.
 */
export function createDomainEvent<T>(
  params: Omit<DomainEvent<T>, 'eventId' | 'occurredAt'>,
): DomainEvent<T> {
  return {
    eventId: randomUUID(),
    occurredAt: new Date(),
    ...params,
  };
}
