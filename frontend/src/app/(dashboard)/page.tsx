'use client';

import { useAuthStore } from '@/store/auth.store';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useActivity } from '@/features/activity/hooks/useActivity';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { formatRelative } from '@/lib/utils';

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
        <div className="h-8 w-64 rounded bg-gray-200 animate-pulse mb-6" />
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
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="text-sm font-medium text-gray-500">Projects</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {projectsData?.meta?.total ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="text-sm font-medium text-gray-500">Total Tasks</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {tasksData?.meta?.total ?? 0}
              </p>
            </div>
          </div>

          {activityData?.data && activityData.data.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
              <div className="rounded-lg bg-white shadow-sm">
                {activityData.data.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 border-b border-gray-100 px-5 py-4 last:border-0"
                  >
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                      {activity.entityType?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{activity.eventType}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{formatRelative(activity.createdAt)}</p>
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
