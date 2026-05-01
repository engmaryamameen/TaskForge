'use client';

import { useState } from 'react';
import { useCreateInvite } from '@/features/organizations/hooks/useOrganizations';
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Invite Member</h2>

        {createInvite.error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
            {getInviteErrorMessage(createInvite.error)}
          </div>
        )}

        {inviteUrl ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Share this link to invite {email ? <strong>{email}</strong> : 'someone'} to the organization:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
              />
              <button
                onClick={handleCopy}
                className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="invite-email" className="mb-1 block text-sm font-medium text-gray-700">
                Email (optional)
              </label>
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@company.com"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to create a generic invite link.
              </p>
            </div>

            <div>
              <label htmlFor="invite-role" className="mb-1 block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={Role.MEMBER}>Member</option>
                <option value={Role.ADMIN}>Admin</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createInvite.isPending}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {createInvite.isPending ? 'Creating...' : 'Create Invite'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
