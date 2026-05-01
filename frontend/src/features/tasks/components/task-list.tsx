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
    case TaskStatus.TODO: return 'bg-gray-100 text-gray-700';
    case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
    case TaskStatus.DONE: return 'bg-green-100 text-green-700';
  }
}

function priorityColor(priority: TaskPriority): string {
  switch (priority) {
    case TaskPriority.URGENT: return 'bg-red-100 text-red-700';
    case TaskPriority.HIGH: return 'bg-orange-100 text-orange-700';
    case TaskPriority.MEDIUM: return 'bg-yellow-100 text-yellow-700';
    case TaskPriority.LOW: return 'bg-gray-100 text-gray-600';
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
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900">{task.title}</span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium border-0 cursor-pointer ${statusColor(task.status)}`}
                  >
                    {Object.values(TaskStatus).map((s) => (
                      <option key={s} value={s}>{formatTaskStatus(s)}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={task.priority}
                    onChange={(e) => handlePriorityChange(task, e.target.value as TaskPriority)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium border-0 cursor-pointer ${priorityColor(task.priority)}`}
                  >
                    {Object.values(TaskPriority).map((p) => (
                      <option key={p} value={p}>{formatTaskPriority(p)}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {getMemberName(task.assignedTo)}
                </td>
                <td className="px-4 py-3">
                  {task.dueDate ? (
                    <span className={isOverdue(task.dueDate) && task.status !== TaskStatus.DONE ? 'text-red-600 font-medium' : 'text-gray-600'}>
                      {formatDate(task.dueDate)}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditingTask(task)}
                    className="text-xs text-gray-500 hover:text-gray-700"
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
