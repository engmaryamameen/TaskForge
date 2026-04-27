'use client';

import { useState } from 'react';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { TaskStatus, TaskPriority } from '@/types';
import { formatTaskStatus, formatTaskPriority, formatRelative } from '@/lib/utils';

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');

  const { data, isLoading } = useTasks({
    ...(statusFilter && { status: statusFilter }),
    ...(priorityFilter && { priority: priorityFilter }),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
      </div>

      <div className="mb-4 flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          {Object.values(TaskStatus).map((s) => (
            <option key={s} value={s}>
              {formatTaskStatus(s)}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value as TaskPriority | '')
          }
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All priorities</option>
          {Object.values(TaskPriority).map((p) => (
            <option key={p} value={p}>
              {formatTaskPriority(p)}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading tasks...</p>}

      {data?.data && data.data.length > 0 && (
        <div className="rounded-lg bg-white shadow-sm">
          {data.data.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between border-b border-gray-100 px-6 py-4 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {task.title}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {formatTaskStatus(task.status)} &middot;{' '}
                  {formatRelative(task.createdAt)}
                </p>
              </div>
              <span
                className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                  task.priority === 'urgent'
                    ? 'bg-red-100 text-red-700'
                    : task.priority === 'high'
                      ? 'bg-orange-100 text-orange-700'
                      : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                }`}
              >
                {formatTaskPriority(task.priority)}
              </span>
            </div>
          ))}
        </div>
      )}

      {data?.data?.length === 0 && (
        <p className="text-sm text-gray-500">No tasks match your filters.</p>
      )}
    </div>
  );
}
