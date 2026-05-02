import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../services/notifications.service';
import { DomainEvent } from '../../../shared/interfaces/domain-event.interface';
import { EventType } from '../../../shared/enums';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent(EventType.TASK_CREATED)
  async handleTaskCreated(event: DomainEvent): Promise<void> {
    const assignedTo = event.payload?.snapshot?.assignedTo || event.payload?.changes?.assignedTo;
    if (!assignedTo || assignedTo === event.triggeredBy) return;

    try {
      await this.notificationsService.create({
        userId: assignedTo,
        organizationId: event.organizationId,
        type: 'task_assigned',
        title: 'New task assigned to you',
        message: `You've been assigned "${event.payload?.snapshot?.title || 'a task'}"`,
        entityType: 'task',
        entityId: event.payload?.entityId,
        actorId: event.triggeredBy,
      });
    } catch (err: any) {
      this.logger.error(`Failed to create task notification: ${err?.message}`);
    }
  }

  @OnEvent(EventType.TASK_UPDATED)
  async handleTaskUpdated(event: DomainEvent): Promise<void> {
    const newAssignee = event.payload?.changes?.assignedTo;
    if (!newAssignee || newAssignee === event.triggeredBy) return;

    try {
      await this.notificationsService.create({
        userId: newAssignee,
        organizationId: event.organizationId,
        type: 'task_assigned',
        title: 'Task assigned to you',
        message: `You've been assigned "${event.payload?.snapshot?.title || 'a task'}"`,
        entityType: 'task',
        entityId: event.payload?.entityId,
        actorId: event.triggeredBy,
      });
    } catch (err: any) {
      this.logger.error(`Failed to create reassignment notification: ${err?.message}`);
    }
  }

  @OnEvent(EventType.INVITE_CREATED)
  async handleInviteCreated(event: DomainEvent): Promise<void> {
    // Only notify if the invited user already exists in the system
    // We can't notify by userId since we only have email at invite time
    // This is handled separately - the invite email is the notification
    this.logger.debug(`Invite created event received for org ${event.organizationId}`);
  }

  @OnEvent(EventType.MEMBER_JOINED)
  async handleMemberJoined(event: DomainEvent): Promise<void> {
    const userId = event.payload?.userId;
    if (!userId) return;

    try {
      await this.notificationsService.create({
        userId,
        organizationId: event.organizationId,
        type: 'member_joined',
        title: 'Welcome to the team!',
        message: `You've joined the organization`,
        entityType: 'organization',
        entityId: event.organizationId,
        actorId: event.triggeredBy,
      });
    } catch (err: any) {
      this.logger.error(`Failed to create member joined notification: ${err?.message}`);
    }
  }
}
