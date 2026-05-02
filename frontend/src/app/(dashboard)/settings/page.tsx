'use client';

import { useAuthStore } from '@/store/auth.store';
import { useCurrentOrganization } from '@/features/organizations/hooks/useOrganizations';
import { ErrorState } from '@/components/ui/error-state';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { ProfileSettingsForm } from '@/features/settings/components/profile-settings-form';
import { WorkspaceSettingsCard } from '@/features/settings/components/workspace-settings-card';
import { SecuritySettingsCard } from '@/features/settings/components/security-settings-card';
import { useCurrentOrgRole } from '@/features/organizations/hooks/useOrganizations';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: org, isLoading, isError, refetch } = useCurrentOrganization();
  const currentRole = useCurrentOrgRole();

  if (isLoading) return <PageSkeleton variant="detail" />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your profile, workspace context, and security preferences.
        </p>
      </header>

      {user && <ProfileSettingsForm />}

      {org && (
        <WorkspaceSettingsCard
          organization={org}
          currentRole={currentRole}
          isActiveWorkspace
        />
      )}

      {user && <SecuritySettingsCard user={user} />}
    </div>
  );
}
