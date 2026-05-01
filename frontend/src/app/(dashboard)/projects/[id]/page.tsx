'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProject, useUpdateProject, useDeleteProject } from '@/features/projects/hooks/useProjects';
import { useTasksByProject } from '@/features/tasks/hooks/useTasks';
import { useCurrentOrgRole } from '@/features/organizations/hooks/useOrganizations';
import { useAuthStore } from '@/store/auth.store';
import { TaskList } from '@/features/tasks/components/task-list';
import { TaskListSkeleton } from '@/features/tasks/components/task-list-skeleton';
import { TaskBoard } from '@/features/tasks/components/task-board';
import { TaskModal } from '@/features/tasks/components/task-modal';
import { Role, TaskStatus, TaskPriority } from '@/types';
import { formatTaskStatus, formatTaskPriority } from '@/lib/utils';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const currentRole = useCurrentOrgRole();
  const userId = useAuthStore((s) => s.user?.id);

  const { data: project, isLoading: projectLoading } = useProject(id);

  // Task state (must be before useTasksByProject)
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus | ''>('');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<TaskPriority | ''>('');
  const [viewMode, setViewMode] = useState<'table' | 'board'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('taskViewMode') as 'table' | 'board') || 'table';
    }
    return 'table';
  });

  const { data: tasksData, isLoading: tasksLoading } = useTasksByProject(id, {
    status: taskStatusFilter || undefined,
    priority: taskPriorityFilter || undefined,
  });

  // Project edit/delete state
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const canEdit = currentRole === Role.ADMIN || project?.createdBy === userId;

  function openEditModal() {
    if (!project) return;
    setEditName(project.name);
    setEditDescription(project.description || '');
    setShowEditModal(true);
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = editName.trim();
    if (!trimmed) return;
    updateProject.mutate(
      { id, payload: { name: trimmed, description: editDescription.trim() || undefined } },
      { onSuccess: () => setShowEditModal(false) },
    );
  }

  async function handleDelete() {
    await deleteProject.mutateAsync(id);
    router.replace('/projects');
  }

  if (projectLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 w-32 rounded bg-gray-200 mb-4" />
        <div className="h-8 w-2/3 rounded bg-gray-200 mb-2" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-500">Project not found.</p>
        <Link href="/projects" className="mt-2 text-sm text-blue-600 hover:underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  const tasks = tasksData?.data;
  const hasTasks = tasks && tasks.length > 0;

  return (
    <div>
      {/* Back link */}
      <Link href="/projects" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700">
        &larr; Back to Projects
      </Link>

      {/* Project header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="mt-1 text-gray-600">{project.description}</p>
          )}
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={openEditModal}
              className="rounded bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Tasks section */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
          <div className="flex rounded-md border border-gray-300">
            <button
              onClick={() => { setViewMode('table'); localStorage.setItem('taskViewMode', 'table'); }}
              className={`px-3 py-1 text-xs font-medium ${viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Table
            </button>
            <button
              onClick={() => { setViewMode('board'); localStorage.setItem('taskViewMode', 'board'); }}
              className={`px-3 py-1 text-xs font-medium ${viewMode === 'board' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Board
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowTaskModal(true)}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Task
        </button>
      </div>

      {/* Task filters (table view only — board IS the status view) */}
      {viewMode === 'table' && (
        <div className="mb-4 flex gap-3">
          <select
            value={taskStatusFilter}
            onChange={(e) => setTaskStatusFilter(e.target.value as TaskStatus | '')}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">All statuses</option>
            {Object.values(TaskStatus).map((s) => (
              <option key={s} value={s}>{formatTaskStatus(s)}</option>
            ))}
          </select>
          <select
            value={taskPriorityFilter}
            onChange={(e) => setTaskPriorityFilter(e.target.value as TaskPriority | '')}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">All priorities</option>
            {Object.values(TaskPriority).map((p) => (
              <option key={p} value={p}>{formatTaskPriority(p)}</option>
            ))}
          </select>
        </div>
      )}

      {tasksLoading && <TaskListSkeleton rows={3} />}

      {!tasksLoading && hasTasks && viewMode === 'table' && (
        <TaskList tasks={tasks} projectId={id} />
      )}

      {!tasksLoading && hasTasks && viewMode === 'board' && (
        <TaskBoard tasks={tasks} projectId={id} />
      )}

      {!tasksLoading && !hasTasks && (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">No tasks in this project yet.</p>
          <button
            onClick={() => setShowTaskModal(true)}
            className="mt-3 text-sm font-medium text-blue-600 hover:underline"
          >
            Add your first task
          </button>
        </div>
      )}

      {/* Task create modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        projectId={id}
      />

      {/* Project edit modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowEditModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Edit Project</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="edit-desc" className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="edit-desc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={updateProject.isPending || !editName.trim()} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  {updateProject.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Delete Project</h2>
            <p className="mb-4 text-sm text-gray-600">
              Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
              <button onClick={handleDelete} disabled={deleteProject.isPending} className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {deleteProject.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
