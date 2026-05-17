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
import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto, UpdateProjectDto, ListProjectsDto } from '../dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { OrgScoped } from '../../../common/decorators/org-scoped.decorator';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { RequestContext } from '../../../shared/interfaces';
import { Permission } from '../../../shared/rbac';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @OrgScoped()
  @RequirePermission(Permission.PROJECT_CREATE)
  @Post()
  async create(
    @CurrentUser() user: RequestContext,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(user.organizationId!, user.userId, dto);
  }

  @OrgScoped()
  @RequirePermission(Permission.PROJECT_VIEW)
  @Get()
  async findAll(
    @CurrentUser() user: RequestContext,
    @Query() query: ListProjectsDto,
  ) {
    return this.projectsService.findAll(user.organizationId!, query);
  }

  @OrgScoped()
  @RequirePermission(Permission.PROJECT_VIEW)
  @Get(':id')
  async findOne(
    @CurrentUser() user: RequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.projectsService.findOne(id, user.organizationId!);
  }

  @OrgScoped()
  @RequirePermission(Permission.PROJECT_UPDATE)
  @Patch(':id')
  async update(
    @CurrentUser() user: RequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(
      id,
      user.organizationId!,
      user.userId,
      user.role!,
      dto,
    );
  }

  @OrgScoped()
  @RequirePermission(Permission.PROJECT_DELETE)
  @Delete(':id')
  async remove(
    @CurrentUser() user: RequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.projectsService.remove(id, user.organizationId!, user.userId);
  }
}
