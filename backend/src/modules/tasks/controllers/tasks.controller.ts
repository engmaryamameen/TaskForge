import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TasksService } from '../services/tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from '../dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { OrgScoped } from '../../../common/decorators/org-scoped.decorator';
import { RequestContext } from '../../../shared/interfaces';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @OrgScoped()
  @Post('projects/:projectId/tasks')
  async create(
    @CurrentUser() user: RequestContext,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(
      projectId,
      user.organizationId!,
      user.userId,
      dto,
    );
  }

  @OrgScoped()
  @Get('projects/:projectId/tasks')
  async findByProject(
    @CurrentUser() user: RequestContext,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() filters: TaskFilterDto,
  ) {
    return this.tasksService.findByProject(
      projectId,
      user.organizationId!,
      filters,
    );
  }

  @OrgScoped()
  @Get('tasks')
  async findAll(
    @CurrentUser() user: RequestContext,
    @Query() filters: TaskFilterDto,
  ) {
    return this.tasksService.findAll(user.organizationId!, filters);
  }

  @OrgScoped()
  @Get('tasks/:id')
  async findOne(
    @CurrentUser() user: RequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tasksService.findOne(id, user.organizationId!);
  }

  @OrgScoped()
  @Patch('tasks/:id')
  async update(
    @CurrentUser() user: RequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(
      id,
      user.organizationId!,
      user.userId,
      dto,
    );
  }

  @OrgScoped()
  @Delete('tasks/:id')
  async remove(
    @CurrentUser() user: RequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tasksService.remove(
      id,
      user.organizationId!,
      user.userId,
      user.role!,
    );
  }
}
