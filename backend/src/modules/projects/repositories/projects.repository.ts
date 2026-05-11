import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { TenantAwareRepository } from '../../../infrastructure/tenant';

@Injectable()
export class ProjectsRepository extends TenantAwareRepository<Project> {
  constructor(
    @InjectRepository(Project)
    defaultRepo: Repository<Project>,
  ) {
    super(defaultRepo, Project);
  }

  async create(data: Partial<Project>): Promise<Project> {
    const project = this.repo.create(data);
    return this.repo.save(project);
  }

  async findByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<Project | null> {
    return this.repo.findOne({ where: { id, organizationId } });
  }

  // TODO: add pg_trgm index on lower(name), lower(description) for large datasets
  async findByOrg(
    organizationId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<[Project[], number]> {
    const where: Record<string, unknown>[] = search
      ? [
          { organizationId, name: ILike(`%${search}%`) },
          { organizationId, description: ILike(`%${search}%`) },
        ]
      : [{ organizationId }];

    return this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async update(id: string, data: Partial<Project>): Promise<void> {
    await this.repo.update(id, data);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
