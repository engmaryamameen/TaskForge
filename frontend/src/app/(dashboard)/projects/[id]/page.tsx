'use client';

import { use } from 'react';
import { useProject } from '@/features/projects/hooks/useProjects';
import { useTasksByProject } from '@/features/tasks/hooks/useTasks';
import { formatTaskStatus, formatTaskPriority, formatRelative } from '@/lib/utils';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: tasksData, isLoading: tasksLoading } = useTasksByProject(id);

  if (projectLoading) {
    return <p className="text-sm text-gray-500">Loading project...</p>;
  }

  if (!project) {
    return <p className="text-sm text-red-500">Project not found.</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        {project.description && (
          <p className="mt-1 text-gray-600">{project.description}</p>
        )}
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-900">Tasks</h2>

      {tasksLoading && (
        <p className="text-sm text-gray-500">Loading tasks...</p>
      )}

      {tasksData?.data && tasksData.data.length > 0 && (
        <div className="rounded-lg bg-white shadow-sm">
          {tasksData.data.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between border-b border-gray-100 px-6 py-4 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {task.title}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {formatTaskStatus(task.status)} &middot;{' '}
                  {formatRelative(task.createdAt)}
                </p>
              </div>
              <span className="text-xs font-medium text-gray-600">
                {formatTaskPriority(task.priority)}
              </span>
            </div>
          ))}
        </div>
      )}

      {tasksData?.data?.length === 0 && (
        <p className="text-sm text-gray-500">
          No tasks in this project yet.
        </p>
      )}
    </div>
  );
}
