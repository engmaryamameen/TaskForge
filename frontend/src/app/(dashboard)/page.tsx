'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useOrgMembers } from '@/features/organizations/hooks/useOrganizations';
import { useActivity } from '@/features/activity/hooks/useActivity';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { formatRelative } from '@/lib/utils';
import {
  IconFolder,
  IconCheckSquare,
  IconUsers,
  IconTrendingUp,
  IconArrowRight,
  IconPlus,
  IconBolt,
  IconTarget,
} from '@/components/icons';
import type { Task } from '@/types';

function getActivityMessage(eventType: string): string {
  switch (eventType) {
    case 'task.created': return 'Created a new task';
    case 'task.updated': return 'Updated a task';
    case 'task.deleted': return 'Removed a task';
    case 'project.created': return 'Created a new project';
    case 'project.updated': return 'Updated a project';
    case 'project.deleted': return 'Removed a project';
    case 'member.invited': return 'Sent a team invitation';
    case 'member.joined': return 'Joined the organization';
    default: return eventType.replace('.', ' ');
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
  const { data: projectsData, isLoading: projectsLoading, isError: projectsError, refetch: refetchProjects } = useProjects();
  const { data: tasksData, isLoading: tasksLoading, isError: tasksError, refetch: refetchTasks } = useTasks({ limit: 100 });
  const { data: activityData } = useActivity({ limit: 8 });
  const { data: members } = useOrgMembers();

  const isLoading = projectsLoading || tasksLoading;
  const isError = projectsError || tasksError;

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError) return <ErrorState onRetry={() => { refetchProjects(); refetchTasks(); }} />;

  const totalProjects = projectsData?.meta?.total ?? 0;
  const totalTasks = tasksData?.meta?.total ?? 0;
  const totalMembers = members?.length ?? 0;
  const allTasks = tasksData?.data ?? [];

  const todoCount = allTasks.filter((t: Task) => t.status === 'todo').length;
  const inProgressCount = allTasks.filter((t: Task) => t.status === 'in_progress').length;
  const doneCount = allTasks.filter((t: Task) => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  const hasData = totalProjects > 0 || totalTasks > 0;

  return (
    <div>
      {/* Welcome banner */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-6 md:p-8">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-primary-400/10 blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.firstName}
            </h1>
            <p className="mt-1.5 text-sm text-white/60 max-w-lg">
              {hasData
                ? `You have ${inProgressCount} task${inProgressCount !== 1 ? 's' : ''} in progress and ${todoCount} waiting. Keep up the momentum.`
                : 'Welcome to TaskForge. Create your first project to get started.'
              }
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/projects">
              <Button variant="secondary" size="sm" leftIcon={<IconPlus className="h-3.5 w-3.5" />} className="!bg-white/15 !text-white !border-white/20 hover:!bg-white/25">
                New Project
              </Button>
            </Link>
            <Link href="/tasks">
              <Button variant="secondary" size="sm" leftIcon={<IconPlus className="h-3.5 w-3.5" />} className="!bg-white !text-primary-700 hover:!bg-white/90">
                New Task
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          title="Get started with TaskForge"
          description="Create your first project to start organizing and tracking your team's work."
          icon={<IconFolder className="h-6 w-6" />}
          action={{ label: 'Create a project', onClick: () => window.location.href = '/projects' }}
        />
      ) : (
        <>
          {/* Stats grid */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Projects', value: totalProjects, icon: <IconFolder className="h-5 w-5" />, bg: 'bg-primary-50', color: 'text-primary-600', ring: 'ring-primary-100' },
              { label: 'Total Tasks', value: totalTasks, icon: <IconCheckSquare className="h-5 w-5" />, bg: 'bg-purple-50', color: 'text-purple-600', ring: 'ring-purple-100' },
              { label: 'Team Members', value: totalMembers, icon: <IconUsers className="h-5 w-5" />, bg: 'bg-teal-50', color: 'text-teal-600', ring: 'ring-teal-500/10' },
              { label: 'Completed', value: `${completionRate}%`, icon: <IconTrendingUp className="h-5 w-5" />, bg: 'bg-success-50', color: 'text-success-600', ring: 'ring-success-500/10' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-medium">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{stat.label}</span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg} ring-1 ${stat.ring}`}>
                    <span className={stat.color}>{stat.icon}</span>
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight text-neutral-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Task breakdown */}
            <Card className="lg:col-span-5" padding="lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50">
                    <IconTarget className="h-4 w-4 text-primary-600" />
                  </div>
                  <CardTitle>Task Breakdown</CardTitle>
                </div>
                <Link href="/tasks">
                  <Button variant="ghost" size="xs" rightIcon={<IconArrowRight className="h-3 w-3" />}>
                    Board
                  </Button>
                </Link>
              </CardHeader>

              <div className="space-y-5">
                {[
                  { label: 'To Do', count: todoCount, variant: 'todo' as const, color: 'primary' as const },
                  { label: 'In Progress', count: inProgressCount, variant: 'in-progress' as const, color: 'warning' as const },
                  { label: 'Done', count: doneCount, variant: 'done' as const, color: 'success' as const },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={item.variant} dot>{item.label}</Badge>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-neutral-800">{item.count}</span>
                    </div>
                    <ProgressBar value={item.count} max={totalTasks || 1} color={item.color} />
                  </div>
                ))}
              </div>

              {/* Overall progress */}
              <div className="mt-6 rounded-xl bg-gradient-to-r from-neutral-50 to-neutral-100/50 p-4 ring-1 ring-neutral-200/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-600">Overall Completion</span>
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

            {/* Recent Activity */}
            <Card className="lg:col-span-4" padding="lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50">
                    <IconBolt className="h-4 w-4 text-purple-600" />
                  </div>
                  <CardTitle>Recent Activity</CardTitle>
                </div>
                <Link href="/activity">
                  <Button variant="ghost" size="xs" rightIcon={<IconArrowRight className="h-3 w-3" />}>
                    All
                  </Button>
                </Link>
              </CardHeader>

              {activityData?.data && activityData.data.length > 0 ? (
                <div className="-mx-1 space-y-0.5">
                  {activityData.data.map((activity) => {
                    const entityType = activity.entityType || activity.eventType?.split('.')[0] || 'default';
                    const icon = ENTITY_ICONS[entityType] || { bg: 'bg-neutral-100', text: 'text-neutral-600', letter: '?' };
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-neutral-50"
                      >
                        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${icon.bg} ${icon.text}`}>
                          {icon.letter}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] text-neutral-800 leading-snug">
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

            {/* Quick stats sidebar */}
            <div className="lg:col-span-3 space-y-4">
              {/* Priority distribution */}
              <Card padding="md">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">Priority Distribution</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Urgent', count: allTasks.filter((t: Task) => t.priority === 'urgent').length, variant: 'urgent' as const },
                    { label: 'High', count: allTasks.filter((t: Task) => t.priority === 'high').length, variant: 'high' as const },
                    { label: 'Medium', count: allTasks.filter((t: Task) => t.priority === 'medium').length, variant: 'medium' as const },
                    { label: 'Low', count: allTasks.filter((t: Task) => t.priority === 'low').length, variant: 'low' as const },
                  ].map((p) => (
                    <div key={p.label} className="flex items-center justify-between">
                      <Badge variant={p.variant}>{p.label}</Badge>
                      <span className="text-sm font-semibold tabular-nums text-neutral-700">{p.count}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Team summary */}
              <Card padding="md">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">Workspace</h3>
                <div className="space-y-3">
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
                <Link href="/organizations" className="mt-4 flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  Manage workspace <IconArrowRight className="h-3 w-3" />
                </Link>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
