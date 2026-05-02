'use client';

import { useAuthStore, type AuthState } from '@/store/auth.store';
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations';
import { computeOrgWorkspaceGate } from '@/features/organizations/lib/org-workspace-gate';

/**
 * Workspace/org context for the signed-in user (from org list + persisted current org id).
 * Use `hasValidOrgContext` to gate org-scoped React Query requests.
 */
export function useOrgWorkspaceContext() {
  const currentOrganizationId = useAuthStore((s: AuthState) => s.currentOrganizationId);
  const { data: orgs, isLoading, isError, isSuccess } = useOrganizations();

  const hasAnyOrganization = isSuccess && !!orgs && orgs.length > 0;
  const hasValidOrgContext = computeOrgWorkspaceGate(orgs, isSuccess, currentOrganizationId);

  return {
    orgsLoading: isLoading,
    orgsError: isError,
    orgs,
    orgsLoaded: isSuccess,
    hasAnyOrganization,
    hasValidOrgContext,
    currentOrganizationId,
  };
}
