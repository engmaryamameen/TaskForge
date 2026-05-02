import type { Task } from '@/types';

export type TrendPoint = {
  label: string;
  created: number;
  completed: number;
};

/** Last N calendar days of task created / completed counts for charts */
export function buildTaskTrendData(tasks: Task[], days = 14): TrendPoint[] {
  const result: TrendPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    let created = 0;
    let completed = 0;
    for (const t of tasks) {
      if (t.createdAt.slice(0, 10) === iso) created += 1;
      if (t.status === 'done' && t.updatedAt.slice(0, 10) === iso) completed += 1;
    }
    result.push({ label, created, completed });
  }
  return result;
}

export type StatusSlice = { name: string; value: number; key: string };

export function buildStatusDistribution(tasks: Task[]): StatusSlice[] {
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const done = tasks.filter((t) => t.status === 'done').length;
  return [
    { name: 'To do', value: todo, key: 'todo' },
    { name: 'In progress', value: inProgress, key: 'in_progress' },
    { name: 'Done', value: done, key: 'done' },
  ];
}

export type PrioritySlice = { name: string; value: number };

export function buildPriorityDistribution(tasks: Task[]): PrioritySlice[] {
  return ['urgent', 'high', 'medium', 'low'].map((p) => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    value: tasks.filter((t) => t.priority === p).length,
  }));
}
