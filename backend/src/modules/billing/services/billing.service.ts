import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { SubscriptionService } from './subscription.service';
import { StripeService } from './stripe.service';
import { UsageService } from './usage.service';
import { WebhookRepository } from '../repositories/webhook.repository';
import { PlanRepository } from '../repositories/plan.repository';
import { AppError } from '../../../shared/errors/app-error';
import { ErrorCodes } from '../../../shared/errors/error-codes';
import { EventType } from '../../../shared/enums';
import { createDomainEvent } from '../../../shared/interfaces/domain-event.interface';
import {
  PLAN_FREE,
  PLAN_PRO,
  PLAN_ENTERPRISE,
  GRACE_PERIOD_DAYS,
} from '../../../shared/constants';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly stripeService: StripeService,
    private readonly usageService: UsageService,
    private readonly webhookRepository: WebhookRepository,
    private readonly planRepository: PlanRepository,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async initializeOrgBilling(
    organizationId: string,
    creatorEmail: string,
    orgName: string,
  ): Promise<void> {
    // Check if billing already exists (idempotent)
    const existing =
      await this.subscriptionService.ensureBillingExists(organizationId);
    if (existing) return;

    const customer = await this.stripeService.createCustomer(
      creatorEmail,
      orgName,
      { organizationId },
    );

    await this.subscriptionService.createFreeSubscription(
      organizationId,
      customer.id,
    );

    await this.usageService.getOrCreateUsage(organizationId);
    // Initialize with 1 member (the creator)
    await this.usageService.incrementMembers(organizationId);

    this.logger.log(
      `Billing initialized for org ${organizationId} (free plan)`,
    );

    this.eventEmitter.emit(
      EventType.SUBSCRIPTION_CREATED,
      createDomainEvent({
        type: EventType.SUBSCRIPTION_CREATED,
        payload: { entityId: organizationId, planId: PLAN_FREE },
        organizationId,
        triggeredBy: 'system',
      }),
    );
  }

  async createCheckoutSession(
    organizationId: string,
    planId: string,
  ): Promise<{ url: string }> {
    const sub = await this.subscriptionService.getSubscription(organizationId);

    const priceId = this.getPriceId(planId);
    const frontendUrl = this.configService.get<string>('billing.frontendUrl');

    return this.stripeService.createCheckoutSession(sub.stripeCustomerId, priceId, {
      success: `${frontendUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel: `${frontendUrl}/billing/cancel`,
    });
  }

  async createPortalSession(
    organizationId: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    const sub = await this.subscriptionService.getSubscription(organizationId);
    return this.stripeService.createPortalSession(
      sub.stripeCustomerId,
      returnUrl,
    );
  }

  async handleWebhookEvent(event: any): Promise<void> {
    // Idempotency check
    const alreadyProcessed = await this.webhookRepository.isProcessed(event.id);
    if (alreadyProcessed) {
      this.logger.debug(`Webhook already processed: ${event.id}`);
      return;
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(
          event.data.object as any,
        );
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(
          event.data.object as any,
        );
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(
          event.data.object as any,
        );
        break;
      case 'invoice.payment_failed':
        await this.handleInvoiceFailed(
          event.data.object as any,
        );
        break;
      default:
        this.logger.debug(`Unhandled webhook event: ${event.type}`);
    }

    await this.webhookRepository.markProcessed(event.id, event.type);
  }

  private async handleCheckoutCompleted(
    session: any,
  ): Promise<void> {
    const customerId = session.customer as string;
    const sub =
      await this.subscriptionService.getSubscriptionByStripeCustomerId(
        customerId,
      );
    if (!sub) return;

    const stripeSubscriptionId = session.subscription as string;

    // Fetch fresh state from Stripe — webhook data is notification, not truth
    const stripeSub =
      await this.stripeService.fetchSubscription(stripeSubscriptionId);

    const planId = this.mapStripePriceToplanId(stripeSub);

    await this.subscriptionService.updateSubscription(sub.organizationId, {
      stripeSubscriptionId,
      planId,
      status: 'active',
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      gracePeriodEndsAt: null,
    });

    this.logger.log(
      `Checkout completed: org ${sub.organizationId} → ${planId}`,
    );

    this.eventEmitter.emit(
      EventType.SUBSCRIPTION_UPDATED,
      createDomainEvent({
        type: EventType.SUBSCRIPTION_UPDATED,
        payload: {
          entityId: sub.organizationId,
          planId,
          previousPlanId: sub.planId,
          action: 'upgraded',
        },
        organizationId: sub.organizationId,
        triggeredBy: 'stripe',
      }),
    );
  }

  private async handleSubscriptionUpdated(
    stripeSub: any,
  ): Promise<void> {
    const sub = await this.subscriptionService.getSubscriptionByStripeCustomerId(
      stripeSub.customer as string,
    );
    if (!sub) return;

    // Fetch fresh state from Stripe API — source of truth
    const freshSub = await this.stripeService.fetchSubscription(stripeSub.id);
    const planId = this.mapStripePriceToplanId(freshSub);

    await this.subscriptionService.updateSubscription(sub.organizationId, {
      planId,
      status: this.mapStripeStatus(freshSub.status),
      currentPeriodStart: new Date(freshSub.current_period_start * 1000),
      currentPeriodEnd: new Date(freshSub.current_period_end * 1000),
      cancelAtPeriodEnd: freshSub.cancel_at_period_end,
    });

    this.eventEmitter.emit(
      EventType.SUBSCRIPTION_UPDATED,
      createDomainEvent({
        type: EventType.SUBSCRIPTION_UPDATED,
        payload: { entityId: sub.organizationId, planId, status: freshSub.status },
        organizationId: sub.organizationId,
        triggeredBy: 'stripe',
      }),
    );
  }

  private async handleSubscriptionDeleted(
    stripeSub: any,
  ): Promise<void> {
    const sub = await this.subscriptionService.getSubscriptionByStripeCustomerId(
      stripeSub.customer as string,
    );
    if (!sub) return;

    await this.subscriptionService.updateSubscription(sub.organizationId, {
      status: 'canceled',
      planId: PLAN_FREE,
      stripeSubscriptionId: null,
      gracePeriodEndsAt: null,
    });

    this.logger.log(`Subscription canceled: org ${sub.organizationId}`);

    this.eventEmitter.emit(
      EventType.SUBSCRIPTION_CANCELED,
      createDomainEvent({
        type: EventType.SUBSCRIPTION_CANCELED,
        payload: { entityId: sub.organizationId, previousPlanId: sub.planId },
        organizationId: sub.organizationId,
        triggeredBy: 'stripe',
      }),
    );
  }

  private async handleInvoiceFailed(invoice: any): Promise<void> {
    const customerId = invoice.customer as string;
    const sub =
      await this.subscriptionService.getSubscriptionByStripeCustomerId(
        customerId,
      );
    if (!sub) return;

    const gracePeriodEndsAt = new Date();
    gracePeriodEndsAt.setDate(
      gracePeriodEndsAt.getDate() + GRACE_PERIOD_DAYS,
    );

    await this.subscriptionService.updateSubscription(sub.organizationId, {
      status: 'past_due',
      gracePeriodEndsAt,
    });

    this.logger.warn(
      `Invoice failed: org ${sub.organizationId}, grace until ${gracePeriodEndsAt.toISOString()}`,
    );

    this.eventEmitter.emit(
      EventType.INVOICE_FAILED,
      createDomainEvent({
        type: EventType.INVOICE_FAILED,
        payload: {
          entityId: sub.organizationId,
          invoiceId: invoice.id,
          gracePeriodEndsAt: gracePeriodEndsAt.toISOString(),
        },
        organizationId: sub.organizationId,
        triggeredBy: 'stripe',
      }),
    );
  }

  private getPriceId(planId: string): string {
    const map: Record<string, string> = {
      [PLAN_PRO]: this.configService.get<string>(
        'billing.stripePriceIdPro',
        '',
      ),
      [PLAN_ENTERPRISE]: this.configService.get<string>(
        'billing.stripePriceIdEnterprise',
        '',
      ),
    };
    const priceId = map[planId];
    if (!priceId) {
      throw new AppError(ErrorCodes.PLAN_NOT_FOUND, `Unknown plan: ${planId}`, 400);
    }
    return priceId;
  }

  private mapStripePriceToplanId(sub: any): string {
    const priceId = sub.items?.data?.[0]?.price?.id;
    const proPriceId = this.configService.get<string>('billing.stripePriceIdPro');
    const entPriceId = this.configService.get<string>('billing.stripePriceIdEnterprise');

    if (priceId === proPriceId) return PLAN_PRO;
    if (priceId === entPriceId) return PLAN_ENTERPRISE;
    return PLAN_FREE;
  }

  private mapStripeStatus(
    status: string,
  ): 'active' | 'trialing' | 'past_due' | 'incomplete' | 'unpaid' | 'canceled' {
    const map: Record<string, any> = {
      active: 'active',
      trialing: 'trialing',
      past_due: 'past_due',
      incomplete: 'incomplete',
      unpaid: 'unpaid',
      canceled: 'canceled',
      incomplete_expired: 'canceled',
      paused: 'canceled',
    };
    return map[status] ?? 'active';
  }
}
