'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { TaskList } from '@/features/tasks/components/task-list';
import { TaskListSkeleton } from '@/features/tasks/components/task-list-skeleton';
import { TaskFilters } from '@/features/tasks/components/task-filters';
import { TaskModal } from '@/features/tasks/components/task-modal';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import type { TaskStatus, TaskPriority } from '@/types';

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const status = (searchParams.get('status') || '') as TaskStatus | '';
  const priority = (searchParams.get('priority') || '') as TaskPriority | '';

  const { data, isLoading, isError, refetch } = useTasks({
    page,
    search: search || undefined,
    status: status || undefined,
    priority: priority || undefined,
  });

  const { data: projectsData } = useProjects();
  const hasProjects = projectsData?.data && projectsData.data.length > 0;

  const [showCreateModal, setShowCreateModal] = useState(false);

  function updateURL(updates: Record<string, string>) {
    const params = new URLSearchParams();
    const merged = {
      search,
      status,
      priority,
      page: String(page),
      ...updates,
    };
    if (!('page' in updates)) merged.page = '1';

    if (merged.search) params.set('search', merged.search);
    if (merged.status) params.set('status', merged.status);
    if (merged.priority) params.set('priority', merged.priority);
    if (merged.page !== '1') params.set('page', merged.page);
    const qs = params.toString();

    if ('page' in updates) {
      router.push(qs ? `?${qs}` : '/tasks');
    } else {
      router.replace(qs ? `?${qs}` : '/tasks');
    }
  }

  const handleSearchChange = useCallback((value: string) => {
    updateURL({ search: value });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, priority]);

  const tasks = data?.data;
  const total = data?.meta?.total ?? 0;
  const limit = 20;
  const totalPages = Math.ceil(total / limit);
  const hasTasks = tasks && tasks.length > 0;
  const hasActiveFilters = !!search || !!status || !!priority;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!hasProjects}
          title={!hasProjects ? 'Create a project first' : undefined}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Task
        </button>
      </div>

      <div className="mb-6">
        <TaskFilters
          search={search}
          status={status}
          priority={priority}
          onSearchChange={handleSearchChange}
          onStatusChange={(v) => updateURL({ status: v })}
          onPriorityChange={(v) => updateURL({ priority: v })}
        />
      </div>

      {isLoading && <TaskListSkeleton />}

      {!isLoading && isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && hasTasks && (
        <>
          <TaskList tasks={tasks} />

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => updateURL({ page: String(page - 1) })}
                disabled={page <= 1}
                className="rounded px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateURL({ page: String(p) })}
                  className={`rounded px-3 py-1.5 text-sm font-medium ${
                    p === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => updateURL({ page: String(page + 1) })}
                disabled={page >= totalPages}
                className="rounded px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {!isLoading && !isError && !hasTasks && !hasActiveFilters && (
        <EmptyState
          title="No tasks yet"
          description="Create your first task to start tracking work."
          action={hasProjects ? { label: 'Create your first task', onClick: () => setShowCreateModal(true) } : undefined}
        />
      )}

      {!isLoading && !isError && !hasTasks && hasActiveFilters && (
        <EmptyState
          title="No tasks match your filters"
          description="Try adjusting your search or filter criteria."
        />
      )}

      <TaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
