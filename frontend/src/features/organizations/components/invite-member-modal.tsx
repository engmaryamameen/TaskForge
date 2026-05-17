'use client';

import { useState } from 'react';
import { useCreateInvite, useCurrentOrgRole } from '@/features/organizations/hooks/useOrganizations';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleSelect } from '@/components/ui/role-select';
import { Permission } from '@/lib/rbac';
import { Role, ApiError } from '@/types';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getInviteErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'ALREADY_MEMBER':
        return 'This user is already a member of the organization.';
      case 'INSUFFICIENT_ROLE':
        return 'You do not have permission to invite with this role.';
      case 'PLAN_LIMIT_EXCEEDED':
        return 'Your plan has reached the member limit.';
      case 'INVITE_ALREADY_USED':
        return error.message;
      case 'VALIDATION_ERROR':
        return error.message;
    }
  }
  return error.message || 'Failed to send invitation. Please try again.';
}

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>(Role.MEMBER);
  const [customPermissions, setCustomPermissions] = useState<Permission[]>([]);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const createInvite = useCreateInvite();
  const currentRole = useCurrentOrgRole();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    const res = await createInvite.mutateAsync({
      email: trimmed,
      role: role as Role,
    });

    setSentTo(trimmed);
    setEmailSent(res.data.data?.emailSent ?? false);
  }

  function handleClose() {
    setEmail('');
    setRole(Role.MEMBER);
    setCustomPermissions([]);
    setSentTo(null);
    setEmailSent(null);
    createInvite.reset();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite member">
      {createInvite.error && !sentTo && (
        <div className="mb-4 rounded-lg border border-danger-100 bg-danger-50 p-3 text-sm text-danger-700">
          {getInviteErrorMessage(createInvite.error)}
        </div>
      )}

      {sentTo ? (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-neutral-600">
            {emailSent ? (
              <>
                We sent an invitation email to <strong className="text-neutral-900">{sentTo}</strong>. They can
                accept from their inbox to join this organization.
              </>
            ) : (
              <>
                We couldn&apos;t send email to <strong className="text-neutral-900">{sentTo}</strong> right now.
                Check SMTP settings on the server. The invitation is still pending.
              </>
            )}
          </p>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Done</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="invite-email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@company.com"
          />

          <RoleSelect
            value={role}
            onChange={setRole}
            customPermissions={customPermissions}
            onCustomPermissionsChange={setCustomPermissions}
            actorRole={currentRole ?? 'member'}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={createInvite.isPending} disabled={!email.trim()}>
              Send invitation
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
