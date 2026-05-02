'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useOrgMembers, usePendingInvites } from '@/features/organizations/hooks/useOrganizations';
import { useActivity } from '@/features/activity/hooks/useActivity';
import { TasksTrendChart } from '@/features/dashboard/components/tasks-trend-chart';
import { TaskStatusBarChart } from '@/features/dashboard/components/task-status-bar-chart';
import { TaskCompositionDonut } from '@/features/dashboard/components/task-composition-donut';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { formatRelative } from '@/lib/utils';
import {
  IconFolder,
  IconCheckSquare,
  IconUsers,
  IconArrowRight,
  IconPlus,
  IconBolt,
  IconTarget,
} from '@/components/icons';
import type { Task } from '@/types';

function getActivityMessage(eventType: string): string {
  switch (eventType) {
    case 'task.created':
      return 'Created a new task';
    case 'task.updated':
      return 'Updated a task';
    case 'task.deleted':
      return 'Removed a task';
    case 'project.created':
      return 'Created a new project';
    case 'project.updated':
      return 'Updated a project';
    case 'project.deleted':
      return 'Removed a project';
    case 'member.invited':
      return 'Sent a team invitation';
    case 'member.joined':
      return 'Joined the organization';
    default:
      return eventType.replace('.', ' ');
  }
}

const ENTITY_ICONS: Record<string, { bg: string; text: string; letter: string }> = {
  task: { bg: 'bg-primary-100', text: 'text-primary-700', letter: 'T' },
  project: { bg: 'bg-purple-100', text: 'text-purple-700', letter: 'P' },
  member: { bg: 'bg-success-100', text: 'text-success-700', letter: 'M' },
  invite: { bg: 'bg-warning-100', text: 'text-warning-700', letter: 'I' },
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: projectsData, isLoading: projectsLoading, isError: projectsError, refetch: refetchProjects } =
    useProjects();
  const { data: tasksData, isLoading: tasksLoading, isError: tasksError, refetch: refetchTasks } = useTasks({
    limit: 100,
  });
  const { data: activityData } = useActivity({ limit: 10 });
  const { data: members } = useOrgMembers();
  const { data: pendingInvites } = usePendingInvites();

  const isLoading = projectsLoading || tasksLoading;
  const isError = projectsError || tasksError;

  const totalProjects = projectsData?.meta?.total ?? 0;
  const totalTasks = tasksData?.meta?.total ?? 0;
  const totalMembers = members?.length ?? 0;
  const pendingInviteCount = pendingInvites?.length ?? 0;
  const teamHeadcount = totalMembers + pendingInviteCount;
  const allTasks = tasksData?.data ?? [];

  const todoCount = useMemo(() => allTasks.filter((t: Task) => t.status === 'todo').length, [allTasks]);
  const inProgressCount = useMemo(
    () => allTasks.filter((t: Task) => t.status === 'in_progress').length,
    [allTasks],
  );
  const doneCount = useMemo(() => allTasks.filter((t: Task) => t.status === 'done').length, [allTasks]);
  const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  const hasData = totalProjects > 0 || totalTasks > 0;

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError) {
    return <ErrorState onRetry={() => { refetchProjects(); refetchTasks(); }} />;
  }

  return (
    <div className="space-y-8">
      {/* Page intro — light surface, pro dashboard style */}
      <header className="rounded-2xl border border-neutral-200/90 bg-white px-6 py-7 shadow-xs sm:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-600">Overview</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">Dashboard</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">
              {user?.firstName
                ? `Hi ${user.firstName} — here’s what’s moving in your workspace.`
                : 'Track tasks, flow, and team activity in one place.'}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href="/projects">
              <Button variant="secondary" size="md" leftIcon={<IconPlus className="h-4 w-4" />}>
                New project
              </Button>
            </Link>
            <Link href="/tasks">
              <Button size="md" leftIcon={<IconPlus className="h-4 w-4" />}>
                New task
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {!hasData ? (
        <EmptyState
          title="Get started with TaskForge"
          description="Create your first project to start organizing and tracking your team's work."
          icon={<IconFolder className="h-6 w-6" />}
          action={{ label: 'Create a project', onClick: () => (window.location.href = '/projects') }}
        />
      ) : (
        <>
          {/* KPI strip — status-style rows like pro analytics templates */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: 'Projects',
                value: totalProjects,
                hint: 'In workspace',
                icon: <IconFolder className="h-5 w-5" />,
                accent: 'ring-primary-100',
                iconBg: 'bg-primary-50',
                iconColor: 'text-primary-600',
              },
              {
                label: 'Total tasks',
                value: totalTasks,
                hint: `${inProgressCount} in progress`,
                icon: <IconCheckSquare className="h-5 w-5" />,
                accent: 'ring-blue-100',
                iconBg: 'bg-[#EFF6FF]',
                iconColor: 'text-[#2563EB]',
              },
              {
                label: 'Team',
                value: teamHeadcount,
                hint:
                  pendingInviteCount > 0
                    ? `${totalMembers} joined · ${pendingInviteCount} invite${pendingInviteCount !== 1 ? 's' : ''} pending`
                    : `${totalMembers} member${totalMembers !== 1 ? 's' : ''}`,
                icon: <IconUsers className="h-5 w-5" />,
                accent: 'ring-cyan-100',
                iconBg: 'bg-teal-50',
                iconColor: 'text-teal-600',
              },
              {
                label: 'Completion',
                value: `${completionRate}%`,
                hint: `${doneCount} of ${totalTasks} done`,
                icon: <IconTarget className="h-5 w-5" />,
                accent: 'ring-emerald-100',
                iconBg: 'bg-emerald-50',
                iconColor: 'text-emerald-600',
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs transition-shadow hover:shadow-medium"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{kpi.label}</p>
                    <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-neutral-900">{kpi.value}</p>
                    <p className="mt-1 text-[13px] text-neutral-500">{kpi.hint}</p>
                  </div>
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${kpi.iconBg} ring-1 ${kpi.accent}`}
                  >
                    <span className={kpi.iconColor}>{kpi.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Charts row — high-density analytics */}
          <section className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <div className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-xs">
                <div className="flex flex-col gap-1 border-b border-neutral-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-neutral-900">Task flow</h2>
                    <p className="text-sm text-neutral-500">Tasks created vs completed over time</p>
                  </div>
                  <span className="text-xs font-medium text-neutral-400">Last 14 days</span>
                </div>
                <div className="px-4 pb-2 pt-4">
                  <TasksTrendChart tasks={allTasks} height={300} />
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-neutral-100 px-6 py-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-2">
                    <span className="h-0.5 w-6 rounded-full bg-primary-600" />
                    Created
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-0.5 w-6 rounded-full border border-dashed border-[#93C5FD] bg-[#93C5FD]" />
                    Completed
                  </span>
                </div>
              </div>
            </div>

            <div className="xl:col-span-4">
              <div className="h-full overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-xs">
                <div className="border-b border-neutral-100 px-6 py-5">
                  <h2 className="text-base font-semibold text-neutral-900">Status mix</h2>
                  <p className="text-sm text-neutral-500">Share of tasks by column</p>
                </div>
                <div className="p-4 pb-6">
                  <TaskCompositionDonut tasks={allTasks} height={240} />
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-xs">
                <div className="flex flex-col gap-1 border-b border-neutral-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-neutral-900">Pipeline</h2>
                    <p className="text-sm text-neutral-500">Count by workflow stage</p>
                  </div>
                  <Link href="/tasks" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                    Open board →
                  </Link>
                </div>
                <div className="px-2 pb-6 pt-4">
                  <TaskStatusBarChart tasks={allTasks} height={260} />
                </div>
              </div>
            </div>

            <Card className="lg:col-span-4" padding="lg" hover>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
                    <IconTarget className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <CardTitle>Workflow</CardTitle>
                    <CardDescription>To do · In progress · Done</CardDescription>
                  </div>
                </div>
                <Link href="/tasks">
                  <Button variant="ghost" size="xs" rightIcon={<IconArrowRight className="h-3 w-3" />}>
                    Tasks
                  </Button>
                </Link>
              </CardHeader>

              <div className="space-y-5">
                {[
                  { label: 'To do', count: todoCount, variant: 'todo' as const, color: 'primary' as const },
                  { label: 'In progress', count: inProgressCount, variant: 'in-progress' as const, color: 'warning' as const },
                  { label: 'Done', count: doneCount, variant: 'done' as const, color: 'success' as const },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant={item.variant} dot>
                        {item.label}
                      </Badge>
                      <span className="text-sm font-semibold tabular-nums text-neutral-800">{item.count}</span>
                    </div>
                    <ProgressBar value={item.count} max={totalTasks || 1} color={item.color} />
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

            <Card className="lg:col-span-3" padding="lg" hover>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
                    <IconBolt className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <CardTitle>Activity</CardTitle>
                    <CardDescription>Latest updates</CardDescription>
                  </div>
                </div>
                <Link href="/activity">
                  <Button variant="ghost" size="xs" rightIcon={<IconArrowRight className="h-3 w-3" />}>
                    All
                  </Button>
                </Link>
              </CardHeader>

              {activityData?.data && activityData.data.length > 0 ? (
                <div className="-mx-1 max-h-[320px] space-y-0.5 overflow-y-auto pr-1">
                  {activityData.data.map((activity) => {
                    const entityType = activity.entityType || activity.eventType?.split('.')[0] || 'default';
                    const icon = ENTITY_ICONS[entityType] || {
                      bg: 'bg-neutral-100',
                      text: 'text-neutral-600',
                      letter: '?',
                    };
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-neutral-50"
                      >
                        <div
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${icon.bg} ${icon.text}`}
                        >
                          {icon.letter}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] leading-snug text-neutral-800">
                            {getActivityMessage(activity.eventType)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-neutral-400">
                            {formatRelative(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
                    <IconBolt className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-neutral-600">No activity yet</p>
                  <p className="mt-1 text-xs text-neutral-400">Actions will show up here</p>
                </div>
              )}
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card padding="lg" hover>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Priority mix</h3>
              <div className="mt-4 space-y-3">
                {(['urgent', 'high', 'medium', 'low'] as const).map((p) => (
                  <div key={p} className="flex items-center justify-between">
                    <Badge variant={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</Badge>
                    <span className="text-sm font-semibold tabular-nums text-neutral-700">
                      {allTasks.filter((t: Task) => t.priority === p).length}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card padding="lg" hover>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Workspace</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Members</span>
                  <span className="font-semibold text-neutral-800">{totalMembers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Projects</span>
                  <span className="font-semibold text-neutral-800">{totalProjects}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Active tasks</span>
                  <span className="font-semibold text-neutral-800">{todoCount + inProgressCount}</span>
                </div>
              </div>
              <Link
                href="/organizations"
                className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
              >
                Manage workspace <IconArrowRight className="h-3 w-3" />
              </Link>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
