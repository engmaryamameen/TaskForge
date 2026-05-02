'use client';

import type { Task } from '@/types';
import { shouldUseStatusDonut } from '@/features/dashboard/lib/chart-data';
import { TaskCompositionDonut } from './task-composition-donut';
import { StatusHorizontalBars } from './status-horizontal-bars';

interface StatusDistributionCardProps {
  tasks: Task[];
  empty: React.ReactNode;
}

export function StatusDistributionCard({ tasks, empty }: StatusDistributionCardProps) {
  const total = tasks.length;
  const useDonut = shouldUseStatusDonut(total);

  if (total === 0) {
    return <>{empty}</>;
  }

  return (
    <div className="px-4 pb-5 pt-2">
      {useDonut ? (
        <TaskCompositionDonut tasks={tasks} height={220} />
      ) : (
        <StatusHorizontalBars tasks={tasks} />
      )}
    </div>
  );
}
