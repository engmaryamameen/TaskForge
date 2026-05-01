import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionService } from '../services/subscription.service';
import { REQUIRE_LIMIT_KEY } from '../decorators/require-limit.decorator';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { AppError } from '../../../shared/errors/app-error';
import { ErrorCodes } from '../../../shared/errors/error-codes';
import { Entitlements } from '../interfaces/entitlements.interface';

const metricToEntitlementLimit: Record<string, keyof Entitlements> = {
  projects: 'maxProjects',
  members: 'maxMembers',
};

const metricToUsageField: Record<string, keyof Entitlements['usage']> = {
  projects: 'projects',
  members: 'members',
  tasks: 'tasks',
};

@Injectable()
export class LimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const metric = this.reflector.getAllAndOverride<string>(
      REQUIRE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!metric) return true;

    const request = context.switchToHttp().getRequest();
    const orgId = request.user?.organizationId;
    if (!orgId) return true;

    const entitlements = await this.getEntitlements(request, orgId);

    if (!entitlements.isActive) {
      throw new AppError(
        ErrorCodes.SUBSCRIPTION_INACTIVE,
        'Your subscription is not active',
        403,
      );
    }

    const limitKey = metricToEntitlementLimit[metric];
    const usageKey = metricToUsageField[metric];

    if (!limitKey || !usageKey) return true;

    const limit = entitlements[limitKey] as number;
    const current = entitlements.usage[usageKey];

    if (current >= limit) {
      throw new AppError(
        ErrorCodes.PLAN_LIMIT_EXCEEDED,
        `You have reached the ${metric} limit for your plan`,
        403,
        {
          metric,
          limit,
          current,
          upgrade: { recommendedPlan: 'pro' },
        },
      );
    }

    return true;
  }

  private async getEntitlements(
    request: any,
    orgId: string,
  ): Promise<Entitlements> {
    if (request._entitlements) return request._entitlements;

    const entitlements =
      await this.subscriptionService.getEntitlements(orgId);
    request._entitlements = entitlements;
    return entitlements;
  }
}
