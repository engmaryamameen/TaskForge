'use client';

import { useState } from 'react';
import { useUpdateTask } from '@/features/tasks/hooks/useTasks';
import { useOrgMembers } from '@/features/organizations/hooks/useOrganizations';
import { TaskModal } from './task-modal';
import type { Task } from '@/types';
import { TaskStatus, TaskPriority } from '@/types';
import { formatTaskStatus, formatTaskPriority, formatDate, isOverdue } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  projectId?: string;
}

function statusColor(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.TODO: return 'bg-neutral-100 text-neutral-600';
    case TaskStatus.IN_PROGRESS: return 'bg-primary-50 text-primary-700';
    case TaskStatus.DONE: return 'bg-green-50 text-green-700';
  }
}

function priorityColor(priority: TaskPriority): string {
  switch (priority) {
    case TaskPriority.URGENT: return 'bg-red-50 text-red-700';
    case TaskPriority.HIGH: return 'bg-orange-50 text-orange-700';
    case TaskPriority.MEDIUM: return 'bg-yellow-50 text-yellow-700';
    case TaskPriority.LOW: return 'bg-neutral-100 text-neutral-500';
  }
}

export function TaskList({ tasks, projectId }: TaskListProps) {
  const updateTask = useUpdateTask();
  const { data: members } = useOrgMembers();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  function getMemberName(userId: string | null): string {
    if (!userId) return 'Unassigned';
    const member = members?.find((m) => m.userId === userId);
    if (member?.user) return `${member.user.firstName} ${member.user.lastName}`;
    return 'Unknown';
  }

  function handleStatusChange(task: Task, newStatus: TaskStatus) {
    if (newStatus === task.status) return;
    updateTask.mutate({ id: task.id, payload: { status: newStatus } });
  }

  function handlePriorityChange(task: Task, newPriority: TaskPriority) {
    if (newPriority === task.priority) return;
    updateTask.mutate({ id: task.id, payload: { priority: newPriority } });
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">Title</th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">Priority</th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">Assignee</th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">Due Date</th>
              <th className="px-4 py-2.5 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-primary-50/30 transition-colors">
                <td className="px-4 py-2.5">
                  <span className="font-medium text-neutral-900">{task.title}</span>
                </td>
                <td className="px-4 py-2.5">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                    className={`appearance-none rounded px-2 py-1 text-[11px] font-bold uppercase tracking-wide border-0 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary-200 ${statusColor(task.status)}`}
                  >
                    {Object.values(TaskStatus).map((s) => (
                      <option key={s} value={s}>{formatTaskStatus(s)}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2.5">
                  <select
                    value={task.priority}
                    onChange={(e) => handlePriorityChange(task, e.target.value as TaskPriority)}
                    className={`appearance-none rounded px-2 py-1 text-[11px] font-bold uppercase tracking-wide border-0 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary-200 ${priorityColor(task.priority)}`}
                  >
                    {Object.values(TaskPriority).map((p) => (
                      <option key={p} value={p}>{formatTaskPriority(p)}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2.5 text-xs text-neutral-600">
                  {getMemberName(task.assignedTo)}
                </td>
                <td className="px-4 py-2.5">
                  {task.dueDate ? (
                    <span className={`text-xs ${isOverdue(task.dueDate) && task.status !== TaskStatus.DONE ? 'text-red-600 font-semibold' : 'text-neutral-500'}`}>
                      {formatDate(task.dueDate)}
                    </span>
                  ) : (
                    <span className="text-neutral-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => setEditingTask(task)}
                    className="rounded px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
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
