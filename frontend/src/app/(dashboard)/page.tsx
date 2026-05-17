'use client';

import { useMemo } from 'react';
import { useDashboardModals } from '@/components/layout/dashboard-modals-context';
import { useAuthStore } from '@/store/auth.store';
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations';
import { useOrgWorkspaceContext } from '@/features/organizations/hooks/useOrgWorkspaceContext';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useOrgMembers, usePendingInvites } from '@/features/organizations/hooks/useOrganizations';
import { useActivity } from '@/features/activity/hooks/useActivity';
import { TasksTrendChart } from '@/features/dashboard/components/tasks-trend-chart';
import {
  EmptyChartPlaceholder,
  NoOrganizationState,
  WorkspaceSelectionPrompt,
  DashboardHeader,
  DashboardEmptyState,
  DashboardKpiRow,
  StatusDistributionCard,
  WorkflowSummaryCard,
  PriorityMixCard,
  RecentActivityCard,
  WorkspaceHealthCard,
  UpcomingWorkCard,
  UpcomingDeadlinesCard,
} from '@/features/dashboard/components';
import { getDashboardMaturity } from '@/features/dashboard/hooks/useDashboardMaturity';
import { shouldUseTrendLowDataPlaceholder } from '@/features/dashboard/lib/chart-data';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import type { Task } from '@/types';
import { IconActivity, IconCheckSquare } from '@/components/icons';

export default function DashboardPage() {
  const { openTaskModal, openProjectModal, openInviteModal } = useDashboardModals();
  const user = useAuthStore((s) => s.user);
  const {
    isLoading: orgsLoading,
    isError: orgsError,
    refetch: refetchOrgs,
  } = useOrganizations();

  const { hasAnyOrganization, hasValidOrgContext } = useOrgWorkspaceContext();

  const {
    data: projectsData,
    isLoading: projectsLoading,
    isError: projectsError,
    refetch: refetchProjects,
  } = useProjects();

  const {
    data: tasksData,
    isLoading: tasksLoading,
    isError: tasksError,
    refetch: refetchTasks,
  } = useTasks({
    limit: 100,
  });

  const { data: activityData } = useActivity({ limit: 10 });
  const { data: members, isLoading: membersLoading } = useOrgMembers();
  const { data: pendingInvites, isLoading: invitesLoading } = usePendingInvites();

  const totalProjects = projectsData?.meta?.total ?? 0;
  const totalTasks = tasksData?.meta?.total ?? 0;
  const totalMembers = members?.length ?? 0;
  const pendingInviteCount = pendingInvites?.length ?? 0;
  const allTasks = useMemo(() => tasksData?.data ?? [], [tasksData?.data]);

  const todoCount = useMemo(() => allTasks.filter((t: Task) => t.status === 'todo').length, [allTasks]);
  const inProgressCount = useMemo(
    () => allTasks.filter((t: Task) => t.status === 'in_progress').length,
    [allTasks],
  );
  const doneCount = useMemo(() => allTasks.filter((t: Task) => t.status === 'done').length, [allTasks]);
  const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;
  const activeTaskCount = todoCount + inProgressCount;

  const maturity = getDashboardMaturity(totalProjects, totalTasks);
  const trendLowData = totalTasks > 0 && shouldUseTrendLowDataPlaceholder(allTasks);

  const activityItems = activityData?.data ?? [];
  const firstName = user?.firstName || 'there';

  /* ── Loading / Error / Pre-org gates ── */

  if (orgsLoading) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (orgsError) {
    return <ErrorState onRetry={() => refetchOrgs()} />;
  }

  if (!hasAnyOrganization) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          actionsDisabled
          onNewProject={openProjectModal}
          onNewTask={openTaskModal}
          onInvite={openInviteModal}
        />
        <NoOrganizationState />
      </div>
    );
  }

  if (!hasValidOrgContext) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          actionsDisabled
          onNewProject={openProjectModal}
          onNewTask={openTaskModal}
          onInvite={openInviteModal}
        />
        <WorkspaceSelectionPrompt />
      </div>
    );
  }

  const dataLoading = projectsLoading || tasksLoading || membersLoading || invitesLoading;
  const dataError = projectsError || tasksError;

  if (dataLoading) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (dataError) {
    return <ErrorState onRetry={() => { refetchProjects(); refetchTasks(); }} />;
  }

  /* ── Empty / onboarding state ── */

  if (maturity !== 'active') {
    return (
      <div className="space-y-6">
        <DashboardEmptyState
          firstName={firstName}
          totalProjects={totalProjects}
          totalTasks={totalTasks}
          totalMembers={totalMembers}
          onCreateProject={openProjectModal}
          onCreateTask={openTaskModal}
          onInvite={openInviteModal}
        />
      </div>
    );
  }

  /* ── Active dashboard ── */

  const taskFlowBody =
    trendLowData ? (
      <EmptyChartPlaceholder
        compact
        title="Not enough task history yet"
        description="Create and complete a few tasks on different days to see your trend."
        icon={<IconActivity className="h-6 w-6" />}
        minHeight={240}
      />
    ) : (
      <TasksTrendChart tasks={allTasks} height={340} />
    );

  const statusBody = (
    <StatusDistributionCard
      tasks={allTasks}
      empty={
        <EmptyChartPlaceholder
          compact
          title="No status mix yet"
          description="Once you add tasks, we'll show how work spreads across columns."
          icon={<IconCheckSquare className="h-6 w-6" />}
        />
      }
    />
  );

  return (
    <div className="space-y-6">
      <DashboardHeader
        onNewProject={openProjectModal}
        onNewTask={openTaskModal}
        onInvite={openInviteModal}
      />

      <DashboardKpiRow
        totalProjects={totalProjects}
        totalTasks={totalTasks}
        inProgressCount={inProgressCount}
        completionRate={completionRate}
        doneCount={doneCount}
      />

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="flex flex-col gap-1 border-b border-neutral-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Task flow</h2>
                <p className="text-sm text-neutral-500">Tasks created vs completed over time</p>
              </div>
              <span className="text-xs font-medium text-neutral-400">Last 14 days</span>
            </div>
            <div className="px-3 pb-1 pt-3">{taskFlowBody}</div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-neutral-100 px-5 py-3 text-xs text-neutral-500">
              <span className="flex items-center gap-2">
                <span className="h-0.5 w-6 rounded-full bg-primary-600" />
                Created
              </span>
              <span className="flex items-center gap-2">
                <span className="h-0.5 w-6 rounded-full border border-dashed border-primary-300 bg-primary-300" />
                Completed
              </span>
            </div>
          </div>
        </div>

        <div className="min-w-0 xl:col-span-4">
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="border-b border-neutral-100 px-5 py-4">
              <h2 className="text-base font-semibold text-neutral-900">Status mix</h2>
              <p className="text-sm text-neutral-500">Share of tasks by column</p>
            </div>
            {statusBody}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <WorkflowSummaryCard
            todoCount={todoCount}
            inProgressCount={inProgressCount}
            doneCount={doneCount}
            totalTasks={totalTasks}
            completionRate={completionRate}
          />
        </div>
        <div className="min-w-0 lg:col-span-5">
          <RecentActivityCard
            activities={activityItems}
            members={members}
            currentUserId={user?.id}
            onCreateTask={openTaskModal}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PriorityMixCard tasks={allTasks} />
        <WorkspaceHealthCard
          totalMembers={totalMembers}
          totalProjects={totalProjects}
          activeTasks={activeTaskCount}
          completionRate={completionRate}
          pendingInviteCount={pendingInviteCount}
        />
        <UpcomingDeadlinesCard tasks={allTasks} />
        <UpcomingWorkCard tasks={allTasks} currentUserId={user?.id} />
      </section>
    </div>
  );
}
