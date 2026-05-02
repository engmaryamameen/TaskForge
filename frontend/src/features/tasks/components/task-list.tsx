'use client';

import { useMemo, useState } from 'react';
import { useUpdateTask } from '@/features/tasks/hooks/useTasks';
import { useOrgMembers } from '@/features/organizations/hooks/useOrganizations';
import { TaskModal } from './task-modal';
import type { Task } from '@/types';
import { TaskStatus, TaskPriority } from '@/types';
import { Select } from '@/components/ui/select';
import { formatTaskStatus, formatTaskPriority, formatDate, isOverdue } from '@/lib/utils';
import { assigneeSelectOptions } from '@/features/tasks/lib/assignee-select-options';

interface TaskListProps {
  tasks: Task[];
  projectId?: string;
}

function statusColor(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.TODO:
      return 'border-0 bg-neutral-100 text-neutral-600';
    case TaskStatus.IN_PROGRESS:
      return 'border-0 bg-primary-50 text-primary-700';
    case TaskStatus.DONE:
      return 'border-0 bg-green-50 text-green-700';
  }
}

function priorityColor(priority: TaskPriority): string {
  switch (priority) {
    case TaskPriority.URGENT:
      return 'border-0 bg-red-50 text-red-700';
    case TaskPriority.HIGH:
      return 'border-0 bg-orange-50 text-orange-700';
    case TaskPriority.MEDIUM:
      return 'border-0 bg-yellow-50 text-yellow-700';
    case TaskPriority.LOW:
      return 'border-0 bg-neutral-100 text-neutral-500';
  }
}

const STATUS_OPTIONS = Object.values(TaskStatus).map((s) => ({
  value: s,
  label: formatTaskStatus(s),
}));

const PRIORITY_OPTIONS = Object.values(TaskPriority).map((p) => ({
  value: p,
  label: formatTaskPriority(p),
}));

export function TaskList({ tasks, projectId }: TaskListProps) {
  const updateTask = useUpdateTask();
  const { data: members } = useOrgMembers();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const assigneeOptions = useMemo(() => assigneeSelectOptions(members), [members]);

  function handleStatusChange(task: Task, newStatus: TaskStatus) {
    if (newStatus === task.status) return;
    updateTask.mutate({ id: task.id, payload: { status: newStatus } });
  }

  function handlePriorityChange(task: Task, newPriority: TaskPriority) {
    if (newPriority === task.priority) return;
    updateTask.mutate({ id: task.id, payload: { priority: newPriority } });
  }

  function handleAssigneeChange(task: Task, userId: string) {
    const next = userId === '' ? null : userId;
    const current = task.assignedTo ?? null;
    if (next === current) return;
    updateTask.mutate({ id: task.id, payload: { assignedTo: next } });
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Title
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Status
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Priority
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Assignee
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Due Date
              </th>
              <th className="w-16 px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {tasks.map((task) => (
              <tr key={task.id} className="transition-colors hover:bg-primary-50/30">
                <td className="px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingTask(task)}
                    className="w-full cursor-pointer text-left font-medium text-neutral-900 hover:text-primary-700"
                  >
                    {task.title}
                  </button>
                </td>
                <td className="px-4 py-2.5">
                  <Select
                    id={`task-${task.id}-status`}
                    value={task.status}
                    onChange={(v) => handleStatusChange(task, v as TaskStatus)}
                    options={STATUS_OPTIONS}
                    size="sm"
                    triggerClassName={`cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-primary-200 ${statusColor(task.status)}`}
                  />
                </td>
                <td className="px-4 py-2.5">
                  <Select
                    id={`task-${task.id}-priority`}
                    value={task.priority}
                    onChange={(v) => handlePriorityChange(task, v as TaskPriority)}
                    options={PRIORITY_OPTIONS}
                    size="sm"
                    triggerClassName={`cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-primary-200 ${priorityColor(task.priority)}`}
                  />
                </td>
                <td className="min-w-[11rem] px-4 py-2.5">
                  <Select
                    id={`task-${task.id}-assignee`}
                    value={task.assignedTo ?? ''}
                    onChange={(v) => handleAssigneeChange(task, v)}
                    options={assigneeOptions}
                    size="sm"
                    placeholder="Unassigned"
                    triggerClassName="cursor-pointer border-neutral-200/90 bg-white text-left text-[11px] font-semibold normal-case tracking-normal text-neutral-800 shadow-xs"
                  />
                </td>
                <td className="px-4 py-2.5">
                  {task.dueDate ? (
                    <span
                      className={`text-xs ${
                        isOverdue(task.dueDate) && task.status !== TaskStatus.DONE
                          ? 'font-semibold text-red-600'
                          : 'text-neutral-500'
                      }`}
                    >
                      {formatDate(task.dueDate)}
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-300">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingTask(task)}
                    className="cursor-pointer rounded px-2 py-1 text-xs text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        projectId={projectId || editingTask?.projectId}
        task={editingTask ?? undefined}
      />
    </>
  );
}
