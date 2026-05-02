'use client';

import { useState } from 'react';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { TaskBoard } from '@/features/tasks/components/task-board';
import { TaskModal } from '@/features/tasks/components/task-modal';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { IconPlus, IconCheckSquare } from '@/components/icons';
import type { Task } from '@/types';

export default function TasksPage() {
  const { data, isLoading, isError, refetch } = useTasks();
  const { data: projectsData } = useProjects();
  const hasProjects = projectsData?.data && projectsData.data.length > 0;
  const [showCreateModal, setShowCreateModal] = useState(false);

  const tasks = data?.data;
  const hasTasks = tasks && tasks.length > 0;

  const totalTasks = tasks?.length ?? 0;
  const todoCount = tasks?.filter((t: Task) => t.status === 'todo').length ?? 0;
  const inProgressCount = tasks?.filter((t: Task) => t.status === 'in_progress').length ?? 0;
  const doneCount = tasks?.filter((t: Task) => t.status === 'done').length ?? 0;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Task Board</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Drag and drop tasks between columns to update their status.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          disabled={!hasProjects}
          title={!hasProjects ? 'Create a project first' : undefined}
          leftIcon={<IconPlus className="h-4 w-4" />}
        >
          New Task
        </Button>
      </div>

      {/* Quick stats */}
      {hasTasks && (
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 border border-neutral-200">
            <span className="text-xs text-neutral-500">Total</span>
            <span className="text-sm font-semibold text-neutral-900">{totalTasks}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="todo">{todoCount} To Do</Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="in-progress">{inProgressCount} In Progress</Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="done">{doneCount} Done</Badge>
          </div>
        </div>
      )}

      {isLoading && <PageSkeleton variant="cards" />}

      {!isLoading && isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && hasTasks && (
        <TaskBoard tasks={tasks} />
      )}

      {!isLoading && !isError && !hasTasks && (
        <EmptyState
          title="No tasks yet"
          description={hasProjects
            ? "Create your first task to start tracking your work."
            : "Create a project first, then add tasks to it."
          }
          icon={<IconCheckSquare className="h-6 w-6" />}
          action={hasProjects ? { label: 'Create your first task', onClick: () => setShowCreateModal(true) } : undefined}
        />
      )}

      <TaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
