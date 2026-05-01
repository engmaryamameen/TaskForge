import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionService } from '../services/subscription.service';
import { REQUIRE_PLAN_KEY } from '../decorators/require-plan.decorator';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { AppError } from '../../../shared/errors/app-error';
import { ErrorCodes } from '../../../shared/errors/error-codes';
import { Entitlements } from '../interfaces/entitlements.interface';

@Injectable()
export class PlanGuard implements CanActivate {
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

    const requiredFeatures = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PLAN_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredFeatures?.length) return true;

    const request = context.switchToHttp().getRequest();
    const orgId = request.user?.organizationId;
    if (!orgId) return true;

    const entitlements = await this.getEntitlements(request, orgId);

    if (!entitlements.isActive) {
      throw new AppError(
        ErrorCodes.SUBSCRIPTION_INACTIVE,
        'Your subscription is not active',
        403,
        {
          upgrade: { recommendedPlan: 'pro' },
        },
      );
    }

    for (const feature of requiredFeatures) {
      if (!entitlements.features[feature]) {
        throw new AppError(
          ErrorCodes.FEATURE_NOT_AVAILABLE,
          `Feature "${feature}" is not available on your current plan`,
          403,
          {
            feature,
            currentPlan: entitlements.planId,
            upgrade: { recommendedPlan: 'pro' },
          },
        );
      }
    }

    return true;
  }

  private async getEntitlements(
    request: any,
    orgId: string,
  ): Promise<Entitlements> {
    // Request-scoped memoization: avoid duplicate computation within same request
    if (request._entitlements) return request._entitlements;

    const entitlements =
      await this.subscriptionService.getEntitlements(orgId);
    request._entitlements = entitlements;
    return entitlements;
  }
}
