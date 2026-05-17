'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCreateTask, useUpdateTask } from '@/features/tasks/hooks/useTasks';
import { useOrgMembers } from '@/features/organizations/hooks/useOrganizations';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useOptionalDashboardModals } from '@/components/layout/dashboard-modals-context';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Select } from '@/components/ui/select';
import { TaskStatus, TaskPriority } from '@/types';
import type { Task } from '@/types';
import { formatTaskStatus, formatTaskPriority } from '@/lib/utils';

/** Sentinel value for project dropdown — closes task modal and opens create-project flow */
export const TASK_MODAL_CREATE_PROJECT_VALUE = '__tf_create_project__';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  task?: Task;
  defaultStatus?: TaskStatus;
}

export function TaskModal({ isOpen, onClose, projectId, task, defaultStatus }: TaskModalProps) {
  const isEdit = !!task;
  const dashboardModals = useOptionalDashboardModals();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: members } = useOrgMembers();
  const { data: projectsData } = useProjects();
  const projects = projectsData?.data;

  const projectSelectOptions = useMemo(() => {
    const rows = projects?.map((p) => ({ value: p.id, label: p.name })) ?? [];
    if (isEdit || projectId) return rows;
    if (rows.length === 0 && dashboardModals) {
      return [{ value: TASK_MODAL_CREATE_PROJECT_VALUE, label: '+ Create project' }];
    }
    return rows;
  }, [projects, isEdit, projectId, dashboardModals]);

  function handleProjectChange(value: string) {
    if (value === TASK_MODAL_CREATE_PROJECT_VALUE) {
      onClose();
      queueMicrotask(() => dashboardModals?.openProjectModal());
      return;
    }
    setSelectedProjectId(value);
  }

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
  }, [isOpen, task, projectId, defaultStatus]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    if (isEdit) {
      updateTask.mutate(
        {
          id: task!.id,
          payload: {
            title: trimmedTitle,
            description: description.trim() || undefined,
            status,
            priority,
            assignedTo: assignedTo ? assignedTo : null,
            dueDate: dueDate || undefined,
          },
        },
        { onSuccess: () => onClose() },
      );
    } else {
      if (!selectedProjectId) return;
      createTask.mutate(
        {
          projectId: selectedProjectId,
          payload: {
            title: trimmedTitle,
            description: description.trim() || undefined,
            status,
            priority,
            assignedTo: assignedTo || undefined,
            dueDate: dueDate || undefined,
          },
        },
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
        <div className="mb-4 rounded-lg bg-danger-50 border border-danger-100 p-3 text-sm text-danger-700">
          {error instanceof Error && 'code' in error && (error as { code: string }).code === 'INSUFFICIENT_ROLE'
            ? `You don\u2019t have permission to ${isEdit ? 'update' : 'create'} tasks.`
            : `Failed to ${isEdit ? 'update' : 'create'} task. Please try again.`}
        </div>
      )}

      <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
        {/* ── Details ── */}
        <fieldset className="space-y-4">
          <legend className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            Details
          </legend>
          {!isEdit && !projectId && (
            <Select
              id="task-project"
              label="Project"
              value={selectedProjectId}
              onChange={handleProjectChange}
              placeholder={projectSelectOptions.length === 0 ? 'No projects yet' : 'Select a project'}
              options={projectSelectOptions}
            />
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
        </fieldset>

        {/* ── Workflow ── */}
        <fieldset className="space-y-4 border-t border-neutral-100 pt-5">
          <legend className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            Workflow
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <Select
              id="task-status"
              label="Status"
              value={status}
              onChange={(v) => setStatus(v as TaskStatus)}
              options={Object.values(TaskStatus).map((s) => ({
                value: s,
                label: formatTaskStatus(s),
              }))}
            />
            <Select
              id="task-priority"
              label="Priority"
              value={priority}
              onChange={(v) => setPriority(v as TaskPriority)}
              options={Object.values(TaskPriority).map((p) => ({
                value: p,
                label: formatTaskPriority(p),
              }))}
            />
          </div>
        </fieldset>

        {/* ── Assignment ── */}
        <fieldset className="space-y-4 border-t border-neutral-100 pt-5">
          <legend className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            Assignment
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <Select
              id="task-assignee"
              label="Assignee"
              value={assignedTo}
              onChange={setAssignedTo}
              placeholder="Unassigned"
              options={[
                { value: '', label: 'Unassigned' },
                ...(members?.map((m) => ({
                  value: m.userId,
                  label: m.user ? `${m.user.firstName} ${m.user.lastName}` : m.userId,
                })) ?? []),
              ]}
            />
            <DatePicker
              id="task-due"
              label="Due Date"
              value={dueDate}
              onChange={setDueDate}
              placeholder="mm/dd/yyyy"
            />
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
