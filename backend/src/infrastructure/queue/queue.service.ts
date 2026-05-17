import { Injectable, Inject, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { IQueueService, JobOptions } from './queue.interface';

export const ACTIVITY_QUEUE = 'ACTIVITY_QUEUE';
export const NOTIFICATIONS_QUEUE = 'NOTIFICATIONS_QUEUE';

@Injectable()
export class QueueService implements IQueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @Inject(ACTIVITY_QUEUE) private readonly activityQueue: Queue,
    @Inject(NOTIFICATIONS_QUEUE) private readonly notificationsQueue: Queue,
  ) {}

  async addJob<T>(name: string, data: T, opts?: JobOptions): Promise<void> {
    const queue = this.resolveQueue(name);

    await queue.add(name, data, {
      delay: opts?.delay,
      attempts: opts?.attempts ?? 3,
      priority: opts?.priority,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: { age: 24 * 3600 },  // keep completed jobs for 24h (debugging)
      removeOnFail: false,                     // retain failed jobs for DLQ inspection
    });

    this.logger.debug(`Job enqueued: ${name}`);
  }

  private resolveQueue(name: string): Queue {
    if (name.startsWith('notification')) return this.notificationsQueue;
    return this.activityQueue;
  }
}
