import type { OrganizationWithRole } from '@/types';

/**
 * Whether the user has a valid workspace selection for org-scoped API calls
 * (org list loaded, non-empty, current id matches a membership).
 */
export function computeOrgWorkspaceGate(
  orgs: OrganizationWithRole[] | undefined,
  orgsQuerySuccess: boolean,
  currentOrganizationId: string | null,
): boolean {
  return (
    orgsQuerySuccess &&
    !!orgs &&
    orgs.length > 0 &&
    !!currentOrganizationId &&
    orgs.some((o) => o.id === currentOrganizationId)
  );
}
