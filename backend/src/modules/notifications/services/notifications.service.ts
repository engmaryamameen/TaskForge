import { Injectable, Logger } from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { RealtimeService } from '../../realtime/services/realtime.service';
import { Notification } from '../entities/notification.entity';

export interface CreateNotificationData {
  userId: string;
  organizationId: string;
  type: string;
  title: string;
  message?: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly realtimeService: RealtimeService,
  ) {}

  async create(data: CreateNotificationData): Promise<Notification> {
    const notification = await this.notificationsRepository.create(data);

    // Send real-time notification to user
    this.realtimeService.broadcastToUser(data.userId, 'notification', {
      eventId: notification.id,
      type: 'notification',
      version: 1,
      entity: 'notification',
      entityId: notification.id,
      data: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        entityType: notification.entityType,
        entityId: notification.entityId,
        actorId: notification.actorId,
        read: false,
        createdAt: notification.createdAt.toISOString(),
      },
      actorId: data.actorId || '',
      timestamp: notification.createdAt.toISOString(),
      organizationId: data.organizationId,
    });

    this.logger.log(`Notification created for user ${data.userId}: ${data.title}`);
    return notification;
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.notificationsRepository.findByUser(
      userId,
      page,
      limit,
    );
    return { data, meta: { page, total } };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.countUnread(userId);
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notificationsRepository.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.markAllAsRead(userId);
  }
}
