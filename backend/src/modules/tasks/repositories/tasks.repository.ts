import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';

interface TaskFilterParams {
  status?: string;
  priority?: string;
  assignedTo?: string;
  dueBefore?: string;
  dueAfter?: string;
}

@Injectable()
export class TasksRepository {
  constructor(
    @InjectRepository(Task)
    private readonly repo: Repository<Task>,
  ) {}

  async create(data: Partial<Task>): Promise<Task> {
    const task = this.repo.create(data);
    return this.repo.save(task);
  }

  async findByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<Task | null> {
    return this.repo.findOne({ where: { id, organizationId } });
  }

  async findByProjectAndOrg(
    projectId: string,
    organizationId: string,
    filters: TaskFilterParams,
    page: number,
    limit: number,
  ): Promise<[Task[], number]> {
    const qb = this.repo
      .createQueryBuilder('task')
      .where('task.organizationId = :organizationId', { organizationId })
      .andWhere('task.projectId = :projectId', { projectId });

    this.applyFilters(qb, filters);

    return qb
      .orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  async findByOrg(
    organizationId: string,
    filters: TaskFilterParams,
    page: number,
    limit: number,
  ): Promise<[Task[], number]> {
    const qb = this.repo
      .createQueryBuilder('task')
      .where('task.organizationId = :organizationId', { organizationId });

    this.applyFilters(qb, filters);

    return qb
      .orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  async update(id: string, data: Partial<Task>): Promise<void> {
    await this.repo.update(id, data);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  private applyFilters(
    qb: ReturnType<Repository<Task>['createQueryBuilder']>,
    filters: TaskFilterParams,
  ): void {
    if (filters.status) {
      qb.andWhere('task.status = :status', { status: filters.status });
    }
    if (filters.priority) {
      qb.andWhere('task.priority = :priority', { priority: filters.priority });
    }
    if (filters.assignedTo) {
      qb.andWhere('task.assignedTo = :assignedTo', {
        assignedTo: filters.assignedTo,
      });
    }
    if (filters.dueBefore) {
      qb.andWhere('task.dueDate <= :dueBefore', {
        dueBefore: filters.dueBefore,
      });
    }
    if (filters.dueAfter) {
      qb.andWhere('task.dueDate >= :dueAfter', {
        dueAfter: filters.dueAfter,
      });
    }
  }
}
