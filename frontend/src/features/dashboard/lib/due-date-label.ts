/** Calendar-day comparison in local timezone */
function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Human due-date line for tasks — not relative-time (“just now”) semantics.
 */
export function formatDueDateLabel(iso: string): string {
  const due = startOfDay(new Date(iso));
  const today = startOfDay(new Date());
  const msPerDay = 86_400_000;
  const diffDays = Math.round((due.getTime() - today.getTime()) / msPerDay);

  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays < 0) {
    const n = Math.abs(diffDays);
    return `Overdue by ${n} day${n === 1 ? '' : 's'}`;
  }

  const yDue = due.getFullYear();
  const yNow = today.getFullYear();
  if (yDue === yNow) {
    return `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  return `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}
