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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Organizations</h1>
        <Button onClick={() => setShowCreateModal(true)}>Create Organization</Button>
      </div>

      {/* Org list */}
      {isLoading && <PageSkeleton variant="cards" />}

      {!isLoading && isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && orgs && (
        <div className="space-y-3">
          {orgs.map((org) => {
            const isCurrent = org.id === currentOrg?.id;
            return (
              <div
                key={org.id}
                className={`flex items-center justify-between rounded-lg bg-white p-5 shadow-soft ${
                  isCurrent ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-neutral-900">{org.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      org.role === Role.ADMIN
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {org.role}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {org.slug} &middot; Created {formatRelative(org.createdAt)}
                  </p>
                </div>
                {isCurrent ? (
                  <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                    Current
                  </span>
                ) : (
                  <button
                    onClick={() => switchOrg.mutate(org.id)}
                    disabled={switchOrg.isPending}
                    className="rounded bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 disabled:opacity-50"
                  >
                    Switch
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !isError && orgs?.length === 0 && (
        <EmptyState
          title="No organizations yet"
          description="Create your first organization to start collaborating."
          action={{ label: 'Create your first organization', onClick: () => setShowCreateModal(true) }}
        />
      )}


      {/* Current org members */}
      {currentOrg && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">
              Members &mdash; {currentOrg.name}
            </h2>
            {isAdmin && (
              <Button size="sm" onClick={() => setShowInviteModal(true)}>Invite Member</Button>
            )}
          </div>

          {members && members.length > 0 ? (
            <div className="rounded-lg bg-white shadow-soft">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 last:border-0"
                >
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
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    member.role === Role.ADMIN
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No members found.</p>
          )}
        </div>
      )}

      {/* Modals */}
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
