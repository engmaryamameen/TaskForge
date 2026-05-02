'use client';

import { useState } from 'react';
import { useCreateInvite } from '@/features/organizations/hooks/useOrganizations';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
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
        return 'You need admin access to invite members.';
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
  const [role, setRole] = useState<Role>(Role.MEMBER);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const createInvite = useCreateInvite();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    const res = await createInvite.mutateAsync({
      email: trimmed,
      role,
    });

    setSentTo(trimmed);
    setEmailSent(res.data.data?.emailSent ?? false);
  }

  function handleClose() {
    setEmail('');
    setRole(Role.MEMBER);
    setSentTo(null);
    setEmailSent(null);
    createInvite.reset();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite member">
      {createInvite.error && !sentTo && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {getInviteErrorMessage(createInvite.error)}
        </div>
      )}

      {sentTo ? (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-neutral-600">
            {emailSent ? (
              <>
                We sent an invitation email to <strong className="text-neutral-900">{sentTo}</strong>. They can
                accept from their inbox to join this workspace.
              </>
            ) : (
              <>
                We couldn&apos;t send email to <strong className="text-neutral-900">{sentTo}</strong> right now.
                Check SMTP settings on the server. The invitation is still pending—you can see it in Team Members.
              </>
            )}
          </p>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Done</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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
            <p className="mt-1 text-xs text-neutral-500">
              We&apos;ll email them a secure link to join this workspace.
            </p>
          </div>

          <Select
            id="invite-role"
            label="Role"
            value={role}
            onChange={(v) => setRole(v as Role)}
            options={[
              { value: Role.MEMBER, label: 'Member' },
              { value: Role.ADMIN, label: 'Admin' },
            ]}
          />

          <div className="flex justify-end gap-3">
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
