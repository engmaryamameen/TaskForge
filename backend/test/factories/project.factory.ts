import { DataSource } from 'typeorm';
import { Project } from '../../src/modules/projects/entities/project.entity';

export interface CreateProjectOptions {
  organizationId: string;
  createdBy: string;
  name?: string;
  description?: string;
}

let projectCounter = 0;

/**
 * Creates a project directly in the database.
 */
export async function createProject(
  dataSource: DataSource,
  options: CreateProjectOptions,
): Promise<Project> {
  projectCounter++;
  const repo = dataSource.getRepository(Project);
  const project = repo.create({
    name: options.name ?? `Test Project ${projectCounter}`,
    description: options.description ?? null,
    organizationId: options.organizationId,
    createdBy: options.createdBy,
  });
  return repo.save(project);
}
