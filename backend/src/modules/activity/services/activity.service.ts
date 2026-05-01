import { Injectable, Logger } from '@nestjs/common';
import { ActivityRepository } from '../repositories/activity.repository';
import { ActivityFilterDto } from '../dto';
import { DomainEvent } from '../../../shared/interfaces';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(private readonly activityRepository: ActivityRepository) {}

  async log(event: DomainEvent): Promise<void> {
    const entityType = event.type.split('.')[0];
    const entityId = event.payload?.entityId;

    if (!entityId || !event.organizationId) {
      this.logger.warn(
        `Skipping activity log: missing entityId or organizationId for ${event.type}`,
      );
      return;
    }

    await this.activityRepository.create({
      organizationId: event.organizationId,
      eventType: event.type,
      entityType,
      entityId,
      payload: event.payload,
      triggeredBy: event.triggeredBy,
    });
  }

  async findAll(organizationId: string, filters: ActivityFilterDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const [data, total] = await this.activityRepository.findByOrg(
      organizationId,
      filters,
      page,
      limit,
    );

    return { data, meta: { page, total } };
  }
}
