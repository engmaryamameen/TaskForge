import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisShutdownService } from './redis-shutdown.service';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('redis.host', 'localhost');
        const port = config.get<number>('redis.port', 6379);
        const password = config.get<string | undefined>('redis.password');
        const useTls = config.get<boolean>('redis.tls', false);
        return new Redis({
          host,
          port,
          password: password || undefined,
          tls: useTls ? {} : undefined,
          maxRetriesPerRequest: null, // Required by BullMQ
          connectTimeout: 10_000,
          retryStrategy: (times: number) => Math.min(times * 200, 5_000),
          enableOfflineQueue: true,
        });
      },
    },
    RedisShutdownService,
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
