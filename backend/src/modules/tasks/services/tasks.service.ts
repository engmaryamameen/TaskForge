import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TasksRepository } from '../repositories/tasks.repository';
import { ProjectsService } from '../../projects/services/projects.service';
import { MembershipsService } from '../../organizations/services/memberships.service';
import { OrganizationsService } from '../../organizations/services/organizations.service';
import { UsersService } from '../../users/services/users.service';
import { MailService } from '../../mail/mail.service';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from '../dto';
import { Task } from '../entities/task.entity';
import { AppError } from '../../../shared/errors/app-error';
import { ErrorCodes } from '../../../shared/errors/error-codes';
import { EventType, Role } from '../../../shared/enums';
import { DomainEvent } from '../../../shared/interfaces';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly projectsService: ProjectsService,
    private readonly membershipsService: MembershipsService,
    private readonly organizationsService: OrganizationsService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    projectId: string,
    organizationId: string,
    userId: string,
    dto: CreateTaskDto,
  ): Promise<Task> {
    // Validates project exists AND belongs to this org
    await this.projectsService.findOne(projectId, organizationId);

    // Validate assignee is an org member
    if (dto.assignedTo) {
      await this.validateAssignee(dto.assignedTo, organizationId);
    }

    const task = await this.tasksRepository.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      projectId,
      organizationId,
      createdBy: userId,
    });

    this.logger.log(`Task created: ${task.id} in project ${projectId}`);

    this.eventEmitter.emit(EventType.TASK_CREATED, {
      type: EventType.TASK_CREATED,
      payload: {
        entityId: task.id,
        snapshot: {
          title: task.title,
          status: task.status,
          priority: task.priority,
          projectId,
          assignedTo: task.assignedTo || undefined,
        },
      },
      occurredAt: new Date(),
      organizationId,
      triggeredBy: userId,
    } satisfies DomainEvent);

    // Send task-assigned email (fire-and-forget)
    if (dto.assignedTo) {
      this.sendTaskAssignedNotification(
        dto.assignedTo,
        task,
        projectId,
        organizationId,
        userId,
      ).catch((err: Error) => this.logger.error(`Failed to send task-assigned email: ${err.message}`));
    }

    return task;
  }

  async findByProject(
    projectId: string,
    organizationId: string,
    filters: TaskFilterDto,
  ) {
    await this.projectsService.findOne(projectId, organizationId);

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const [data, total] = await this.tasksRepository.findByProjectAndOrg(
      projectId,
      organizationId,
      filters,
      page,
      limit,
    );

    return { data, meta: { page, total } };
  }

  async findAll(organizationId: string, filters: TaskFilterDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const [data, total] = await this.tasksRepository.findByOrg(
      organizationId,
      filters,
      page,
      limit,
    );

    return { data, meta: { page, total } };
  }

  async findOne(id: string, organizationId: string): Promise<Task> {
    const task = await this.tasksRepository.findByIdAndOrg(id, organizationId);

    if (!task) {
      throw new AppError(ErrorCodes.TASK_NOT_FOUND, 'Task not found', 404);
    }

    return task;
  }

  async update(
    id: string,
    organizationId: string,
    userId: string,
    dto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.findOne(id, organizationId);

    if (dto.assignedTo) {
      await this.validateAssignee(dto.assignedTo, organizationId);
    }

    const updateData: Record<string, any> = { ...dto };
    if (dto.dueDate !== undefined) {
      updateData.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }
    await this.tasksRepository.update(id, updateData);

    this.logger.log(`Task updated: ${id}`);

    this.eventEmitter.emit(EventType.TASK_UPDATED, {
      type: EventType.TASK_UPDATED,
      payload: {
        entityId: id,
        changes: dto,
        snapshot: { title: task.title, status: task.status, projectId: task.projectId },
      },
      occurredAt: new Date(),
      organizationId,
      triggeredBy: userId,
    } satisfies DomainEvent);

    const updatedTask = { ...task, ...updateData } as Task;

    // Send task-assigned email if assignee changed (fire-and-forget)
    if (dto.assignedTo && dto.assignedTo !== task.assignedTo) {
      this.sendTaskAssignedNotification(
        dto.assignedTo,
        updatedTask,
        task.projectId,
        organizationId,
        userId,
      ).catch((err: Error) => this.logger.error(`Failed to send task-assigned email: ${err.message}`));
    }

    return updatedTask;
  }

  async remove(
    id: string,
    organizationId: string,
    userId: string,
    role: string,
  ): Promise<void> {
    const task = await this.findOne(id, organizationId);

    if (role !== Role.ADMIN && task.createdBy !== userId) {
      throw new AppError(
        ErrorCodes.INSUFFICIENT_ROLE,
        'Only admins or the task creator can delete this task',
        403,
      );
    }

    await this.tasksRepository.softDelete(id);

    this.logger.log(`Task deleted: ${id}`);

    this.eventEmitter.emit(EventType.TASK_DELETED, {
      type: EventType.TASK_DELETED,
      payload: {
        entityId: id,
        snapshot: { title: task.title, projectId: task.projectId },
      },
      occurredAt: new Date(),
      organizationId,
      triggeredBy: userId,
    } satisfies DomainEvent);
  }

  private async validateAssignee(
    userId: string,
    organizationId: string,
  ): Promise<void> {
    const membership = await this.membershipsService.getMembership(
      userId,
      organizationId,
    );

    if (!membership) {
      throw new AppError(
        ErrorCodes.INVALID_ASSIGNEE,
        'Assignee is not a member of this organization',
        400,
      );
    }
  }

  private async sendTaskAssignedNotification(
    assigneeId: string,
    task: Task,
    projectId: string,
    organizationId: string,
    assignerId: string,
  ): Promise<void> {
    const [assignee, assigner, org, project] = await Promise.all([
      this.usersService.findById(assigneeId),
      this.usersService.findById(assignerId),
      this.organizationsService.findById(organizationId),
      this.projectsService.findOne(projectId, organizationId).catch(() => null),
    ]);

    if (!assignee?.email) {
      return;
    }

    await this.mailService.sendTaskAssignedEmail({
      recipientEmail: assignee.email,
      recipientName: assignee.firstName,
      taskTitle: task.title,
      taskDescription: task.description || undefined,
      projectName: project?.name,
      dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : undefined,
      priority: task.priority,
      assignerName: assigner ? `${assigner.firstName} ${assigner.lastName}` : undefined,
      organizationName: org?.name || 'your organization',
      taskId: task.id,
    });
  }
}
