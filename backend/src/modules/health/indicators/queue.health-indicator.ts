import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { Queue } from 'bullmq';
import { ACTIVITY_QUEUE, NOTIFICATIONS_QUEUE } from '../../../infrastructure/queue/queue.service';

/**
 * Health indicator that reports BullMQ queue depth and failed job counts.
 * Surfaces backed-up or stuck queues before they become incidents.
 */
@Injectable()
export class QueueHealthIndicator extends HealthIndicator {
  constructor(
    @Inject(ACTIVITY_QUEUE) private readonly activityQueue: Queue,
    @Inject(NOTIFICATIONS_QUEUE) private readonly notificationsQueue: Queue,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const [activityCounts, notificationCounts] = await Promise.all([
      this.activityQueue.getJobCounts('waiting', 'active', 'failed'),
      this.notificationsQueue.getJobCounts('waiting', 'active', 'failed'),
    ]);

    const details = {
      activity: activityCounts,
      notifications: notificationCounts,
    };

    const totalFailed = activityCounts.failed + notificationCounts.failed;
    const totalWaiting = activityCounts.waiting + notificationCounts.waiting;

    // Warn if many failed jobs or large backlog
    const isHealthy = totalFailed < 100 && totalWaiting < 1000;

    const result = this.getStatus(key, isHealthy, details);

    if (!isHealthy) {
      throw new HealthCheckError(
        `Queue backlog: ${totalWaiting} waiting, ${totalFailed} failed`,
        result,
      );
    }

    return result;
  }
}
