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
    }
  }
  return 'Failed to create invite. Please try again.';
}

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(Role.MEMBER);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const createInvite = useCreateInvite();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInviteUrl(null);

    const { data } = await createInvite.mutateAsync({
      email: email.trim() || undefined,
      role,
    });

    const token = data.data!.token;
    if (typeof window !== 'undefined') {
      setInviteUrl(`${window.location.origin}/invite/${token}`);
    }
  }

  function handleCopy() {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleClose() {
    setEmail('');
    setRole(Role.MEMBER);
    setInviteUrl(null);
    setCopied(false);
    createInvite.reset();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Member">
      {createInvite.error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
          {getInviteErrorMessage(createInvite.error)}
        </div>
      )}

      {inviteUrl ? (
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Share this link to invite {email ? <strong>{email}</strong> : 'someone'} to the organization:
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
            />
            <Button size="sm" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={handleClose}>Done</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              id="invite-email"
              label="Email (optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Leave empty to create a generic invite link.
            </p>
          </div>

          <Select
            id="invite-role"
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value={Role.MEMBER}>Member</option>
            <option value={Role.ADMIN}>Admin</option>
          </Select>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button type="submit" loading={createInvite.isPending}>Create Invite</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
