'use client';

import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Task } from '@/types';
import { buildStatusDistribution } from '@/features/dashboard/lib/chart-data';

/** Aligned with Status mix: blue / amber / emerald */
const KEY_COLORS: Record<string, string> = {
  todo: '#2563eb',
  in_progress: '#f59e0b',
  done: '#059669',
};

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) {
  if (!active || !payload?.[0]) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-neutral-200/90 bg-white px-3 py-2 text-xs shadow-lg">
      <span className="font-medium text-neutral-800">{p.name}</span>
      <span className="ml-2 tabular-nums text-neutral-600">{p.value}</span>
    </div>
  );
}

interface TaskCompositionDonutProps {
  tasks: Task[];
  height?: number;
}

export function TaskCompositionDonut({ tasks, height = 220 }: TaskCompositionDonutProps) {
  const data = useMemo(() => {
    const rows = buildStatusDistribution(tasks).filter((d) => d.value > 0);
    return rows.length ? rows : [{ name: 'No data', value: 1, key: 'empty' as const }];
  }, [tasks]);

  const total = tasks.length;

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="62%"
            outerRadius="88%"
            paddingAngle={total === 0 ? 0 : 2}
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.key ?? i}
                fill={
                  total === 0 || entry.key === 'empty'
                    ? '#E2E8F0'
                    : KEY_COLORS[String(entry.key)] ?? '#64748b'
                }
              />
            ))}
          </Pie>
          <Tooltip content={<DonutTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="text-2xl font-bold tabular-nums tracking-tight text-neutral-900">{total}</span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Tasks</span>
      </div>
    </div>
  );
}
