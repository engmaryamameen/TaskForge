'use client';

import { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types';
import { TaskPriority, TaskStatus } from '@/types';
import { formatTaskPriority } from '@/lib/utils';
import { getTaskDueLabel } from '@/features/tasks/lib/due-date-label';
import { assigneeSelectOptions } from '@/features/tasks/lib/assignee-select-options';
import { useOrgMembers } from '@/features/organizations/hooks/useOrganizations';
import { useUpdateTask } from '@/features/tasks/hooks/useTasks';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { IconMenu } from '@/components/icons';

interface TaskBoardCardProps {
  task: Task;
  onOpenDetails: (task: Task) => void;
  onEdit: (task: Task) => void;
}

const PRIORITY_CONFIG: Record<TaskPriority, { variant: 'urgent' | 'high' | 'medium' | 'low' }> = {
  [TaskPriority.URGENT]: { variant: 'urgent' },
  [TaskPriority.HIGH]: { variant: 'high' },
  [TaskPriority.MEDIUM]: { variant: 'medium' },
  [TaskPriority.LOW]: { variant: 'low' },
};

export function TaskBoardCard({ task, onOpenDetails, onEdit }: TaskBoardCardProps) {
  const updateTask = useUpdateTask();
  const { data: members } = useOrgMembers();
  const assigneeOptions = useMemo(() => assigneeSelectOptions(members), [members]);

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

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const dueLabel = getTaskDueLabel(task.dueDate, task.status);
  const dueUrgent =
    task.dueDate &&
    task.status !== TaskStatus.DONE &&
    (dueLabel === 'Overdue' || dueLabel === 'Due today');

  function handleAssigneeChange(userId: string) {
    const next = userId === '' ? null : userId;
    const current = task.assignedTo ?? null;
    if (next === current) return;
    updateTask.mutate({ id: task.id, payload: { assignedTo: next } });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border bg-white transition-all select-none ${
        isDragging
          ? 'border-primary-300 shadow-medium ring-2 ring-primary-100'
          : 'border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:shadow-soft'
      }`}
    >
      <div className="flex gap-0">
        <button
          type="button"
          className="shrink-0 cursor-grab touch-none rounded-l-lg border-r border-neutral-100 px-1.5 py-3 text-neutral-300 hover:bg-neutral-50 active:cursor-grabbing"
          aria-label="Drag to move task"
          {...attributes}
          {...listeners}
        >
          <IconMenu className="h-4 w-4 -rotate-90" />
        </button>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            className="w-full cursor-pointer px-2 py-3 text-left"
            onClick={() => onOpenDetails(task)}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13px] font-semibold leading-snug text-neutral-900">{task.title}</p>
              <Badge variant={priorityConfig.variant} className="shrink-0 text-[10px]">
                {formatTaskPriority(task.priority)}
              </Badge>
            </div>

            {dueLabel && (
              <p
                className={`mt-2 text-[11px] font-medium ${
                  dueUrgent ? 'text-danger-600' : 'text-neutral-500'
                }`}
              >
                {dueLabel}
              </p>
            )}
          </button>

          <div
            className="border-t border-neutral-100 px-2 pb-2.5 pt-1"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Assignee
            </p>
            <Select
              id={`board-${task.id}-assignee`}
              value={task.assignedTo ?? ''}
              onChange={handleAssigneeChange}
              options={assigneeOptions}
              size="sm"
              placeholder="Unassigned"
              triggerClassName="cursor-pointer w-full max-w-full border-neutral-200 bg-neutral-50/90 text-left text-[11px] font-semibold normal-case tracking-normal text-neutral-800"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(task);
        }}
        className="w-full cursor-pointer rounded-b-lg border-t border-neutral-100 py-1.5 text-[11px] text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-50 hover:text-neutral-700"
      >
        Edit task
      </button>
    </div>
  );
}
