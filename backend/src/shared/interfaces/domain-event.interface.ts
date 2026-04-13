export interface DomainEvent<T = any> {
  type: string;
  payload: T;
  occurredAt: Date;
  organizationId: string;
  triggeredBy: string;
}
