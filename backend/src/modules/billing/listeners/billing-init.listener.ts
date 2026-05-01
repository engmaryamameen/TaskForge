import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventType } from '../../../shared/enums';
import { DomainEvent } from '../../../shared/interfaces';
import { BillingService } from '../services/billing.service';

@Injectable()
export class BillingInitListener {
  private readonly logger = new Logger(BillingInitListener.name);

  constructor(private readonly billingService: BillingService) {}

  @OnEvent(EventType.ORGANIZATION_CREATED)
  async onOrgCreated(event: DomainEvent) {
    const { organizationId } = event;
    const email = event.payload?.creatorEmail;
    const orgName = event.payload?.orgName ?? event.payload?.slug ?? '';

    if (!email) {
      this.logger.warn(
        `Cannot initialize billing for org ${organizationId}: missing creatorEmail in event`,
      );
      return;
    }

    try {
      await this.billingService.initializeOrgBilling(
        organizationId,
        email,
        orgName,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to initialize billing for org ${organizationId}: ${error?.message}`,
      );
    }
  }
}
