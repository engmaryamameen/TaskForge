'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types';
import { TaskPriority, TaskStatus } from '@/types';
import { formatTaskPriority, formatDate, isOverdue, getInitials } from '@/lib/utils';
import { useOrgMembers } from '@/features/organizations/hooks/useOrganizations';

interface TaskBoardCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

function priorityColor(priority: TaskPriority): string {
  switch (priority) {
    case TaskPriority.URGENT: return 'bg-red-100 text-red-700';
    case TaskPriority.HIGH: return 'bg-orange-100 text-orange-700';
    case TaskPriority.MEDIUM: return 'bg-yellow-100 text-yellow-700';
    case TaskPriority.LOW: return 'bg-gray-100 text-gray-600';
  }
}

export function TaskBoardCard({ task, onEdit }: TaskBoardCardProps) {
  const { data: members } = useOrgMembers();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const assignee = task.assignedTo
    ? members?.find((m) => m.userId === task.assignedTo)
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEdit(task)}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md"
    >
      <p className="text-sm font-medium text-gray-900 line-clamp-2">{task.title}</p>

      <div className="mt-2 flex items-center justify-between">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor(task.priority)}`}>
          {formatTaskPriority(task.priority)}
        </span>

        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className={`text-xs ${isOverdue(task.dueDate) && task.status !== TaskStatus.DONE ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              {formatDate(task.dueDate)}
            </span>
          )}
          {assignee?.user && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
              {getInitials(assignee.user.firstName, assignee.user.lastName)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
