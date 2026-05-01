import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealtimeModule } from '../realtime/realtime.module';
import { BillingController } from './controllers/billing.controller';
import { WebhookController } from './controllers/webhook.controller';
import { BillingService } from './services/billing.service';
import { StripeService } from './services/stripe.service';
import { SubscriptionService } from './services/subscription.service';
import { UsageService } from './services/usage.service';
import { PlanRepository } from './repositories/plan.repository';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { UsageRepository } from './repositories/usage.repository';
import { WebhookRepository } from './repositories/webhook.repository';
import { BillingInitListener } from './listeners/billing-init.listener';
import { UsageListener } from './listeners/usage.listener';
import { SubscriptionListener } from './listeners/subscription.listener';
import { PlanGuard } from './guards/plan.guard';
import { LimitGuard } from './guards/limit.guard';
import { Plan } from './entities/plan.entity';
import { Subscription } from './entities/subscription.entity';
import { OrganizationUsage } from './entities/organization-usage.entity';
import { ProcessedWebhook } from './entities/processed-webhook.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Plan,
      Subscription,
      OrganizationUsage,
      ProcessedWebhook,
    ]),
    RealtimeModule,
  ],
  controllers: [BillingController, WebhookController],
  providers: [
    BillingService,
    StripeService,
    SubscriptionService,
    UsageService,
    PlanRepository,
    SubscriptionRepository,
    UsageRepository,
    WebhookRepository,
    BillingInitListener,
    UsageListener,
    SubscriptionListener,
    PlanGuard,
    LimitGuard,
  ],
  exports: [SubscriptionService, UsageService],
})
export class BillingModule {}
