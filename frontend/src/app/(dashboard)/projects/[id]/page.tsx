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
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PageSkeleton } from '@/components/ui/page-skeleton';
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
      return (localStorage.getItem('taskViewMode') as 'table' | 'board') || 'board';
    }
    return 'board';
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
    return <PageSkeleton variant="project-detail" />;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-500">Project not found.</p>
        <Link href="/projects" className="mt-2 text-sm text-primary-600 hover:underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  const tasks = tasksData?.data;
  const hasTasks = tasks && tasks.length > 0;

  const taskStatusFilterOptions = [
    { value: '', label: 'All statuses' },
    ...Object.values(TaskStatus).map((s) => ({
      value: s,
      label: formatTaskStatus(s),
    })),
  ];

  const taskPriorityFilterOptions = [
    { value: '', label: 'All priorities' },
    ...Object.values(TaskPriority).map((p) => ({
      value: p,
      label: formatTaskPriority(p),
    })),
  ];

  return (
    <div>
      {/* Back link */}
      <Link
        href="/projects"
        className="mb-4 inline-block cursor-pointer text-sm text-neutral-500 hover:text-neutral-700"
      >
        &larr; Back to Projects
      </Link>

      {/* Project header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{project.name}</h1>
          {project.description && (
            <p className="mt-1 text-neutral-600">{project.description}</p>
          )}
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="cursor-pointer" onClick={openEditModal}>
              Edit
            </Button>
            <Button variant="danger" size="sm" className="cursor-pointer" onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Tasks section */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-neutral-900">Tasks</h2>
          <div className="flex rounded-md border border-neutral-200">
            <button
              type="button"
              onClick={() => { setViewMode('table'); localStorage.setItem('taskViewMode', 'table'); }}
              className={`cursor-pointer px-3 py-1 text-xs font-medium ${viewMode === 'table' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => { setViewMode('board'); localStorage.setItem('taskViewMode', 'board'); }}
              className={`cursor-pointer px-3 py-1 text-xs font-medium ${viewMode === 'board' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Board
            </button>
          </div>
        </div>
        <Button size="sm" className="cursor-pointer" onClick={() => setShowTaskModal(true)}>
          Add Task
        </Button>
      </div>

      {/* Task filters (table view only — board IS the status view) */}
      {viewMode === 'table' && (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="w-44">
            <Select
              value={taskStatusFilter}
              onChange={(v) => setTaskStatusFilter(v as TaskStatus | '')}
              options={taskStatusFilterOptions}
            />
          </div>
          <div className="w-44">
            <Select
              value={taskPriorityFilter}
              onChange={(v) => setTaskPriorityFilter(v as TaskPriority | '')}
              options={taskPriorityFilterOptions}
            />
          </div>
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
        <div className="rounded-lg bg-white p-8 text-center shadow-soft">
          <p className="text-sm text-neutral-500">No tasks in this project yet.</p>
          <button
            type="button"
            onClick={() => setShowTaskModal(true)}
            className="mt-3 cursor-pointer text-sm font-medium text-primary-600 hover:underline"
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
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Project"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button type="submit" form="edit-project-form" loading={updateProject.isPending} disabled={!editName.trim()}>
              Save
            </Button>
          </>
        }
      >
        <form id="edit-project-form" onSubmit={handleEdit} className="space-y-4">
          <Input
            id="edit-name"
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
          />
          <Textarea
            id="edit-desc"
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={3}
          />
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Project"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteProject.isPending}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
