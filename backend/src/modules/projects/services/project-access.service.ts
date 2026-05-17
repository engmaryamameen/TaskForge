import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from '../entities/project.entity';
import { ProjectMember } from '../entities/project-member.entity';
import { Role, ProjectMemberRole } from '../../../shared/rbac';

@Injectable()
export class ProjectAccessService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly memberRepo: Repository<ProjectMember>,
  ) {}

  async canAccessProject(
    userId: string,
    projectId: string,
    orgRole?: string,
  ): Promise<boolean> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      select: ['id', 'visibility', 'createdBy', 'organizationId'],
    });
    if (!project) return false;

    if (project.visibility === 'public') return true;

    if (project.createdBy === userId) return true;

    if (orgRole && (orgRole === Role.OWNER || orgRole === Role.ADMIN)) return true;

    const membership = await this.memberRepo.findOne({
      where: { projectId, userId },
    });
    return !!membership;
  }

  async getProjectVisibleUserIds(projectId: string): Promise<string[]> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      select: ['id', 'visibility', 'createdBy'],
    });
    if (!project) return [];

    if (project.visibility === 'public') return [];

    const members = await this.memberRepo.find({
      where: { projectId },
      select: ['userId'],
    });

    const userIds = new Set(members.map((m) => m.userId));
    userIds.add(project.createdBy);
    return Array.from(userIds);
  }

  async addProjectMember(
    projectId: string,
    userId: string,
    role: ProjectMemberRole,
    addedBy: string,
  ): Promise<ProjectMember> {
    const existing = await this.memberRepo.findOne({
      where: { projectId, userId },
    });
    if (existing) return existing;

    const member = this.memberRepo.create({
      projectId,
      userId,
      role,
      addedBy,
    });
    return this.memberRepo.save(member);
  }

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    await this.memberRepo.delete({ projectId, userId });
  }

  async listProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return this.memberRepo.find({
      where: { projectId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async filterAccessibleProjectIds(
    userId: string,
    projectIds: string[],
    orgRole?: string,
  ): Promise<string[]> {
    if (!projectIds.length) return [];

    if (orgRole === Role.OWNER || orgRole === Role.ADMIN) return projectIds;

    const projects = await this.projectRepo.find({
      where: { id: In(projectIds) },
      select: ['id', 'visibility', 'createdBy'],
    });

    const publicIds = projects
      .filter((p) => p.visibility === 'public' || p.createdBy === userId)
      .map((p) => p.id);

    const privateIds = projects
      .filter((p) => p.visibility === 'private' && p.createdBy !== userId)
      .map((p) => p.id);

    if (!privateIds.length) return publicIds;

    const memberships = await this.memberRepo.find({
      where: { userId, projectId: In(privateIds) },
      select: ['projectId'],
    });
    const memberProjectIds = memberships.map((m) => m.projectId);

    return [...publicIds, ...memberProjectIds];
  }
}
