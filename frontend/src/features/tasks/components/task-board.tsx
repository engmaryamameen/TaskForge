'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
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

interface TaskBoardProps {
  tasks: Task[];
  projectId?: string;
}

const COLUMNS: TaskStatus[] = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

export function TaskBoard({ tasks, projectId }: TaskBoardProps) {
  const updateTask = useUpdateTask();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [createInStatus, setCreateInStatus] = useState<TaskStatus | null>(null);

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

    updateTask.mutate({ id: taskId, payload: { status: targetStatus } });
  }

  return (
    <>
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4">
          {COLUMNS.map((status) => (
            <div key={status} className="min-w-[280px] flex-1">
              {/* Column header — Jira style */}
              <div className="mb-2 flex items-center justify-between px-2 py-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  {formatTaskStatus(status)}
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600">
                  {grouped[status].length}
                </span>
              </div>

              {/* Column body */}
              <div className="min-h-[200px] rounded-lg bg-gray-100 p-1.5">
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

                {/* + Create button at bottom of every column (Jira pattern) */}
                <button
                  onClick={() => setCreateInStatus(status)}
                  className="mt-1.5 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create
                </button>
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rounded-md border border-primary-300 bg-white p-3 shadow-medium">
              <p className="text-sm font-medium text-gray-900">{activeTask.title}</p>
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
