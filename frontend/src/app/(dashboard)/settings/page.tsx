'use client';

import { useAuthStore } from '@/store/auth.store';
import { useCurrentOrganization } from '@/features/organizations/hooks/useOrganizations';
import { ErrorState } from '@/components/ui/error-state';
import { PageHero } from '@/components/ui/page-hero';
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
    <div className="mx-auto flex flex-col gap-6">
      <PageHero
        title="Settings"
        subtitle="Manage your profile, organization context, and security preferences."
      />

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
