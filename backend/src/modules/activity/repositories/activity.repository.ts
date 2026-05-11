import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../entities/activity.entity';
import { TenantAwareRepository } from '../../../infrastructure/tenant';

@Injectable()
export class ActivityRepository extends TenantAwareRepository<Activity> {
  constructor(
    @InjectRepository(Activity)
    defaultRepo: Repository<Activity>,
  ) {
    super(defaultRepo, Activity);
  }

  async create(data: Partial<Activity>): Promise<Activity> {
    const activity = this.repo.create(data);
    return this.repo.save(activity);
  }

  async findByOrg(
    organizationId: string,
    filters: {
      entityType?: string;
      entityId?: string;
      triggeredBy?: string;
    },
    page: number,
    limit: number,
  ): Promise<[Activity[], number]> {
    const qb = this.repo
      .createQueryBuilder('activity')
      .where('activity.organizationId = :organizationId', { organizationId });

    if (filters.entityType) {
      qb.andWhere('activity.entityType = :entityType', {
        entityType: filters.entityType,
      });
    }

    if (filters.entityId) {
      qb.andWhere('activity.entityId = :entityId', {
        entityId: filters.entityId,
      });
    }

    if (filters.triggeredBy) {
      qb.andWhere('activity.triggeredBy = :triggeredBy', {
        triggeredBy: filters.triggeredBy,
      });
    }

    return qb
      .orderBy('activity.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }
}
