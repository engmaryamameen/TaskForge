'use client';

import { useState } from 'react';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { TaskBoard } from '@/features/tasks/components/task-board';
import { TaskModal } from '@/features/tasks/components/task-modal';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export default function TasksPage() {
  const { data, isLoading, isError, refetch } = useTasks();
  const { data: projectsData } = useProjects();
  const hasProjects = projectsData?.data && projectsData.data.length > 0;
  const [showCreateModal, setShowCreateModal] = useState(false);

  const tasks = data?.data;
  const hasTasks = tasks && tasks.length > 0;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Board</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          disabled={!hasProjects}
          title={!hasProjects ? 'Create a project first' : undefined}
        >
          Create Task
        </Button>
      </div>

      {isLoading && <PageSkeleton variant="cards" />}

      {!isLoading && isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && hasTasks && (
        <TaskBoard tasks={tasks} />
      )}

      {!isLoading && !isError && !hasTasks && (
        <EmptyState
          title="No tasks yet"
          description="Create your first task to start tracking work."
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
