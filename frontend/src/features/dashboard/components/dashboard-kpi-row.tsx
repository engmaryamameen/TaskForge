'use client';

import { IconFolder, IconCheckSquare, IconTrendingUp, IconTarget } from '@/components/icons';
import { DashboardKpiCard } from './dashboard-kpi-card';

interface KpiConfig {
  label: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: { label: string; positive?: boolean };
}

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
  const hasData = totalTasks > 0;

  const cards: KpiConfig[] = [
    {
      label: 'Projects',
      value: totalProjects,
      subtitle: hasData ? 'In organization' : 'Awaiting data',
      icon: <IconFolder className="h-5 w-5" />,
      iconBg: 'bg-primary-50',
      iconColor: 'text-primary-600',
      trend: totalProjects > 0 ? { label: `${totalProjects} active`, positive: true } : undefined,
    },
    {
      label: 'Total tasks',
      value: totalTasks,
      subtitle: hasData ? `${inProgressCount} in progress` : 'Awaiting data',
      icon: <IconCheckSquare className="h-5 w-5" />,
      iconBg: 'bg-info-50',
      iconColor: 'text-info-600',
    },
    {
      label: 'In progress',
      value: inProgressCount,
      subtitle: hasData ? 'Active tasks' : 'Awaiting data',
      icon: <IconTrendingUp className="h-5 w-5" />,
      iconBg: 'bg-warning-50',
      iconColor: 'text-warning-600',
    },
    {
      label: 'Completion',
      value: `${completionRate}%`,
      subtitle: hasData ? `${doneCount} of ${totalTasks} done` : 'Awaiting data',
      icon: <IconTarget className="h-5 w-5" />,
      iconBg: 'bg-success-50',
      iconColor: 'text-success-600',
      trend: hasData ? { label: `${completionRate}%`, positive: completionRate > 0 } : undefined,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <DashboardKpiCard
          key={card.label}
          label={card.label}
          value={card.value}
          subtitle={card.subtitle}
          icon={card.icon}
          iconBg={card.iconBg}
          iconColor={card.iconColor}
          trend={card.trend}
        />
      ))}
    </section>
  );
}
