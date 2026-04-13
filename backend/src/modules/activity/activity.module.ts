import { Module } from '@nestjs/common';
import { ActivityService } from './services/activity.service';
import { ActivityRepository } from './repositories/activity.repository';
import { ActivityListener } from './listeners/activity.listener';

@Module({
  providers: [ActivityService, ActivityRepository, ActivityListener],
  exports: [ActivityService],
})
export class ActivityModule {}
