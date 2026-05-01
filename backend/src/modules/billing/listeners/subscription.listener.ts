import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/interfaces';
import { SubscriptionService } from '../services/subscription.service';
import { RealtimeService } from '../../realtime/services/realtime.service';
import { IQueueService, QUEUE_SERVICE } from '../../../infrastructure/queue';

@Injectable()
export class SubscriptionListener {
  private readonly logger = new Logger(SubscriptionListener.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly realtimeService: RealtimeService,
    @Inject(QUEUE_SERVICE) private readonly queueService: IQueueService,
  ) {}

  @OnEvent('subscription.*')
  async onSubscriptionEvent(event: DomainEvent) {
    if (!event.organizationId) return;

    await this.subscriptionService.invalidateEntitlements(
      event.organizationId,
    );

    this.realtimeService.broadcastToOrg(event.organizationId, event.type, {
      eventId: event.eventId ?? randomUUID(),
      type: event.type,
      version: 1,
      entity: 'subscription',
      entityId: event.payload?.entityId ?? event.organizationId,
      data: event.payload,
      actorId: event.triggeredBy,
      timestamp: event.occurredAt.toISOString(),
      organizationId: event.organizationId,
    });
  }

  @OnEvent('invoice.failed')
  async onInvoiceFailed(event: DomainEvent) {
    await this.queueService.addJob(
      'notification-invoice-failed',
      {
        organizationId: event.organizationId,
        ...event.payload,
      },
      { attempts: 3 },
    );
  }
}
