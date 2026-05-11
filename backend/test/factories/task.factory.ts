import { DataSource } from 'typeorm';
import { Task } from '../../src/modules/tasks/entities/task.entity';

export interface CreateTaskOptions {
  projectId: string;
  organizationId: string;
  createdBy: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: string | null;
  dueDate?: Date | null;
}

let taskCounter = 0;

/**
 * Creates a task directly in the database.
 */
export async function createTask(
  dataSource: DataSource,
  options: CreateTaskOptions,
): Promise<Task> {
  taskCounter++;
  const repo = dataSource.getRepository(Task);
  const task = repo.create({
    title: options.title ?? `Test Task ${taskCounter}`,
    description: options.description ?? null,
    status: options.status ?? 'todo',
    priority: options.priority ?? 'medium',
    assignedTo: options.assignedTo ?? null,
    dueDate: options.dueDate ?? null,
    projectId: options.projectId,
    organizationId: options.organizationId,
    createdBy: options.createdBy,
  });
  return repo.save(task);
}
