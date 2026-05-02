'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types';
import { TaskPriority, TaskStatus } from '@/types';
import { formatTaskPriority, formatDate, isOverdue } from '@/lib/utils';
import { useOrgMembers } from '@/features/organizations/hooks/useOrganizations';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IconCalendar } from '@/components/icons';

interface TaskBoardCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const PRIORITY_CONFIG: Record<TaskPriority, { variant: 'urgent' | 'high' | 'medium' | 'low' }> = {
  [TaskPriority.URGENT]: { variant: 'urgent' },
  [TaskPriority.HIGH]: { variant: 'high' },
  [TaskPriority.MEDIUM]: { variant: 'medium' },
  [TaskPriority.LOW]: { variant: 'low' },
};

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

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== TaskStatus.DONE;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border bg-white transition-all select-none ${
        isDragging
          ? 'border-primary-300 shadow-medium ring-2 ring-primary-100'
          : 'border-neutral-200 shadow-xs hover:shadow-soft hover:border-neutral-300'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-3.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-medium text-neutral-900 leading-snug flex-1">{task.title}</p>
          <Badge variant={priorityConfig.variant} className="shrink-0">
            {formatTaskPriority(task.priority)}
          </Badge>
        </div>

        {task.dueDate && (
          <div className={`mt-2.5 flex items-center gap-1.5 ${overdue ? 'text-danger-600' : 'text-neutral-400'}`}>
            <IconCalendar className="h-3 w-3" />
            <span className={`text-[11px] ${overdue ? 'font-semibold' : ''}`}>
              {formatDate(task.dueDate)}
            </span>
          </div>
        )}

        {assignee?.user && (
          <div className="mt-2.5 flex items-center gap-2">
            <Avatar
              firstName={assignee.user.firstName}
              lastName={assignee.user.lastName}
              size="xs"
            />
            <span className="text-[11px] text-neutral-500">
              {assignee.user.firstName} {assignee.user.lastName}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onEdit(task); }}
        className="w-full border-t border-neutral-100 py-1.5 text-[11px] text-neutral-400 opacity-0 group-hover:opacity-100 hover:bg-neutral-50 hover:text-neutral-600 transition-all rounded-b-lg"
      >
        View details
      </button>
    </div>
  );
}
