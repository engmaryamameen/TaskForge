import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import { PlanRepository } from '../repositories/plan.repository';
import { UsageRepository } from '../repositories/usage.repository';
import { Subscription } from '../entities/subscription.entity';
import { Entitlements } from '../interfaces/entitlements.interface';
import { ICacheService, CACHE_SERVICE } from '../../../infrastructure/cache';
import { AppError } from '../../../shared/errors/app-error';
import { ErrorCodes } from '../../../shared/errors/error-codes';
import { ENTITLEMENTS_CACHE_TTL, PLAN_FREE } from '../../../shared/constants';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly planRepository: PlanRepository,
    private readonly usageRepository: UsageRepository,
    @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createFreeSubscription(
    organizationId: string,
    stripeCustomerId: string,
  ): Promise<Subscription> {
    return this.subscriptionRepository.create({
      organizationId,
      planId: PLAN_FREE,
      status: 'active',
      stripeCustomerId,
    });
  }

  async getSubscription(organizationId: string): Promise<Subscription> {
    const sub = await this.subscriptionRepository.findByOrgId(organizationId);
    if (!sub) {
      throw new AppError(
        ErrorCodes.SUBSCRIPTION_NOT_FOUND,
        'No subscription found for this organization',
        404,
      );
    }
    return sub;
  }

  async getSubscriptionByStripeCustomerId(
    stripeCustomerId: string,
  ): Promise<Subscription | null> {
    return this.subscriptionRepository.findByStripeCustomerId(stripeCustomerId);
  }

  async updateSubscription(
    organizationId: string,
    data: Partial<Subscription>,
  ): Promise<void> {
    const sub = await this.getSubscription(organizationId);

    // Validate state transition if status is changing
    if (data.status && data.status !== sub.status) {
      this.validateTransition(sub.status, data.status);
    }

    await this.subscriptionRepository.update(sub.id, data);
    await this.invalidateEntitlements(organizationId);
  }

  private static readonly VALID_TRANSITIONS: Record<string, string[]> = {
    incomplete: ['trialing', 'active', 'canceled'],
    trialing: ['active', 'past_due', 'canceled'],
    active: ['past_due', 'canceled'],
    past_due: ['active', 'unpaid', 'canceled'],
    unpaid: ['active', 'canceled'],
    canceled: ['active'], // reactivation via new checkout
  };

  private validateTransition(from: string, to: string): void {
    const allowed = SubscriptionService.VALID_TRANSITIONS[from];
    if (!allowed?.includes(to)) {
      this.logger.warn(
        `Invalid subscription transition: ${from} → ${to} (allowed: ${allowed?.join(', ')})`,
      );
    }
  }

  async getEntitlements(organizationId: string): Promise<Entitlements> {
    // Check versioned cache
    const sub = await this.subscriptionRepository.findByOrgId(organizationId);
    if (!sub) {
      return this.defaultFreeEntitlements();
    }

    const cacheKey = `cache:entitlements:${organizationId}:${sub.entitlementsVersion}`;
    const cached = await this.cacheService.get<Entitlements>(cacheKey);
    if (cached) return cached;

    // Compute from DB
    const subWithPlan =
      await this.subscriptionRepository.findByOrgIdWithPlan(organizationId);
    if (!subWithPlan?.plan) {
      return this.defaultFreeEntitlements();
    }

    const usage = await this.usageRepository.findByOrgId(organizationId);

    const entitlements: Entitlements = {
      planId: subWithPlan.planId,
      maxMembers: subWithPlan.plan.maxMembers,
      maxProjects: subWithPlan.plan.maxProjects,
      features: subWithPlan.plan.features,
      usage: {
        projects: usage?.projectsCount ?? 0,
        members: usage?.membersCount ?? 0,
        tasks: usage?.tasksCount ?? 0,
      },
      isActive: this.isSubscriptionActive(subWithPlan),
    };

    await this.cacheService.set(cacheKey, entitlements, ENTITLEMENTS_CACHE_TTL);
    return entitlements;
  }

  async invalidateEntitlements(organizationId: string): Promise<void> {
    await this.subscriptionRepository.bumpEntitlementsVersion(organizationId);
    this.logger.debug(`Entitlements invalidated for org ${organizationId}`);
  }

  async ensureBillingExists(
    organizationId: string,
  ): Promise<Subscription | null> {
    return this.subscriptionRepository.findByOrgId(organizationId);
  }

  private isSubscriptionActive(sub: Subscription): boolean {
    if (['active', 'trialing'].includes(sub.status)) return true;
    if (
      sub.status === 'past_due' &&
      sub.gracePeriodEndsAt &&
      new Date(sub.gracePeriodEndsAt) > new Date()
    ) {
      return true;
    }
    return false;
  }

  private defaultFreeEntitlements(): Entitlements {
    return {
      planId: PLAN_FREE,
      maxMembers: 5,
      maxProjects: 3,
      features: { realtime: false, advanced_reports: false },
      usage: { projects: 0, members: 0, tasks: 0 },
      isActive: true,
    };
  }
}
