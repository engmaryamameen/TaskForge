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
  projectId: string;
}

const COLUMNS: TaskStatus[] = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

function columnHeaderColor(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.TODO: return 'bg-gray-100 text-gray-700';
    case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
    case TaskStatus.DONE: return 'bg-green-100 text-green-700';
  }
}

export function TaskBoard({ tasks, projectId }: TaskBoardProps) {
  const updateTask = useUpdateTask();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

    // Determine target column from drop target
    const overId = over.id as string;
    let targetStatus: TaskStatus | undefined;

    // Check if dropped on a column
    if (COLUMNS.includes(overId as TaskStatus)) {
      targetStatus = overId as TaskStatus;
    } else {
      // Dropped on another card — find its column
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) targetStatus = overTask.status;
    }

    if (!targetStatus || targetStatus === task.status) return;
    if (updateTask.isPending) return; // Disable drag during pending mutation

    updateTask.mutate({ id: taskId, payload: { status: targetStatus } });
  }

  return (
    <>
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 gap-4">
          {COLUMNS.map((status) => (
            <div key={status} className="min-h-[200px]">
              <div className={`mb-3 flex items-center justify-between rounded-lg px-3 py-2 ${columnHeaderColor(status)}`}>
                <span className="text-sm font-semibold">{formatTaskStatus(status)}</span>
                <span className="text-xs font-medium">{grouped[status].length}</span>
              </div>

              <SortableContext
                id={status}
                items={grouped[status].map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {grouped[status].map((task) => (
                    <TaskBoardCard
                      key={task.id}
                      task={task}
                      onEdit={setEditingTask}
                    />
                  ))}
                  {grouped[status].length === 0 && (
                    <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
                      No tasks
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rounded-lg border border-blue-300 bg-white p-3 shadow-lg opacity-90">
              <p className="text-sm font-medium text-gray-900">{activeTask.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        projectId={projectId}
        task={editingTask ?? undefined}
      />
    </>
  );
}
