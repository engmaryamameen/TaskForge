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
  accent: string;
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
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-500',
      accent: 'bg-primary-500',
      trend: totalProjects > 0 ? { label: `${totalProjects} active`, positive: true } : undefined,
    },
    {
      label: 'Total tasks',
      value: totalTasks,
      subtitle: hasData ? `${inProgressCount} in progress` : 'Awaiting data',
      icon: <IconCheckSquare className="h-5 w-5" />,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-500',
      accent: 'bg-purple-500',
    },
    {
      label: 'In progress',
      value: inProgressCount,
      subtitle: hasData ? 'Active tasks' : 'Awaiting data',
      icon: <IconTrendingUp className="h-5 w-5" />,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-500',
      accent: 'bg-orange-500',
    },
    {
      label: 'Completion',
      value: `${completionRate}%`,
      subtitle: hasData ? `${doneCount} of ${totalTasks} done` : 'Awaiting data',
      icon: <IconTarget className="h-5 w-5" />,
      iconBg: 'bg-success-100',
      iconColor: 'text-success-500',
      accent: 'bg-success-500',
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
          accent={card.accent}
          trend={card.trend}
        />
      ))}
    </section>
  );
}
