'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Task } from '@/types';
import { buildStatusDistribution } from '@/features/dashboard/lib/chart-data';
import { STATUS_COLORS, CHART_COLORS } from '@/features/dashboard/lib/chart-colors';

function BarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number } }>;
}) {
  if (!active || !payload?.[0]) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="rounded-lg border border-neutral-200/90 bg-white px-3 py-2 text-xs shadow-lg">
      <span className="font-medium text-neutral-800">{name}</span>
      <span className="ml-2 tabular-nums text-neutral-600">{value} tasks</span>
    </div>
  );
}

interface TaskStatusBarChartProps {
  tasks: Task[];
  height?: number;
}

export function TaskStatusBarChart({ tasks, height = 220 }: TaskStatusBarChartProps) {
  const data = useMemo(() => buildStatusDistribution(tasks), [tasks]);

  return (
    <div style={{ height }} className="w-full min-h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barCategoryGap="24%">
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: CHART_COLORS.axisLabelDark }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: CHART_COLORS.axisLabel }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={32}
          />
          <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(13, 95, 217, 0.06)' }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
            {data.map((row) => (
              <Cell key={row.key} fill={STATUS_COLORS[row.key] ?? CHART_COLORS.fallback} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
