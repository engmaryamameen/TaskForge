import { Module, Global } from '@nestjs/common';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis';
import { QueueService, ACTIVITY_QUEUE, NOTIFICATIONS_QUEUE } from './queue.service';
import { QUEUE_SERVICE } from './queue.interface';

@Global()
@Module({
  providers: [
    {
      provide: ACTIVITY_QUEUE,
      inject: [REDIS_CLIENT],
      useFactory: (redis: Redis) =>
        new Queue('activity', { connection: redis, prefix: 'bull' }),
    },
    {
      provide: NOTIFICATIONS_QUEUE,
      inject: [REDIS_CLIENT],
      useFactory: (redis: Redis) =>
        new Queue('notifications', { connection: redis, prefix: 'bull' }),
    },
    {
      provide: QUEUE_SERVICE,
      useClass: QueueService,
    },
  ],
  exports: [QUEUE_SERVICE, ACTIVITY_QUEUE, NOTIFICATIONS_QUEUE],
})
export class QueueProducerModule {}
