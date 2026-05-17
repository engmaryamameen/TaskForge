'use client';

import { useCallback } from 'react';
import { useCurrentOrgRole } from '@/features/organizations/hooks/useOrganizations';
import { hasPermission, Permission } from '@/lib/rbac';

export function usePermission() {
  const role = useCurrentOrgRole();

  const can = useCallback(
    (permission: Permission): boolean => hasPermission(role, permission),
    [role],
  );

  return { can, role };
}
