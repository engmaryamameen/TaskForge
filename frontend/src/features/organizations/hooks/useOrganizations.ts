'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  organizationsApi,
  type CreateOrganizationPayload,
  type CreateInvitePayload,
} from '@/lib/api/organizations.api';
import { useAuthStore } from '@/store/auth.store';
import { computeOrgWorkspaceGate } from '@/features/organizations/lib/org-workspace-gate';
import { leaveOrgRoom, joinOrgRoom } from '@/lib/socket';
import type { OrganizationWithRole, Membership, Role, PendingInvite } from '@/types';

export const orgKeys = {
  all: ['organizations'] as const,
  current: ['organizations', 'current'] as const,
  members: ['organizations', 'members'] as const,
  invites: ['organizations', 'invites'] as const,
};

export function useOrganizations() {
  return useQuery({
    queryKey: orgKeys.all,
    queryFn: () => organizationsApi.list().then((r) => r.data.data! as OrganizationWithRole[]),
  });
}

export function useCurrentOrganization() {
  return useQuery({
    queryKey: orgKeys.current,
    queryFn: () => organizationsApi.getCurrent().then((r) => r.data.data!),
  });
}

export function useOrgMembers() {
  const currentOrganizationId = useAuthStore((s) => s.currentOrganizationId);
  const { data: orgs, isSuccess } = useOrganizations();
  const gate = computeOrgWorkspaceGate(orgs, isSuccess, currentOrganizationId);

  return useQuery({
    queryKey: orgKeys.members,
    queryFn: () => organizationsApi.getMembers().then((r) => r.data.data! as Membership[]),
    enabled: gate,
  });
}

export function usePendingInvites() {
  const currentOrganizationId = useAuthStore((s) => s.currentOrganizationId);
  const { data: orgs, isSuccess } = useOrganizations();
  const gate = computeOrgWorkspaceGate(orgs, isSuccess, currentOrganizationId);

  return useQuery({
    queryKey: orgKeys.invites,
    queryFn: () =>
      organizationsApi.listPendingInvites().then((r) => r.data.data! as PendingInvite[]),
    enabled: gate,
  });
}

export function useCurrentOrgRole(): Role | null {
  const currentOrganizationId = useAuthStore((s) => s.currentOrganizationId);
  const { data: orgs } = useOrganizations();

  if (!orgs || !currentOrganizationId) return null;
  const current = orgs.find((o) => o.id === currentOrganizationId);
  return current?.role ?? null;
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

      queryClient.invalidateQueries({ queryKey: orgKeys.current });
      queryClient.invalidateQueries({ queryKey: orgKeys.members });
      queryClient.invalidateQueries({ queryKey: orgKeys.invites });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInvitePayload) =>
      organizationsApi.createInvite(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.invites });
      queryClient.invalidateQueries({ queryKey: orgKeys.members });
    },
  });
}

export function useResendInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => organizationsApi.resendInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.invites });
    },
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => organizationsApi.acceptInvite(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.all });
      queryClient.invalidateQueries({ queryKey: orgKeys.current });
      queryClient.invalidateQueries({ queryKey: orgKeys.members });
      queryClient.invalidateQueries({ queryKey: orgKeys.invites });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}
