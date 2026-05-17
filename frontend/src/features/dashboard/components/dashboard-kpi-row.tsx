'use client';

import { IconFolder, IconCheckSquare, IconTrendingUp, IconTarget } from '@/components/icons';
import { DashboardKpiCard } from './dashboard-kpi-card';

interface DashboardKpiRowProps {
  totalProjects: number;
  totalTasks: number;
  inProgressCount: number;
  completionRate: number;
  doneCount: number;
}

export function DashboardKpiRow({
  totalProjects,
  totalTasks,
  inProgressCount,
  completionRate,
  doneCount,
}: DashboardKpiRowProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardKpiCard
        label="Projects"
        value={totalProjects}
        hint="In organization"
        icon={<IconFolder className="h-5 w-5" />}
        accentColor="bg-primary-500"
        iconBgClass="bg-primary-50"
        iconColorClass="text-primary-600"
      />
      <DashboardKpiCard
        label="Total tasks"
        value={totalTasks}
        hint={`${inProgressCount} in progress`}
        icon={<IconCheckSquare className="h-5 w-5" />}
        accentColor="bg-info-500"
        iconBgClass="bg-info-50"
        iconColorClass="text-info-600"
      />
      <DashboardKpiCard
        label="In progress"
        value={inProgressCount}
        hint="Active tasks"
        icon={<IconTrendingUp className="h-5 w-5" />}
        accentColor="bg-warning-500"
        iconBgClass="bg-amber-50"
        iconColorClass="text-amber-700"
      />
      <DashboardKpiCard
        label="Completion"
        value={`${completionRate}%`}
        hint={`${doneCount} of ${totalTasks} done`}
        icon={<IconTarget className="h-5 w-5" />}
        accentColor="bg-success-500"
        iconBgClass="bg-emerald-50"
        iconColorClass="text-emerald-600"
      />
    </section>
  );
}
