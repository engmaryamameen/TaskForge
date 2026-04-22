import { Injectable, Inject, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisShutdownService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisShutdownService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async onModuleDestroy() {
    this.logger.log('Closing Redis connection...');
    await this.redis.quit();
    this.logger.log('Redis connection closed');
  }
}
