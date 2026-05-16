'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Task } from '@/types';
import { buildTaskTrendData } from '@/features/dashboard/lib/chart-data';
import { CHART_COLORS } from '@/features/dashboard/lib/chart-colors';

const PRIMARY = CHART_COLORS.primary;
const PRIMARY_SOFT = CHART_COLORS.primarySoft;
const GRID = CHART_COLORS.grid;

interface TasksTrendChartProps {
  tasks: Task[];
  height?: number;
}

export function TasksTrendChart({ tasks, height = 280 }: TasksTrendChartProps) {
  const data = useMemo(() => buildTaskTrendData(tasks, 14), [tasks]);

  return (
    <div style={{ height }} className="w-full min-h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 2, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="fillCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.22} />
              <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PRIMARY_SOFT} stopOpacity={0.35} />
              <stop offset="100%" stopColor={PRIMARY_SOFT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: CHART_COLORS.axisLabel }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={28}
            padding={{ left: 0, right: 0 }}
            height={36}
          />
          <YAxis
            tick={{ fontSize: 11, fill: CHART_COLORS.axisLabel }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={36}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-lg border border-neutral-200/90 bg-white px-3 py-2 text-xs shadow-lg">
                  <p className="mb-1.5 font-medium text-neutral-700">{label}</p>
                  <ul className="space-y-0.5">
                    {payload.map((p) => (
                      <li
                        key={String(p.dataKey)}
                        className="flex items-center gap-2 tabular-nums text-neutral-600"
                      >
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        <span>
                          {p.name}:{' '}
                          <span className="font-semibold text-neutral-900">{p.value as number}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="created"
            name="Created"
            stroke={PRIMARY}
            strokeWidth={2}
            fill="url(#fillCreated)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: PRIMARY }}
          />
          <Area
            type="monotone"
            dataKey="completed"
            name="Completed"
            stroke={PRIMARY_SOFT}
            strokeWidth={2}
            strokeDasharray="6 4"
            fill="url(#fillCompleted)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: PRIMARY_SOFT }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
