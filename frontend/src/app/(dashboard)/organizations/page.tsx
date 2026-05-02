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
import { CreateOrgModal } from '@/features/organizations/components/create-org-modal';
import { InviteMemberModal } from '@/features/organizations/components/invite-member-modal';
import { Role } from '@/types';
import { formatDate, formatRelative } from '@/lib/utils';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { IconPlus, IconGlobe, IconUserPlus, IconCheck, IconMail } from '@/components/icons';

export default function OrganizationsPage() {
  const { data: orgs, isLoading, isError, refetch } = useOrganizations();
  const { data: currentOrg } = useCurrentOrganization();
  const { data: members } = useOrgMembers();
  const { data: pendingInvites } = usePendingInvites();
  const switchOrg = useSwitchOrganization();
  const currentRole = useCurrentOrgRole();
  const resendInvite = useResendInvite();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const isAdmin = currentRole === Role.ADMIN;
  const memberCount = members?.length ?? 0;
  const pendingCount = pendingInvites?.length ?? 0;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Organizations</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage your workspaces and team members.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} leftIcon={<IconPlus className="h-4 w-4" />}>
          New Organization
        </Button>
      </div>

      {isLoading && <PageSkeleton variant="cards" />}

      {!isLoading && isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && orgs && orgs.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {orgs.map((org) => {
            const isCurrent = org.id === currentOrg?.id;
            return (
              <Card
                key={org.id}
                padding="md"
                className={`transition-all ${
                  isCurrent
                    ? 'border border-primary-200/90 bg-primary-50/15'
                    : 'border border-neutral-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                        isCurrent
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`text-sm font-semibold ${
                            isCurrent ? 'text-primary-700' : 'text-neutral-900'
                          }`}
                        >
                          {org.name}
                        </h3>
                        <Badge variant={org.role === Role.ADMIN ? 'admin' : 'member'}>{org.role}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {org.slug} &middot; {formatRelative(org.createdAt)}
                      </p>
                    </div>
                  </div>
                  {isCurrent ? (
                    <div className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-primary-600">
                      <IconCheck className="h-3.5 w-3.5" />
                      Active
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => switchOrg.mutate(org.id)}
                      disabled={switchOrg.isPending}
                    >
                      Switch
                    </Button>
                  )}
                </div>
              </Card>
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
        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Team Members</h2>
              <p className="mt-0.5 text-sm text-neutral-500">
                {memberCount} member{memberCount !== 1 ? 's' : ''}
                {pendingCount > 0
                  ? ` · ${pendingCount} pending invitation${pendingCount !== 1 ? 's' : ''}`
                  : ''}{' '}
                in {currentOrg.name}
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

          {memberCount === 0 && pendingCount === 0 ? (
            <p className="text-sm text-neutral-500">No members or pending invites yet.</p>
          ) : (
            <Card padding="none" className="divide-y divide-neutral-100">
              {pendingCount > 0 &&
                pendingInvites!.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning-50 text-warning-600 ring-1 ring-warning-200/60">
                        <IconMail className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-neutral-900">
                          {inv.email ?? 'Invitation (no email on file)'}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Invited {formatRelative(inv.createdAt)} &middot; Expires {formatDate(inv.expiresAt)}
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

              {members &&
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-3 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar
                        firstName={member.user?.firstName}
                        lastName={member.user?.lastName}
                        size="md"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900">
                          {member.user
                            ? `${member.user.firstName} ${member.user.lastName}`
                            : member.userId}
                        </p>
                        {member.user && <p className="text-xs text-neutral-500">{member.user.email}</p>}
                      </div>
                    </div>
                    <Badge variant={member.role === Role.ADMIN ? 'admin' : 'member'}>{member.role}</Badge>
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
