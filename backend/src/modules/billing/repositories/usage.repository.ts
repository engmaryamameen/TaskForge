import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationUsage } from '../entities/organization-usage.entity';

type UsageField = 'projectsCount' | 'membersCount' | 'tasksCount';

const fieldToColumn: Record<UsageField, string> = {
  projectsCount: 'projects_count',
  membersCount: 'members_count',
  tasksCount: 'tasks_count',
};

@Injectable()
export class UsageRepository {
  constructor(
    @InjectRepository(OrganizationUsage)
    private readonly repo: Repository<OrganizationUsage>,
  ) {}

  async findByOrgId(
    organizationId: string,
  ): Promise<OrganizationUsage | null> {
    return this.repo.findOne({ where: { organizationId } });
  }

  async createForOrg(organizationId: string): Promise<OrganizationUsage> {
    // UPSERT: prevents race condition on concurrent init
    await this.repo
      .createQueryBuilder()
      .insert()
      .values({ organizationId })
      .orIgnore()
      .execute();

    return this.repo.findOneOrFail({ where: { organizationId } });
  }

  async increment(organizationId: string, field: UsageField): Promise<void> {
    const col = fieldToColumn[field];
    await this.repo
      .createQueryBuilder()
      .update()
      .set({ [field]: () => `"${col}" + 1` })
      .where('organization_id = :organizationId', { organizationId })
      .execute();
  }

  async decrement(organizationId: string, field: UsageField): Promise<void> {
    const col = fieldToColumn[field];
    await this.repo
      .createQueryBuilder()
      .update()
      .set({ [field]: () => `GREATEST("${col}" - 1, 0)` })
      .where('organization_id = :organizationId', { organizationId })
      .execute();
  }

  /**
   * Atomic limit check + increment. Returns true if allowed, false if limit exceeded.
   * Uses conditional UPDATE to prevent race conditions.
   */
  async checkAndIncrement(
    organizationId: string,
    field: UsageField,
    limit: number,
  ): Promise<boolean> {
    const col = fieldToColumn[field];
    const result = await this.repo
      .createQueryBuilder()
      .update()
      .set({ [field]: () => `"${col}" + 1` })
      .where('organization_id = :organizationId', { organizationId })
      .andWhere(`"${col}" < :limit`, { limit })
      .execute();

    return (result.affected ?? 0) > 0;
  }

  async updateCounts(
    organizationId: string,
    counts: {
      projectsCount: number;
      membersCount: number;
      tasksCount: number;
    },
  ): Promise<void> {
    await this.repo.update(
      { organizationId },
      {
        projectsCount: counts.projectsCount,
        membersCount: counts.membersCount,
        tasksCount: counts.tasksCount,
      },
    );
  }
}
