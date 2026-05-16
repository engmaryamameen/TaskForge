'use client';

import { useState } from 'react';
import {
  useOrganizations,
  useCurrentOrganization,
  useSwitchOrganization,
  useOrgMembers,
  useCurrentOrgRole,
  usePendingInvites,
  useResendInvite,
} from '@/features/organizations/hooks/useOrganizations';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { CreateOrgModal } from '@/features/organizations/components/create-org-modal';
import { InviteMemberModal } from '@/features/organizations/components/invite-member-modal';
import { OrganizationOverviewCard } from '@/features/organizations/components/organization-overview-card';
import { Role } from '@/types';
import { formatDate, formatRelative } from '@/lib/utils';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth.store';
import {
  IconPlus,
  IconGlobe,
  IconUserPlus,
  IconMail,
} from '@/components/icons';

export default function OrganizationsPage() {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { data: orgs, isLoading, isError, refetch } = useOrganizations();
  const { data: currentOrg } = useCurrentOrganization();
  const { data: members } = useOrgMembers();
  const { data: pendingInvites } = usePendingInvites();
  const { data: tasksData } = useTasks({ limit: 100 });
  const { data: projectsData } = useProjects({ limit: 100 });
  const switchOrg = useSwitchOrganization();
  const currentRole = useCurrentOrgRole();
  const resendInvite = useResendInvite();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const isAdmin = currentRole === Role.ADMIN;
  const memberCount = members?.length ?? 0;
  const pendingCount = pendingInvites?.length ?? 0;
  const taskCount = tasksData?.data?.length ?? 0;
  const projectCount =
    projectsData?.meta?.total ?? projectsData?.data?.length ?? 0;

  const soloWorkspace =
    !!members &&
    members.length === 1 &&
    members[0]?.userId === currentUserId &&
    pendingCount === 0;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Organizations
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Switch workspaces, invite teammates, and keep delivery organized.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} leftIcon={<IconPlus className="h-4 w-4" />}>
          New organization
        </Button>
      </div>

      {isLoading && <PageSkeleton variant="cards" />}

      {!isLoading && isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && orgs && orgs.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {orgs.map((org) => {
            const isCurrent = org.id === currentOrg?.id;
            return (
              <OrganizationOverviewCard
                key={org.id}
                org={org}
                isCurrent={isCurrent}
                onSwitch={() => switchOrg.mutate(org.id)}
                switchPending={switchOrg.isPending}
                memberCount={isCurrent ? memberCount : undefined}
                projectCount={isCurrent ? projectCount : undefined}
                taskCount={isCurrent ? taskCount : undefined}
              />
            );
          })}
        </div>
      )}

      {!isLoading && !isError && orgs?.length === 0 && (
        <EmptyState
          title="No organizations yet"
          description="Create your first organization to start collaborating with your team."
          icon={<IconGlobe className="h-6 w-6" />}
          action={{ label: 'Create organization', onClick: () => setShowCreateModal(true) }}
        />
      )}

      {currentOrg && (
        <div className="mt-12">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Team members</h2>
              <p className="mt-0.5 text-sm text-neutral-500">
                People with access to <span className="font-medium text-neutral-700">{currentOrg.name}</span>
                .{' '}
                {memberCount > 0 && (
                  <>
                    {memberCount} member{memberCount !== 1 ? 's' : ''}
                    {pendingCount > 0
                      ? ` · ${pendingCount} pending invitation${pendingCount !== 1 ? 's' : ''}`
                      : ''}
                  </>
                )}
              </p>
            </div>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInviteModal(true)}
                leftIcon={<IconUserPlus className="h-4 w-4" />}
              >
                Invite member
              </Button>
            )}
          </div>

          {soloWorkspace && (
            <div className="mb-6 rounded-2xl border border-primary-100 bg-primary-50/40 px-5 py-5">
              <p className="text-sm font-semibold text-primary-900">You&apos;re the only member here</p>
              <p className="mt-1 text-sm text-primary-700/90">
                Invite teammates to start collaborating on tasks and projects.
              </p>
              {isAdmin && (
                <Button
                  className="mt-4"
                  size="sm"
                  onClick={() => setShowInviteModal(true)}
                  leftIcon={<IconUserPlus className="h-4 w-4" />}
                >
                  Invite member
                </Button>
              )}
            </div>
          )}

          {memberCount === 0 && pendingCount === 0 ? (
            <p className="text-sm text-neutral-500">No members or pending invites yet.</p>
          ) : (
            <Card padding="none" className="overflow-hidden rounded-2xl border-neutral-200 shadow-xs">
              {pendingCount > 0 && (
                <div className="border-b border-neutral-100 bg-neutral-50/50 px-5 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Pending invitations
                  </p>
                </div>
              )}
              {pendingCount > 0 &&
                pendingInvites!.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex flex-col gap-3 border-b border-neutral-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning-50 text-warning-600 ring-1 ring-warning-200/60">
                        <IconMail className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-neutral-900">
                          {inv.email ?? 'Invitation pending'}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Sent {formatRelative(inv.createdAt)} · Expires {formatDate(inv.expiresAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                      <Badge variant="warning">Pending</Badge>
                      <Badge variant={inv.role === Role.ADMIN ? 'admin' : 'member'}>{inv.role}</Badge>
                      {isAdmin && inv.email && (
                        <Button
                          variant="secondary"
                          size="xs"
                          loading={
                            resendInvite.isPending && resendInvite.variables === inv.id
                          }
                          disabled={
                            resendInvite.isPending && resendInvite.variables === inv.id
                          }
                          onClick={() => resendInvite.mutate(inv.id)}
                          className="whitespace-nowrap"
                        >
                          Resend email
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

              {members && members.length > 0 && (
                <div className="border-b border-neutral-100 bg-neutral-50/50 px-5 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Members
                  </p>
                </div>
              )}

              {members &&
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col gap-3 border-b border-neutral-100 px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar
                        firstName={member.user?.firstName}
                        lastName={member.user?.lastName}
                        size="md"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-900">
                          {member.user
                            ? `${member.user.firstName} ${member.user.lastName}`
                            : member.userId}
                        </p>
                        {member.user && (
                          <p className="text-xs text-neutral-500">{member.user.email}</p>
                        )}
                        <p className="mt-0.5 text-[11px] text-neutral-400">
                          Joined {formatDate(member.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="neutral" className="font-normal capitalize">
                        {member.user?.status ?? 'active'}
                      </Badge>
                      <Badge variant={member.role === Role.ADMIN ? 'admin' : 'member'}>
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                ))}
            </Card>
          )}
        </div>
      )}

      <CreateOrgModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <InviteMemberModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </div>
  );
}
