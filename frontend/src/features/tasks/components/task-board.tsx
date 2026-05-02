'use client';

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
import type { Task } from '@/types';
import { TaskStatus } from '@/types';
import { formatTaskStatus } from '@/lib/utils';
import { IconPlus } from '@/components/icons';

interface TaskBoardProps {
  tasks: Task[];
  projectId?: string;
}

const COLUMNS: TaskStatus[] = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

/** Droppable column wrapper — ensures empty columns accept drops */
function DroppableColumn({ id, isEmpty, children }: { id: string; isEmpty: boolean; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] rounded-lg p-1.5 transition-all duration-200 ${
        isOver
          ? 'bg-primary-50 ring-2 ring-primary-300 ring-inset'
          : 'bg-neutral-100'
      }`}
    >
      {children}
      {isOver && isEmpty && (
        <div className="flex items-center justify-center rounded-md border-2 border-dashed border-primary-300 bg-primary-50/50 p-6 text-xs font-medium text-primary-600">
          Drop it here
        </div>
      )}
    </div>
  );
}

export function TaskBoard({ tasks, projectId }: TaskBoardProps) {
  const updateTask = useUpdateTask();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [createInStatus, setCreateInStatus] = useState<TaskStatus | null>(null);

  // Require 8px movement before drag starts — prevents click/drag conflict
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

    // Check if dropped on a column droppable
    if (COLUMNS.includes(overId as TaskStatus)) {
      targetStatus = overId as TaskStatus;
    } else {
      // Dropped on another card — find its column
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) targetStatus = overTask.status;
    }

    if (!targetStatus || targetStatus === task.status) return;
    if (updateTask.isPending) return;

    updateTask.mutate({ id: taskId, payload: { status: targetStatus } });
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4">
          {COLUMNS.map((status) => (
            <div key={status} className="min-w-[280px] flex-1">
              {/* Column header */}
              <div className="mb-2 flex items-center justify-between px-2 py-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                  {formatTaskStatus(status)}
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-600">
                  {grouped[status].length}
                </span>
              </div>

              {/* Droppable column body */}
              <DroppableColumn id={status} isEmpty={grouped[status].length === 0}>
                <SortableContext
                  id={status}
                  items={grouped[status].map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1.5">
                    {grouped[status].map((task) => (
                      <TaskBoardCard
                        key={task.id}
                        task={task}
                        onEdit={setEditingTask}
                      />
                    ))}
                  </div>
                </SortableContext>

                {/* + Create button */}
                <button
                  onClick={() => setCreateInStatus(status)}
                  className="mt-1.5 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 transition-colors"
                >
                  <IconPlus className="h-4 w-4" />
                  Create
                </button>
              </DroppableColumn>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="w-[280px] rounded-md border border-primary-300 bg-white px-3 py-2.5 shadow-medium ring-2 ring-primary-100">
              <p className="text-[13px] font-medium text-neutral-900">{activeTask.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

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
