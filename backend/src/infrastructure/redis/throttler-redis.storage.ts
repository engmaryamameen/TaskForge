import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.module';

@Injectable()
export class ThrottlerRedisStorage {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    _limit: number,
    blockDuration: number,
    _throttlerName: string,
  ): Promise<{
    totalHits: number;
    timeToExpire: number;
    isBlocked: boolean;
    timeToBlockExpire: number;
  }> {
    const redisKey = `rate:${key}`;
    const totalHits = await this.redis.incr(redisKey);

    if (totalHits === 1) {
      await this.redis.expire(redisKey, Math.ceil(ttl / 1000));
    }

    const ttlRemaining = await this.redis.ttl(redisKey);

    // Check if blocked (exceeded limit and block duration applies)
    const blockKey = `rate:block:${key}`;
    const isBlocked = (await this.redis.exists(blockKey)) === 1;
    let timeToBlockExpire = 0;

    if (isBlocked) {
      timeToBlockExpire = (await this.redis.ttl(blockKey)) * 1000;
    }

    if (!isBlocked && blockDuration > 0 && totalHits > _limit) {
      await this.redis.set(
        blockKey,
        '1',
        'EX',
        Math.ceil(blockDuration / 1000),
      );
      timeToBlockExpire = blockDuration;
    }

    return {
      totalHits,
      timeToExpire: ttlRemaining * 1000,
      isBlocked: isBlocked || (blockDuration > 0 && totalHits > _limit),
      timeToBlockExpire,
    };
  }
}
