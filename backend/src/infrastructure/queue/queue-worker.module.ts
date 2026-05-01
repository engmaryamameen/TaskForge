import { Module } from '@nestjs/common';
import { QueueProducerModule } from './queue-producer.module';
import { ActivityWorker } from './workers/activity.worker';
import { ActivityModule } from '../../modules/activity/activity.module';

@Module({
  imports: [ActivityModule, QueueProducerModule],
  providers: [ActivityWorker],
})
export class QueueWorkerModule {}
