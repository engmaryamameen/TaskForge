import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ICacheService, CACHE_SERVICE } from './cache.interface';
import { DomainEvent } from '../../shared/interfaces';

@Injectable()
export class CacheInvalidationListener {
  private readonly logger = new Logger(CacheInvalidationListener.name);

  constructor(
    @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
  ) {}

  /**
   * Rule: any event that changes authorization state invalidates membership cache.
   * member.joined, member.invited, and future member.removed/role.updated all qualify.
   */
  @OnEvent('member.*')
  async onMemberEvent(event: DomainEvent) {
    const userId = event.payload?.userId;
    const orgId = event.organizationId;

    if (userId && orgId) {
      await this.cacheService.del(`cache:membership:${userId}:${orgId}`);
      this.logger.debug(
        `Invalidated membership cache: ${userId}:${orgId} (${event.type})`,
      );
    }
  }
}
