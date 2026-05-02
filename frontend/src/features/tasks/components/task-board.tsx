'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  useDroppable,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useUpdateTask } from '@/features/tasks/hooks/useTasks';
import { TaskBoardCard } from './task-board-card';
import { TaskModal } from './task-modal';
import { TaskDetailsDrawer } from './task-details-drawer';
import type { Task } from '@/types';
import { TaskStatus } from '@/types';
import { formatTaskStatus } from '@/lib/utils';
import { IconPlus } from '@/components/icons';
import { useToast } from '@/components/toast/toast-provider';
import { Button } from '@/components/ui/button';

interface TaskBoardProps {
  tasks: Task[];
  projectId?: string;
  /** When true, empty columns explain that tasks may exist but are hidden by URL/query filters. */
  hasActiveFilters?: boolean;
}

const COLUMNS: TaskStatus[] = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

/** Droppable column wrapper — ensures empty columns accept drops */
function DroppableColumn({
  id,
  isEmpty,
  children,
}: {
  id: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[220px] rounded-xl p-1.5 transition-all duration-200 ${
        isOver
          ? 'bg-primary-50 ring-2 ring-primary-300 ring-inset'
          : 'bg-neutral-100/90'
      }`}
    >
      {children}
      {isOver && isEmpty && (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-primary-300 bg-primary-50/50 p-6 text-xs font-semibold text-primary-700">
          Drop here
        </div>
      )}
    </div>
  );
}

function EmptyColumnPlaceholder({
  onCreate,
  hasActiveFilters,
}: {
  onCreate: () => void;
  hasActiveFilters: boolean;
}) {
  if (hasActiveFilters) {
    return (
      <div className="rounded-lg border border-dashed border-primary-200/70 bg-primary-50/40 px-3 py-6 text-center">
        <p className="text-[13px] font-medium text-neutral-800">No matching tasks</p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-600">
          Tasks may still exist in this column—they can be hidden by your filters. Clear filters to see the full board.
        </p>
        <Link
          href="/tasks"
          className="mt-3 inline-block cursor-pointer text-[12px] font-semibold text-primary-600 hover:text-primary-700"
        >
          Clear filters
        </Link>
        <Button variant="outline" size="xs" className="mt-4 w-full cursor-pointer" onClick={onCreate}>
          Create task
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-neutral-200/80 bg-white/60 px-3 py-6 text-center">
      <p className="text-[13px] font-medium text-neutral-700">No tasks here</p>
      <p className="mt-1 text-[11px] text-neutral-500">
        Drop a task here or create one.
      </p>
      <Button variant="outline" size="xs" className="mt-3 cursor-pointer" onClick={onCreate}>
        Create task
      </Button>
    </div>
  );
}

export function TaskBoard({ tasks, projectId, hasActiveFilters = false }: TaskBoardProps) {
  const updateTask = useUpdateTask();
  const toast = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailsTask, setDetailsTask] = useState<Task | null>(null);
  const [createInStatus, setCreateInStatus] = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.DONE]: [],
    };
    for (const task of tasks) {
      if (map[task.status]) {
        map[task.status].push(task);
      }
    }
    return map;
  }, [tasks]);

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const overId = over.id as string;
    let targetStatus: TaskStatus | undefined;

    if (COLUMNS.includes(overId as TaskStatus)) {
      targetStatus = overId as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) targetStatus = overTask.status;
    }

    if (!targetStatus || targetStatus === task.status) return;
    if (updateTask.isPending) return;

    updateTask.mutate(
      { id: taskId, payload: { status: targetStatus } },
      {
        onError: () => {
          toast.error({
            title: 'Could not update status',
            description: 'Check your connection and try again.',
          });
        },
      },
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-4 pb-4 md:flex-row md:gap-3 md:overflow-x-auto">
          {COLUMNS.map((status) => (
            <div key={status} className="w-full min-w-0 md:min-w-[280px] md:flex-1">
              <div className="mb-2 flex items-center justify-between px-2 py-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                  {formatTaskStatus(status)}
                </span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-200/90 px-1 text-[10px] font-bold text-neutral-600">
                  {grouped[status].length}
                </span>
              </div>

              <DroppableColumn id={status} isEmpty={grouped[status].length === 0}>
                <SortableContext
                  id={status}
                  items={grouped[status].map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1.5">
                    {grouped[status].length === 0 && (
                      <EmptyColumnPlaceholder
                        hasActiveFilters={hasActiveFilters}
                        onCreate={() => setCreateInStatus(status)}
                      />
                    )}
                    {grouped[status].map((task) => (
                      <TaskBoardCard
                        key={task.id}
                        task={task}
                        onOpenDetails={setDetailsTask}
                        onEdit={setEditingTask}
                      />
                    ))}
                  </div>
                </SortableContext>

                <button
                  type="button"
                  onClick={() => setCreateInStatus(status)}
                  className="mt-1.5 flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-neutral-500 transition-colors hover:bg-neutral-200/80 hover:text-neutral-800"
                >
                  <IconPlus className="h-4 w-4" />
                  Create
                </button>
              </DroppableColumn>
            </div>
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask && (
            <div className="w-[268px] rounded-lg border border-primary-300 bg-white px-3 py-2.5 shadow-lg ring-2 ring-primary-100">
              <p className="text-[13px] font-semibold text-neutral-900">{activeTask.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskDetailsDrawer
        task={detailsTask}
        isOpen={!!detailsTask}
        onClose={() => setDetailsTask(null)}
        onEdit={(t) => setEditingTask(t)}
      />

      <TaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        projectId={projectId || editingTask?.projectId}
        task={editingTask ?? undefined}
      />

      <TaskModal
        isOpen={!!createInStatus}
        onClose={() => setCreateInStatus(null)}
        projectId={projectId}
        defaultStatus={createInStatus ?? undefined}
      />
    </>
  );
}
