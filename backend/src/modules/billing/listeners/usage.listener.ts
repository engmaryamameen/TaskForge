import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEvent } from '../../../shared/interfaces';
import { UsageService } from '../services/usage.service';
import { SubscriptionService } from '../services/subscription.service';

@Injectable()
export class UsageListener {
  private readonly logger = new Logger(UsageListener.name);

  constructor(
    private readonly usageService: UsageService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @OnEvent('project.created')
  async onProjectCreated(event: DomainEvent) {
    await this.safeUpdate(event.organizationId, async () => {
      await this.usageService.incrementProjects(event.organizationId);
    });
  }

  @OnEvent('project.deleted')
  async onProjectDeleted(event: DomainEvent) {
    await this.safeUpdate(event.organizationId, async () => {
      await this.usageService.decrementProjects(event.organizationId);
    });
  }

  @OnEvent('member.joined')
  async onMemberJoined(event: DomainEvent) {
    await this.safeUpdate(event.organizationId, async () => {
      await this.usageService.incrementMembers(event.organizationId);
    });
  }

  @OnEvent('task.created')
  async onTaskCreated(event: DomainEvent) {
    await this.safeUpdate(event.organizationId, async () => {
      await this.usageService.incrementTasks(event.organizationId);
    });
  }

  @OnEvent('task.deleted')
  async onTaskDeleted(event: DomainEvent) {
    await this.safeUpdate(event.organizationId, async () => {
      await this.usageService.decrementTasks(event.organizationId);
    });
  }

  private async safeUpdate(
    orgId: string,
    fn: () => Promise<void>,
  ): Promise<void> {
    if (!orgId) return;
    try {
      await fn();
      await this.subscriptionService.invalidateEntitlements(orgId);
    } catch (error: any) {
      // Usage update failure should not break the originating request.
      // Reconciliation job will fix drift.
      this.logger.error(
        `Usage update failed for org ${orgId}: ${error?.message}`,
      );
    }
  }
}
