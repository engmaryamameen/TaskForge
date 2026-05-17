'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types';
import { TaskPriority, TaskStatus } from '@/types';
import { getTaskDueLabel } from '@/features/tasks/lib/due-date-label';
import { useOrgMembers } from '@/features/organizations/hooks/useOrganizations';
import { Avatar } from '@/components/ui/avatar';
import { IconCalendar } from '@/components/icons';

interface TaskBoardCardProps {
  task: Task;
  onOpenDetails: (task: Task) => void;
  onEdit: (task: Task) => void;
}

const PRIORITY_BORDER: Record<TaskPriority, string> = {
  [TaskPriority.URGENT]: 'border-l-4 border-l-danger-500',
  [TaskPriority.HIGH]: 'border-l-4 border-l-orange-500',
  [TaskPriority.MEDIUM]: 'border-l-4 border-l-warning-400',
  [TaskPriority.LOW]: '',
};

export function TaskBoardCard({ task, onOpenDetails, onEdit }: TaskBoardCardProps) {
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
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const dueLabel = getTaskDueLabel(task.dueDate, task.status);
  const dueUrgent =
    task.dueDate &&
    task.status !== TaskStatus.DONE &&
    (dueLabel === 'Overdue' || dueLabel === 'Due today');

  const assignee = task.assignedTo
    ? members?.find((m) => m.userId === task.assignedTo)?.user
    : null;

  const priorityBorder = PRIORITY_BORDER[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group cursor-grab rounded-lg border bg-white transition-all select-none active:cursor-grabbing ${priorityBorder} ${
        isDragging
          ? 'border-primary-300 shadow-medium ring-2 ring-primary-100'
          : 'border-neutral-200 shadow-xs hover:border-neutral-300 hover:shadow-soft'
      }`}
    >
      {/* Main content — clickable to open details */}
      <button
        type="button"
        className="w-full cursor-pointer px-3 py-3 text-left"
        onClick={() => onOpenDetails(task)}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-semibold leading-snug text-neutral-900 line-clamp-2">
          {task.title}
        </p>
      </button>

      {/* Footer: assignee + due date */}
      {(assignee || dueLabel) && (
        <div className="flex items-center justify-between border-t border-neutral-100 px-3 py-2">
          <div className="flex items-center gap-1.5">
            {assignee ? (
              <Avatar
                firstName={assignee.firstName}
                lastName={assignee.lastName}
                size="xs"
              />
            ) : (
              <div className="h-6 w-6" />
            )}
          </div>
          {dueLabel && (
            <span
              className={`flex items-center gap-1 text-[11px] font-medium ${
                dueUrgent ? 'text-danger-600' : 'text-neutral-400'
              }`}
            >
              <IconCalendar className="h-3 w-3" />
              {dueLabel}
            </span>
          )}
        </div>
      )}

      {/* Hover edit button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(task);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-full cursor-pointer rounded-b-lg border-t border-neutral-100 py-1.5 text-xs text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-50 hover:text-neutral-700"
      >
        Edit task
      </button>
    </div>
  );
}
