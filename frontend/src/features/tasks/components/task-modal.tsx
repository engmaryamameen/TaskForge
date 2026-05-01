'use client';

import { useState, useEffect } from 'react';
import { useCreateTask, useUpdateTask } from '@/features/tasks/hooks/useTasks';
import { useOrgMembers } from '@/features/organizations/hooks/useOrganizations';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { TaskStatus, TaskPriority } from '@/types';
import type { Task } from '@/types';
import { formatTaskStatus, formatTaskPriority } from '@/lib/utils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  task?: Task;
}

export function TaskModal({ isOpen, onClose, projectId, task }: TaskModalProps) {
  const isEdit = !!task;
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: members } = useOrgMembers();
  const { data: projectsData } = useProjects();
  const projects = projectsData?.data;

  const [selectedProjectId, setSelectedProjectId] = useState(projectId || task?.projectId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedProjectId(projectId || task?.projectId || '');
      setTitle(task?.title || '');
      setDescription(task?.description || '');
      setStatus(task?.status || TaskStatus.TODO);
      setPriority(task?.priority || TaskPriority.MEDIUM);
      setAssignedTo(task?.assignedTo || '');
      setDueDate(task?.dueDate || '');
    }
  }, [isOpen, task, projectId]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const payload = {
      title: trimmedTitle,
      description: description.trim() || undefined,
      status,
      priority,
      assignedTo: assignedTo || undefined,
      dueDate: dueDate || undefined,
    };

    if (isEdit) {
      updateTask.mutate(
        { id: task!.id, payload },
        { onSuccess: () => onClose() },
      );
    } else {
      if (!selectedProjectId) return;
      createTask.mutate(
        { projectId: selectedProjectId, payload },
        { onSuccess: () => onClose() },
      );
    }
  }

  const isPending = createTask.isPending || updateTask.isPending;
  const error = createTask.error || updateTask.error;
  const canSubmit = title.trim() && (isEdit || selectedProjectId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {isEdit ? 'Edit Task' : 'Create Task'}
        </h2>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
            Failed to {isEdit ? 'update' : 'create'} task. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project selector (create mode only, when no projectId provided) */}
          {!isEdit && !projectId && (
            <div>
              <label htmlFor="task-project" className="mb-1 block text-sm font-medium text-gray-700">
                Project
              </label>
              <select
                id="task-project"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select a project</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="task-title" className="mb-1 block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="task-desc" className="mb-1 block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-status" className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {Object.values(TaskStatus).map((s) => (
                  <option key={s} value={s}>{formatTaskStatus(s)}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-priority" className="mb-1 block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {Object.values(TaskPriority).map((p) => (
                  <option key={p} value={p}>{formatTaskPriority(p)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-assignee" className="mb-1 block text-sm font-medium text-gray-700">
                Assignee
              </label>
              <select
                id="task-assignee"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {members?.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user ? `${m.user.firstName} ${m.user.lastName}` : m.userId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-due" className="mb-1 block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !canSubmit}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
