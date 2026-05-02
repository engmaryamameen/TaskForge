'use client';

import { useState, useEffect } from 'react';
import { useCreateTask, useUpdateTask } from '@/features/tasks/hooks/useTasks';
import { useOrgMembers } from '@/features/organizations/hooks/useOrganizations';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TaskStatus, TaskPriority } from '@/types';
import type { Task } from '@/types';
import { formatTaskStatus, formatTaskPriority } from '@/lib/utils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  task?: Task;
  defaultStatus?: TaskStatus;
}

export function TaskModal({ isOpen, onClose, projectId, task, defaultStatus }: TaskModalProps) {
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
      setStatus(task?.status || defaultStatus || TaskStatus.TODO);
      setPriority(task?.priority || TaskPriority.MEDIUM);
      setAssignedTo(task?.assignedTo || '');
      setDueDate(task?.dueDate || '');
    }
  }, [isOpen, task, projectId]);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Task' : 'Create Task'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            form="task-form"
            loading={isPending}
            disabled={!canSubmit}
          >
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
          Failed to {isEdit ? 'update' : 'create'} task. Please try again.
        </div>
      )}

      <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
        {!isEdit && !projectId && (
          <Select
            id="task-project"
            label="Project"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">Select a project</option>
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        )}

        <Input
          id="task-title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          autoFocus
        />

        <Textarea
          id="task-desc"
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            id="task-status"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            {Object.values(TaskStatus).map((s) => (
              <option key={s} value={s}>{formatTaskStatus(s)}</option>
            ))}
          </Select>

          <Select
            id="task-priority"
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            {Object.values(TaskPriority).map((p) => (
              <option key={p} value={p}>{formatTaskPriority(p)}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            id="task-assignee"
            label="Assignee"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">Unassigned</option>
            {members?.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user ? `${m.user.firstName} ${m.user.lastName}` : m.userId}
              </option>
            ))}
          </Select>

          <Input
            id="task-due"
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
