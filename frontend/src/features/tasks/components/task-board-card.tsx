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

function priorityIcon(priority: TaskPriority): { color: string; arrow: string } {
  switch (priority) {
    case TaskPriority.URGENT: return { color: 'text-red-500', arrow: '↑↑' };
    case TaskPriority.HIGH: return { color: 'text-orange-500', arrow: '↑' };
    case TaskPriority.MEDIUM: return { color: 'text-yellow-600', arrow: '→' };
    case TaskPriority.LOW: return { color: 'text-blue-400', arrow: '↓' };
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
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const assignee = task.assignedTo
    ? members?.find((m) => m.userId === task.assignedTo)
    : null;

  const pi = priorityIcon(task.priority);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-md border bg-white px-3 py-2.5 transition-shadow select-none ${
        isDragging
          ? 'border-primary-300 shadow-medium ring-2 ring-primary-100'
          : 'border-gray-200 shadow-soft hover:shadow-medium hover:border-gray-300'
      }`}
    >
      {/* Drag handle — the whole card is draggable */}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <p className="text-[13px] font-medium text-gray-900 leading-snug">{task.title}</p>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${pi.color}`} title={formatTaskPriority(task.priority)}>
              {pi.arrow}
            </span>
            {task.dueDate && (
              <span className={`text-[11px] ${isOverdue(task.dueDate) && task.status !== TaskStatus.DONE ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {assignee?.user && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700" title={`${assignee.user.firstName} ${assignee.user.lastName}`}>
                {getInitials(assignee.user.firstName, assignee.user.lastName)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click to edit — separate from drag area, appears on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(task); }}
        className="mt-1.5 w-full rounded py-0.5 text-[11px] text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-600 transition-all"
      >
        View details
      </button>
    </div>
  );
}
