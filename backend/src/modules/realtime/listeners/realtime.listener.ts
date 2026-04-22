import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/interfaces/domain-event.interface';
import { RealtimeService } from '../services/realtime.service';
import { RealtimeEvent } from '../types/realtime-event.interface';
import { isRealtimeEvent } from '../types/realtime-events';

@Injectable()
export class RealtimeListener {
  private readonly logger = new Logger(RealtimeListener.name);

  constructor(private readonly realtimeService: RealtimeService) {}

  @OnEvent('task.*')
  handleTaskEvent(event: DomainEvent) {
    this.forwardIfAllowed(event);
  }

  @OnEvent('project.*')
  handleProjectEvent(event: DomainEvent) {
    this.forwardIfAllowed(event);
  }

  @OnEvent('member.*')
  handleMemberEvent(event: DomainEvent) {
    this.forwardIfAllowed(event);
  }

  private forwardIfAllowed(event: DomainEvent): void {
    if (!isRealtimeEvent(event.type)) return;
    if (!event.organizationId) return;

    const realtimeEvent: RealtimeEvent = {
      eventId: event.eventId ?? randomUUID(),
      type: event.type,
      version: 1,
      entity: event.type.split('.')[0],
      entityId: event.payload?.entityId ?? '',
      data: event.payload,
      actorId: event.triggeredBy,
      timestamp: event.occurredAt.toISOString(),
      organizationId: event.organizationId,
    };

    this.realtimeService.broadcastToOrg(
      event.organizationId,
      event.type,
      realtimeEvent,
    );
  }
}
