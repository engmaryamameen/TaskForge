import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEvent } from '../../../shared/interfaces/domain-event.interface';
import { ActivityService } from '../services/activity.service';

/**
 * Persists domain events to the activity feed synchronously so logs survive without the Bull worker.
 */
@Injectable()
export class ActivityListener {
  constructor(private readonly activityService: ActivityService) {}

  @OnEvent('task.*')
  async handleTaskEvent(event: DomainEvent) {
    await this.activityService.log(event);
  }

  @OnEvent('project.*')
  async handleProjectEvent(event: DomainEvent) {
    await this.activityService.log(event);
  }

  @OnEvent('member.*')
  async handleMemberEvent(event: DomainEvent) {
    await this.activityService.log(event);
  }

  @OnEvent('organization.*')
  async handleOrgEvent(event: DomainEvent) {
    await this.activityService.log(event);
  }

  @OnEvent('invite.*')
  async handleInviteEvent(event: DomainEvent) {
    await this.activityService.log(event);
  }

  @OnEvent('user.*')
  async handleUserEvent(event: DomainEvent) {
    await this.activityService.log(event);
  }
}
