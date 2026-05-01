import { Controller, Get, Post, Body } from '@nestjs/common';
import { BillingService } from '../services/billing.service';
import { SubscriptionService } from '../services/subscription.service';
import { UsageService } from '../services/usage.service';
import { PlanRepository } from '../repositories/plan.repository';
import { CreateCheckoutSessionDto } from '../dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { OrgScoped } from '../../../common/decorators/org-scoped.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequestContext } from '../../../shared/interfaces';
import { Role } from '../../../shared/enums';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly subscriptionService: SubscriptionService,
    private readonly usageService: UsageService,
    private readonly planRepository: PlanRepository,
  ) {}

  @OrgScoped()
  @Get('plans')
  async listPlans() {
    return this.planRepository.findAll();
  }

  @OrgScoped()
  @Get('subscription')
  async getSubscription(@CurrentUser() user: RequestContext) {
    return this.subscriptionService.getSubscription(user.organizationId!);
  }

  @OrgScoped()
  @Get('entitlements')
  async getEntitlements(@CurrentUser() user: RequestContext) {
    return this.subscriptionService.getEntitlements(user.organizationId!);
  }

  @OrgScoped()
  @Get('usage')
  async getUsage(@CurrentUser() user: RequestContext) {
    return this.usageService.getOrCreateUsage(user.organizationId!);
  }

  @OrgScoped()
  @Roles(Role.ADMIN)
  @Post('checkout-session')
  async createCheckoutSession(
    @CurrentUser() user: RequestContext,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return this.billingService.createCheckoutSession(
      user.organizationId!,
      dto.planId,
    );
  }

  @OrgScoped()
  @Roles(Role.ADMIN)
  @Post('portal-session')
  async createPortalSession(@CurrentUser() user: RequestContext) {
    const frontendUrl = 'http://localhost:3000';
    return this.billingService.createPortalSession(
      user.organizationId!,
      `${frontendUrl}/billing`,
    );
  }
}
