import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { TenantAwareRepository } from '../../../infrastructure/tenant';

@Injectable()
export class NotificationsRepository extends TenantAwareRepository<Notification> {
  constructor(
    @InjectRepository(Notification)
    defaultRepo: Repository<Notification>,
  ) {
    super(defaultRepo, Notification);
  }

  async create(data: Partial<Notification>): Promise<Notification> {
    const notification = this.repo.create(data);
    return this.repo.save(notification);
  }

  async findByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<[Notification[], number]> {
    return this.repo.findAndCount({
      where: { userId },
      relations: ['actor'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.repo.count({
      where: { userId, read: false },
    });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.repo.update({ id, userId }, { read: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update({ userId, read: false }, { read: true });
  }
}
