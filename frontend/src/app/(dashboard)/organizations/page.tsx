'use client';

import { useState } from 'react';
import {
  useOrganizations,
  useCurrentOrganization,
  useSwitchOrganization,
  useOrgMembers,
  useCurrentOrgRole,
} from '@/features/organizations/hooks/useOrganizations';
import { CreateOrgModal } from '@/features/organizations/components/create-org-modal';
import { InviteMemberModal } from '@/features/organizations/components/invite-member-modal';
import { Role } from '@/types';
import { formatRelative } from '@/lib/utils';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { IconPlus, IconUsers, IconUserPlus, IconCheck, IconGlobe } from '@/components/icons';

export default function OrganizationsPage() {
  const { data: orgs, isLoading, isError, refetch } = useOrganizations();
  const { data: currentOrg } = useCurrentOrganization();
  const { data: members } = useOrgMembers();
  const switchOrg = useSwitchOrganization();
  const currentRole = useCurrentOrgRole();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const isAdmin = currentRole === Role.ADMIN;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Organizations</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage your workspaces and team members.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          leftIcon={<IconPlus className="h-4 w-4" />}
        >
          New Organization
        </Button>
      </div>

      {isLoading && <PageSkeleton variant="cards" />}

      {!isLoading && isError && <ErrorState onRetry={refetch} />}

      {/* Org list */}
      {!isLoading && !isError && orgs && orgs.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {orgs.map((org) => {
            const isCurrent = org.id === currentOrg?.id;
            return (
              <Card
                key={org.id}
                padding="md"
                className={`transition-all ${isCurrent ? 'ring-2 ring-primary-500 ring-offset-1' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${
                      isCurrent ? 'gradient-primary text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-neutral-900">{org.name}</h3>
                        <Badge variant={org.role === Role.ADMIN ? 'admin' : 'member'}>
                          {org.role}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {org.slug} &middot; {formatRelative(org.createdAt)}
                      </p>
                    </div>
                  </div>
                  {isCurrent ? (
                    <div className="flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-[11px] font-medium text-success-700 ring-1 ring-success-500/20">
                      <IconCheck className="h-3 w-3" />
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

      {/* Current org members */}
      {currentOrg && (
        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Team Members
              </h2>
              <p className="mt-0.5 text-sm text-neutral-500">
                {members?.length ?? 0} member{(members?.length ?? 0) !== 1 ? 's' : ''} in {currentOrg.name}
              </p>
            </div>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInviteModal(true)}
                leftIcon={<IconUserPlus className="h-4 w-4" />}
              >
                Invite Member
              </Button>
            )}
          </div>

          {members && members.length > 0 ? (
            <Card padding="none">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className={`flex items-center justify-between px-5 py-4 ${
                    index < members.length - 1 ? 'border-b border-neutral-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      firstName={member.user?.firstName}
                      lastName={member.user?.lastName}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {member.user
                          ? `${member.user.firstName} ${member.user.lastName}`
                          : member.userId}
                      </p>
                      {member.user && (
                        <p className="text-xs text-neutral-500">{member.user.email}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={member.role === Role.ADMIN ? 'admin' : 'member'}>
                    {member.role}
                  </Badge>
                </div>
              ))}
            </Card>
          ) : (
            <p className="text-sm text-neutral-500">No members found.</p>
          )}
        </div>
      )}

      <CreateOrgModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  );
}
