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
import { CreateProjectDto, UpdateProjectDto } from '../dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { OrgScoped } from '../../../common/decorators/org-scoped.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequestContext } from '../../../shared/interfaces';
import { Role } from '../../../shared/enums';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @OrgScoped()
  @Post()
  async create(
    @CurrentUser() user: RequestContext,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(user.organizationId!, user.userId, dto);
  }

  @OrgScoped()
  @Get()
  async findAll(
    @CurrentUser() user: RequestContext,
    @Query() pagination: PaginationDto,
  ) {
    return this.projectsService.findAll(user.organizationId!, pagination);
  }

  @OrgScoped()
  @Get(':id')
  async findOne(
    @CurrentUser() user: RequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.projectsService.findOne(id, user.organizationId!);
  }

  @OrgScoped()
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
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(
    @CurrentUser() user: RequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.projectsService.remove(id, user.organizationId!, user.userId);
  }
}
