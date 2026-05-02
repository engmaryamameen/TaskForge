'use client';

import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { IconTarget, IconArrowRight } from '@/components/icons';

interface WorkflowSummaryCardProps {
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  totalTasks: number;
  completionRate: number;
}

export function WorkflowSummaryCard({
  todoCount,
  inProgressCount,
  doneCount,
  totalTasks,
  completionRate,
}: WorkflowSummaryCardProps) {
  const denom = totalTasks || 1;

  return (
    <Card className="h-full" padding="lg" hover>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-50 ring-1 ring-neutral-200/80">
            <IconTarget className="h-4 w-4 text-neutral-600" />
          </div>
          <div>
            <CardTitle>Workflow health</CardTitle>
            <CardDescription>Track where work is currently sitting.</CardDescription>
          </div>
        </div>
        <Link href="/tasks">
          <Button variant="ghost" size="xs" rightIcon={<IconArrowRight className="h-3 w-3" />}>
            Open board
          </Button>
        </Link>
      </CardHeader>

      <div className="space-y-5">
        {[
          { label: 'To do', count: todoCount, variant: 'todo' as const, color: 'primary' as const },
          {
            label: 'In progress',
            count: inProgressCount,
            variant: 'in-progress' as const,
            color: 'warning' as const,
          },
          { label: 'Done', count: doneCount, variant: 'done' as const, color: 'success' as const },
        ].map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <Badge variant={item.variant} dot>
                {item.label}
              </Badge>
              <span className="text-sm font-semibold tabular-nums text-neutral-800">{item.count}</span>
            </div>
            <ProgressBar value={item.count} max={denom} color={item.color} />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-600">Overall completion</span>
          <span className="text-lg font-bold tabular-nums text-neutral-900">{completionRate}%</span>
        </div>
        <ProgressBar
          value={completionRate}
          max={100}
          size="md"
          color={completionRate >= 75 ? 'success' : completionRate >= 40 ? 'warning' : 'primary'}
        />
      </div>
    </Card>
  );
}
