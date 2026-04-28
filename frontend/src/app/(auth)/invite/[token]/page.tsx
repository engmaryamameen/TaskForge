'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useAcceptInvite } from '@/features/organizations/hooks/useOrganizations';
import { ApiError } from '@/types';

function getInviteErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'INVITE_NOT_FOUND':
        return 'This invite link is invalid.';
      case 'INVITE_EXPIRED':
        return 'This invite has expired. Ask the admin to send a new one.';
      case 'INVITE_ALREADY_USED':
        return 'This invite has already been used.';
      case 'ALREADY_MEMBER':
        return 'You are already a member of this organization.';
    }
  }
  return 'Failed to accept invite. Please try again.';
}

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const acceptInvite = useAcceptInvite();

  async function handleAccept() {
    await acceptInvite.mutateAsync(token);
    router.push('/organizations');
  }

  // Not authenticated — prompt to sign in
  if (!accessToken) {
    const redirectUrl = `/invite/${token}`;
    return (
      <div className="rounded-lg bg-white p-8 shadow text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">You&apos;ve been invited</h1>
        <p className="mb-6 text-sm text-gray-600">
          Sign in to accept this invitation and join the organization.
        </p>
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
          className="inline-block rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Sign in
        </Link>
        <p className="mt-3 text-xs text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectUrl)}`}
            className="text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    );
  }

  // Authenticated — show accept button
  return (
    <div className="rounded-lg bg-white p-8 shadow text-center">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Accept Invitation</h1>

      {acceptInvite.error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {getInviteErrorMessage(acceptInvite.error)}
        </div>
      )}

      {acceptInvite.isSuccess ? (
        <div>
          <p className="mb-4 text-sm text-green-700">Invitation accepted successfully!</p>
          <Link
            href="/organizations"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Go to organizations
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-6 text-sm text-gray-600">
            Click below to join the organization.
          </p>
          <button
            onClick={handleAccept}
            disabled={acceptInvite.isPending}
            className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {acceptInvite.isPending ? 'Accepting...' : 'Accept Invite'}
          </button>
        </>
      )}
    </div>
  );
}
