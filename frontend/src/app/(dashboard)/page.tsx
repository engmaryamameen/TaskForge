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
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { formatRelative, formatTaskStatus } from '@/lib/utils';
import {
  IconFolder,
  IconCheckSquare,
  IconUsers,
  IconTrendingUp,
  IconArrowRight,
  IconPlus,
} from '@/components/icons';
import type { Task } from '@/types';

function getActivityMessage(eventType: string): string {
  switch (eventType) {
    case 'task.created': return 'created a task';
    case 'task.updated': return 'updated a task';
    case 'task.deleted': return 'deleted a task';
    case 'project.created': return 'created a project';
    case 'project.updated': return 'updated a project';
    case 'project.deleted': return 'deleted a project';
    case 'member.invited': return 'invited a member';
    case 'member.joined': return 'joined the organization';
    default: return eventType.replace('.', ' ');
  }
}

const ENTITY_COLORS: Record<string, string> = {
  task: 'bg-primary-100 text-primary-700',
  project: 'bg-purple-100 text-purple-700',
  member: 'bg-success-100 text-success-700',
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: projectsData, isLoading: projectsLoading, isError: projectsError, refetch: refetchProjects } = useProjects();
  const { data: tasksData, isLoading: tasksLoading, isError: tasksError, refetch: refetchTasks } = useTasks({ limit: 100 });
  const { data: activityData } = useActivity({ limit: 8 });
  const { data: members } = useOrgMembers();

  const isLoading = projectsLoading || tasksLoading;
  const isError = projectsError || tasksError;

  if (isLoading) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (isError) {
    return <ErrorState onRetry={() => { refetchProjects(); refetchTasks(); }} />;
  }

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
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Welcome back, {user?.firstName}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Here&apos;s what&apos;s happening across your workspace today.
        </p>
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
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Projects"
              value={totalProjects}
              icon={<IconFolder className="h-4.5 w-4.5" />}
              iconBg="bg-primary-50"
              iconColor="text-primary-600"
            />
            <StatCard
              label="Total Tasks"
              value={totalTasks}
              icon={<IconCheckSquare className="h-4.5 w-4.5" />}
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
            />
            <StatCard
              label="Team Members"
              value={totalMembers}
              icon={<IconUsers className="h-4.5 w-4.5" />}
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
            />
            <StatCard
              label="Completion Rate"
              value={`${completionRate}%`}
              icon={<IconTrendingUp className="h-4.5 w-4.5" />}
              iconBg="bg-success-50"
              iconColor="text-success-600"
            />
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
            {/* Task breakdown */}
            <Card className="lg:col-span-4" padding="lg">
              <CardHeader>
                <CardTitle>Task Overview</CardTitle>
                <Link href="/tasks">
                  <Button variant="ghost" size="xs" rightIcon={<IconArrowRight className="h-3.5 w-3.5" />}>
                    View board
                  </Button>
                </Link>
              </CardHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="todo" dot>To Do</Badge>
                    <span className="text-sm font-semibold text-neutral-800">{todoCount}</span>
                  </div>
                  <span className="text-xs text-neutral-400">{totalTasks > 0 ? Math.round((todoCount / totalTasks) * 100) : 0}%</span>
                </div>
                <ProgressBar value={todoCount} max={totalTasks || 1} color="primary" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="in-progress" dot>In Progress</Badge>
                    <span className="text-sm font-semibold text-neutral-800">{inProgressCount}</span>
                  </div>
                  <span className="text-xs text-neutral-400">{totalTasks > 0 ? Math.round((inProgressCount / totalTasks) * 100) : 0}%</span>
                </div>
                <ProgressBar value={inProgressCount} max={totalTasks || 1} color="warning" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="done" dot>Done</Badge>
                    <span className="text-sm font-semibold text-neutral-800">{doneCount}</span>
                  </div>
                  <span className="text-xs text-neutral-400">{completionRate}%</span>
                </div>
                <ProgressBar value={doneCount} max={totalTasks || 1} color="success" />
              </div>

              {/* Completion summary */}
              <div className="mt-6 rounded-lg bg-neutral-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Overall progress</span>
                  <span className="text-sm font-semibold text-neutral-900">{completionRate}%</span>
                </div>
                <ProgressBar value={completionRate} max={100} size="md" color={completionRate >= 75 ? 'success' : completionRate >= 40 ? 'warning' : 'primary'} showLabel={false} className="mt-2" />
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="lg:col-span-3" padding="lg">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <Link href="/activity">
                  <Button variant="ghost" size="xs" rightIcon={<IconArrowRight className="h-3.5 w-3.5" />}>
                    View all
                  </Button>
                </Link>
              </CardHeader>

              {activityData?.data && activityData.data.length > 0 ? (
                <div className="space-y-1">
                  {activityData.data.map((activity) => {
                    const entityType = activity.entityType || activity.eventType?.split('.')[0] || 'default';
                    const colorClass = ENTITY_COLORS[entityType] || 'bg-neutral-100 text-neutral-600';
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-neutral-50"
                      >
                        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${colorClass}`}>
                          {entityType.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-neutral-800 leading-snug">
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
                <div className="flex flex-col items-center py-8 text-center">
                  <p className="text-sm text-neutral-500">No recent activity</p>
                  <p className="mt-0.5 text-xs text-neutral-400">Activity will appear as your team works</p>
                </div>
              )}
            </Card>
          </div>

          {/* Quick actions */}
          <div className="mt-6">
            <Card padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">Quick Actions</h3>
                  <p className="mt-0.5 text-xs text-neutral-500">Jump into common workflows</p>
                </div>
                <div className="flex gap-2">
                  <Link href="/projects">
                    <Button variant="outline" size="sm" leftIcon={<IconPlus className="h-3.5 w-3.5" />}>
                      New Project
                    </Button>
                  </Link>
                  <Link href="/tasks">
                    <Button variant="primary" size="sm" leftIcon={<IconPlus className="h-3.5 w-3.5" />}>
                      New Task
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
