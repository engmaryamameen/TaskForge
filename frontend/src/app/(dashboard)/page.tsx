'use client';

import { useAuthStore } from '@/store/auth.store';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useActivity } from '@/features/activity/hooks/useActivity';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { formatRelative } from '@/lib/utils';
import { IconFolder, IconCheckSquare } from '@/components/icons';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: projectsData, isLoading: projectsLoading, isError: projectsError, refetch: refetchProjects } = useProjects();
  const { data: tasksData, isLoading: tasksLoading, isError: tasksError, refetch: refetchTasks } = useTasks({ limit: 5 });
  const { data: activityData } = useActivity({ limit: 5 });

  const isLoading = projectsLoading || tasksLoading;
  const isError = projectsError || tasksError;

  if (isLoading) {
    return (
      <div>
        <div className="h-7 w-48 rounded bg-neutral-200 animate-pulse mb-6" />
        <PageSkeleton variant="cards" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => { refetchProjects(); refetchTasks(); }} />;
  }

  const hasProjects = (projectsData?.meta?.total ?? 0) > 0;
  const hasTasks = tasksData?.data && tasksData.data.length > 0;

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-neutral-900">
        Welcome back, {user?.firstName}
      </h1>

      {!hasProjects && !hasTasks ? (
        <EmptyState
          title="No activity yet"
          description="Create your first project to start organizing your work."
          action={{ label: 'Go to Projects', onClick: () => window.location.href = '/projects' }}
        />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                <IconFolder className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Projects</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {projectsData?.meta?.total ?? 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50">
                <IconCheckSquare className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Total Tasks</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {tasksData?.meta?.total ?? 0}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {activityData?.data && activityData.data.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-neutral-800">Recent Activity</h2>
              <div className="rounded-xl border border-neutral-200 bg-white">
                {activityData.data.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 border-b border-neutral-100 px-4 py-3 last:border-0"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">
                      {activity.entityType?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-neutral-800">{activity.eventType}</p>
                      <p className="mt-0.5 text-xs text-neutral-400">{formatRelative(activity.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
