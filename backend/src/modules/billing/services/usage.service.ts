import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UsageRepository } from '../repositories/usage.repository';
import { OrganizationUsage } from '../entities/organization-usage.entity';

@Injectable()
export class UsageService {
  private readonly logger = new Logger(UsageService.name);

  constructor(
    private readonly usageRepository: UsageRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getOrCreateUsage(
    organizationId: string,
  ): Promise<OrganizationUsage> {
    return this.usageRepository.createForOrg(organizationId);
  }

  async incrementProjects(organizationId: string): Promise<void> {
    await this.usageRepository.increment(organizationId, 'projectsCount');
  }

  async decrementProjects(organizationId: string): Promise<void> {
    await this.usageRepository.decrement(organizationId, 'projectsCount');
  }

  async incrementMembers(organizationId: string): Promise<void> {
    await this.usageRepository.increment(organizationId, 'membersCount');
  }

  async decrementMembers(organizationId: string): Promise<void> {
    await this.usageRepository.decrement(organizationId, 'membersCount');
  }

  async incrementTasks(organizationId: string): Promise<void> {
    await this.usageRepository.increment(organizationId, 'tasksCount');
  }

  async decrementTasks(organizationId: string): Promise<void> {
    await this.usageRepository.decrement(organizationId, 'tasksCount');
  }

  /**
   * Atomic limit check + increment. Returns true if allowed.
   * Uses conditional UPDATE: SET count = count + 1 WHERE count < limit
   */
  async checkAndIncrementProjects(
    organizationId: string,
    limit: number,
  ): Promise<boolean> {
    return this.usageRepository.checkAndIncrement(
      organizationId,
      'projectsCount',
      limit,
    );
  }

  async checkAndIncrementMembers(
    organizationId: string,
    limit: number,
  ): Promise<boolean> {
    return this.usageRepository.checkAndIncrement(
      organizationId,
      'membersCount',
      limit,
    );
  }

  /**
   * Hard reconciliation: COUNT(*) from source tables → overwrite counters.
   * Usage table is derived, not authoritative.
   */
  async reconcile(organizationId: string): Promise<void> {
    const [projectsResult, membersResult, tasksResult] = await Promise.all([
      this.dataSource.query(
        `SELECT count(*) as count FROM projects WHERE organization_id = $1 AND deleted_at IS NULL`,
        [organizationId],
      ),
      this.dataSource.query(
        `SELECT count(*) as count FROM memberships WHERE organization_id = $1`,
        [organizationId],
      ),
      this.dataSource.query(
        `SELECT count(*) as count FROM tasks WHERE organization_id = $1 AND deleted_at IS NULL`,
        [organizationId],
      ),
    ]);

    await this.usageRepository.updateCounts(organizationId, {
      projectsCount: parseInt(projectsResult[0]?.count ?? '0', 10),
      membersCount: parseInt(membersResult[0]?.count ?? '0', 10),
      tasksCount: parseInt(tasksResult[0]?.count ?? '0', 10),
    });

    this.logger.debug(`Usage reconciled for org ${organizationId}`);
  }
}
