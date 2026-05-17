import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectsService } from './services/projects.service';
import { ProjectAccessService } from './services/project-access.service';
import { ProjectsRepository } from './repositories/projects.repository';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectMember])],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectAccessService, ProjectsRepository],
  exports: [ProjectsService, ProjectAccessService],
})
export class ProjectsModule {}
