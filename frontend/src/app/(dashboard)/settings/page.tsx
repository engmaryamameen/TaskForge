'use client';

import { useAuthStore } from '@/store/auth.store';
import { useCurrentOrganization } from '@/features/organizations/hooks/useOrganizations';
import { ErrorState } from '@/components/ui/error-state';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { Card, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IconMail, IconGlobe, IconUsers } from '@/components/icons';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: org, isLoading, isError, refetch } = useCurrentOrganization();

  if (isLoading) return <PageSkeleton variant="detail" />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">Manage your profile and workspace settings.</p>
      </div>

      <div className="space-y-6">
        {/* Profile section */}
        <Card padding="lg">
          <CardTitle className="mb-5">Profile Information</CardTitle>
          <div className="flex items-start gap-5">
            <Avatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              size="xl"
            />
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-neutral-400">First Name</label>
                  <p className="mt-1 text-sm font-medium text-neutral-900">{user?.firstName}</p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-neutral-400">Last Name</label>
                  <p className="mt-1 text-sm font-medium text-neutral-900">{user?.lastName}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-neutral-400">Email Address</label>
                <div className="mt-1 flex items-center gap-2">
                  <IconMail className="h-4 w-4 text-neutral-400" />
                  <p className="text-sm font-medium text-neutral-900">{user?.email}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-neutral-400">Status</label>
                <div className="mt-1">
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Organization section */}
        {org && (
          <Card padding="lg">
            <CardTitle className="mb-5">Workspace</CardTitle>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-base font-bold text-white">
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-base font-semibold text-neutral-900">{org.name}</p>
                  <p className="text-sm text-neutral-500">Workspace settings and information</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg bg-neutral-50 p-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-xs">
                    <IconGlobe className="h-4 w-4 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Slug</p>
                    <p className="text-sm font-medium text-neutral-800">{org.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-xs">
                    <IconUsers className="h-4 w-4 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Organization ID</p>
                    <p className="text-sm font-medium text-neutral-800 font-mono">{org.id?.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
