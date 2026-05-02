import { formatDate, isOverdue, parseISODateLocal } from '@/lib/utils/dates';
import { TaskStatus } from '@/types';

/**
 * Rich due label for task cards: overdue, today, tomorrow, or calendar date.
 */
export function getTaskDueLabel(
  dueDateIso: string | null,
  status: TaskStatus,
): string | null {
  if (!dueDateIso) return null;

  const d = parseISODateLocal(dueDateIso);
  if (!d) return formatDate(dueDateIso);

  if (status !== TaskStatus.DONE && isOverdue(dueDateIso)) {
    return 'Overdue';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(d);
  dueDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (dueDay.getTime() - today.getTime()) / 86_400_000,
  );

  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  return formatDate(dueDateIso);
}
