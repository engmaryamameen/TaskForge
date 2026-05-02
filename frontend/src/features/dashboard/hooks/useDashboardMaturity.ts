'use client';

/**
 * Workspace dashboard maturity for progressive UX (projects/tasks presence).
 */
export type DashboardMaturity = 'no_projects' | 'projects_no_tasks' | 'active';

export function getDashboardMaturity(totalProjects: number, totalTasks: number): DashboardMaturity {
  if (totalProjects === 0) return 'no_projects';
  if (totalTasks === 0) return 'projects_no_tasks';
  return 'active';
}
