'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  organizationsApi,
  type CreateOrganizationPayload,
  type CreateInvitePayload,
} from '@/lib/api/organizations.api';
import { useAuthStore } from '@/store/auth.store';
import { leaveOrgRoom, joinOrgRoom } from '@/lib/socket';

export const orgKeys = {
  all: ['organizations'] as const,
  current: ['organizations', 'current'] as const,
  members: ['organizations', 'members'] as const,
};

export function useOrganizations() {
  return useQuery({
    queryKey: orgKeys.all,
    queryFn: () => organizationsApi.list().then((r) => r.data.data!),
  });
}

export function useCurrentOrganization() {
  return useQuery({
    queryKey: orgKeys.current,
    queryFn: () => organizationsApi.getCurrent().then((r) => r.data.data!),
  });
}

export function useOrgMembers() {
  return useQuery({
    queryKey: orgKeys.members,
    queryFn: () => organizationsApi.getMembers().then((r) => r.data.data!),
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrganizationPayload) =>
      organizationsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.all });
    },
  });
}

export function useSwitchOrganization() {
  const queryClient = useQueryClient();
  const { currentOrganizationId, setCurrentOrganization } = useAuthStore();

  return useMutation({
    mutationFn: (orgId: string) => organizationsApi.switchOrg(orgId),
    onSuccess: (_, orgId) => {
      if (currentOrganizationId) {
        leaveOrgRoom(currentOrganizationId);
      }
      setCurrentOrganization(orgId);
      joinOrgRoom(orgId);

      // Invalidate all org-scoped queries
      queryClient.invalidateQueries({ queryKey: orgKeys.current });
      queryClient.invalidateQueries({ queryKey: orgKeys.members });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

export function useCreateInvite() {
  return useMutation({
    mutationFn: (payload: CreateInvitePayload) =>
      organizationsApi.createInvite(payload),
  });
}
