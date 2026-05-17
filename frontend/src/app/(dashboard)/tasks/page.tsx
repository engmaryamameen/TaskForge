'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useTaskPageFilters } from '@/features/tasks/hooks/useTaskPageFilters';
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
  const {
    apiFilters,
    pageTitle,
    pageSubtitle,
    filterTasksForView,
    hasActiveFilters,
  } = useTaskPageFilters();

  const { data, isLoading, isError, refetch } = useTasks(apiFilters);
  const { data: projectsData } = useProjects();
  const hasProjects = projectsData?.data && projectsData.data.length > 0;
  const [showCreateModal, setShowCreateModal] = useState(false);

  const rawTasks = data?.data;
  const tasks = useMemo(
    () => filterTasksForView(rawTasks),
    [filterTasksForView, rawTasks],
  );
  const hasTasks = tasks && tasks.length > 0;

  const totalTasks = tasks?.length ?? 0;
  const todoCount = tasks?.filter((t: Task) => t.status === 'todo').length ?? 0;
  const inProgressCount =
    tasks?.filter((t: Task) => t.status === 'in_progress').length ?? 0;
  const doneCount = tasks?.filter((t: Task) => t.status === 'done').length ?? 0;

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {pageTitle}
            </h1>
            {hasActiveFilters && (
              <Link
                href="/tasks"
                className="text-[13px] font-medium text-primary-600 hover:text-primary-700"
              >
                Clear filters
              </Link>
            )}
          </div>
          <p className="mt-1 text-sm text-neutral-500">{pageSubtitle}</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          disabled={!hasProjects}
          title={!hasProjects ? 'Create a project first' : undefined}
          leftIcon={<IconPlus className="h-4 w-4" />}
        >
          New task
        </Button>
      </div>

      {hasTasks && (
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5">
            <span className="text-xs text-neutral-500">Showing</span>
            <span className="text-sm font-semibold text-neutral-900">{totalTasks}</span>
          </div>
          <Badge variant="todo">{todoCount} To do</Badge>
          <Badge variant="in-progress">{inProgressCount} In progress</Badge>
          <Badge variant="done">{doneCount} Done</Badge>
        </div>
      )}

      {isLoading && <PageSkeleton variant="kanban" />}

      {!isLoading && isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && hasTasks && (
        <TaskBoard tasks={tasks} hasActiveFilters={hasActiveFilters} />
      )}

      {!isLoading && !isError && !hasTasks && (
        <EmptyState
          title={hasActiveFilters ? 'No tasks match these filters' : 'No tasks yet'}
          description={
            hasActiveFilters
              ? 'Try clearing filters or creating a task that matches this view.'
              : hasProjects
                ? 'Create your first task to start tracking your work.'
                : 'Create a project first, then add tasks to it.'
          }
          icon={<IconCheckSquare className="h-6 w-6" />}
          action={
            hasProjects
              ? {
                  label: hasActiveFilters ? 'New task' : 'Create your first task',
                  onClick: () => setShowCreateModal(true),
                }
              : undefined
          }
        />
      )}

      <TaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
