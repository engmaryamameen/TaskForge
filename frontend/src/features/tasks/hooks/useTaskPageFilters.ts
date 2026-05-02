'use client';

import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import type { Task } from '@/types';
import { TaskStatus } from '@/types';
import type { TaskFilters } from '@/types';
import { parseISODateLocal } from '@/lib/utils/dates';

function matchesDueSoon(task: Task): boolean {
  if (task.status === TaskStatus.DONE || !task.dueDate) return false;
  const d = parseISODateLocal(task.dueDate);
  if (!d) return false;
  const end = new Date();
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);
  return d.getTime() <= end.getTime();
}

const STATUS_MAP: Record<string, TaskStatus> = {
  todo: TaskStatus.TODO,
  'in-progress': TaskStatus.IN_PROGRESS,
  done: TaskStatus.DONE,
};

export function useTaskPageFilters() {
  const searchParams = useSearchParams();
  const userId = useAuthStore((s) => s.user?.id);

  const statusParam = searchParams.get('status');
  const assigneeParam = searchParams.get('assignee');
  const dueParam = searchParams.get('due');

  const apiFilters: TaskFilters = useMemo(() => {
    const f: TaskFilters = { limit: 100 };
    if (statusParam && STATUS_MAP[statusParam]) {
      f.status = STATUS_MAP[statusParam];
    }
    if (assigneeParam === 'me' && userId) {
      f.assignedTo = userId;
    }
    return f;
  }, [statusParam, assigneeParam, userId]);

  const applyDueSoon = dueParam === 'soon';

  const pageTitle = useMemo(() => {
    if (applyDueSoon) return 'Due soon';
    if (assigneeParam === 'me') return 'My tasks';
    if (statusParam === 'todo') return 'To Do';
    if (statusParam === 'in-progress') return 'In progress';
    if (statusParam === 'done') return 'Done';
    return 'Task board';
  }, [applyDueSoon, assigneeParam, statusParam]);

  const pageSubtitle = useMemo(() => {
    if (applyDueSoon) {
      return 'Tasks with a due date in the next 7 days (including overdue).';
    }
    if (assigneeParam === 'me') {
      return 'Everything assigned to you in this workspace.';
    }
    if (statusParam && STATUS_MAP[statusParam]) {
      return 'Filtered by status — drag cards to update or create tasks in any column.';
    }
    return 'Drag and drop tasks between columns to update their status.';
  }, [applyDueSoon, assigneeParam, statusParam]);

  const filterTasksForView = useCallback(
    (taskList: Task[] | undefined): Task[] => {
      if (!taskList) return [];
      if (!applyDueSoon) return taskList;
      return taskList.filter(matchesDueSoon);
    },
    [applyDueSoon],
  );

  return {
    apiFilters,
    applyDueSoon,
    pageTitle,
    pageSubtitle,
    filterTasksForView,
    hasActiveFilters: !!(statusParam || assigneeParam || dueParam),
  };
}
