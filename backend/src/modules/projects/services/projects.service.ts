import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProjectsRepository } from '../repositories/projects.repository';
import { CreateProjectDto, UpdateProjectDto, ListProjectsDto } from '../dto';
import { Project } from '../entities/project.entity';
import { AppError } from '../../../shared/errors/app-error';
import { ErrorCodes } from '../../../shared/errors/error-codes';
import { EventType, Role } from '../../../shared/enums';
import { DomainEvent } from '../../../shared/interfaces';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    organizationId: string,
    userId: string,
    dto: CreateProjectDto,
  ): Promise<Project> {
    const project = await this.projectsRepository.create({
      ...dto,
      organizationId,
      createdBy: userId,
    });

    this.logger.log(`Project created: ${project.id} in org ${organizationId}`);

    this.eventEmitter.emit(EventType.PROJECT_CREATED, {
      type: EventType.PROJECT_CREATED,
      payload: {
        entityId: project.id,
        snapshot: { name: project.name, description: project.description },
      },
      occurredAt: new Date(),
      organizationId,
      triggeredBy: userId,
    } satisfies DomainEvent);

    return project;
  }

  async findAll(organizationId: string, query: ListProjectsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim() || undefined;

    const [data, total] = await this.projectsRepository.findByOrg(
      organizationId,
      page,
      limit,
      search,
    );

    return { data, meta: { page, total } };
  }

  async findOne(id: string, organizationId: string): Promise<Project> {
    const project = await this.projectsRepository.findByIdAndOrg(
      id,
      organizationId,
    );

    if (!project) {
      throw new AppError(
        ErrorCodes.PROJECT_NOT_FOUND,
        'Project not found',
        404,
      );
    }

    return project;
  }

  async update(
    id: string,
    organizationId: string,
    userId: string,
    role: string,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.findOne(id, organizationId);

    if (role !== Role.ADMIN && project.createdBy !== userId) {
      throw new AppError(
        ErrorCodes.INSUFFICIENT_ROLE,
        'Only admins or the project creator can update this project',
        403,
      );
    }

    await this.projectsRepository.update(id, dto);

    this.logger.log(`Project updated: ${id}`);

    this.eventEmitter.emit(EventType.PROJECT_UPDATED, {
      type: EventType.PROJECT_UPDATED,
      payload: { entityId: id, changes: dto, snapshot: { name: project.name } },
      occurredAt: new Date(),
      organizationId,
      triggeredBy: userId,
    } satisfies DomainEvent);

    return { ...project, ...dto };
  }

  async remove(
    id: string,
    organizationId: string,
    userId: string,
  ): Promise<void> {
    const project = await this.findOne(id, organizationId);
    await this.projectsRepository.softDelete(id);

    this.logger.log(`Project deleted: ${id}`);

    this.eventEmitter.emit(EventType.PROJECT_DELETED, {
      type: EventType.PROJECT_DELETED,
      payload: {
        entityId: id,
        snapshot: { name: project.name },
      },
      occurredAt: new Date(),
      organizationId,
      triggeredBy: userId,
    } satisfies DomainEvent);
  }
}
