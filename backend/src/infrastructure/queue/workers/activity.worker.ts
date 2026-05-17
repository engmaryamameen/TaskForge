import {
  Injectable,
  Inject,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis';
import { withTenantContext } from '../../tenant';
import { ActivityService } from '../../../modules/activity/services/activity.service';
import { DomainEvent } from '../../../shared/interfaces';

@Injectable()
export class ActivityWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ActivityWorker.name);
  private worker: Worker;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly activityService: ActivityService,
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      'activity',
      async (job: Job<DomainEvent>) => {
        const start = Date.now();
        // Execute within tenant context so RLS policies are satisfied
        await withTenantContext(
          this.dataSource,
          job.data.organizationId,
          () => this.activityService.log(job.data),
        );
        const duration = Date.now() - start;
        this.logger.debug(
          `Job ${job.id} processed: ${job.data.type} (${duration}ms)`,
        );
      },
      {
        connection: this.redis,
        concurrency: 5,
      },
    );

    this.worker.on('failed', (job, error) => {
      const isFinal = job && job.attemptsMade >= (job.opts?.attempts ?? 3);
      if (isFinal) {
        this.logger.error(
          `Job ${job?.id} permanently failed after ${job?.attemptsMade} attempts: ${error.message}. ` +
          `Event: ${job?.data?.type}, org: ${job?.data?.organizationId}. Moved to DLQ.`,
        );
      } else {
        this.logger.warn(
          `Job ${job?.id} failed (attempt ${job?.attemptsMade}): ${error.message}`,
        );
      }
    });

    this.logger.log('Activity worker started (concurrency: 5)');
  }

  async onModuleDestroy() {
    if (this.worker) {
      this.logger.log('Shutting down activity worker...');
      await this.worker.close();
      this.logger.log('Activity worker stopped');
    }
  }
}
