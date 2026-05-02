'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useAcceptInvite } from '@/features/organizations/hooks/useOrganizations';
import { organizationsApi } from '@/lib/api/organizations.api';
import { ApiError } from '@/types';

function getInviteErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'INVITE_NOT_FOUND':
        return error.message || 'This invite link is invalid.';
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

interface InviteInfo {
  organizationName: string;
  email: string | null;
  role: string;
}

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const acceptInvite = useAcceptInvite();

  const [hydrated, setHydrated] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [validateError, setValidateError] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);

  // Wait for store hydration
  useEffect(() => {
    const unsub = useAuthStore.subscribe(() => {
      setHydrated(true);
      unsub();
    });
    if (useAuthStore.getState().status !== 'loading' || useAuthStore.getState().accessToken) {
      setHydrated(true);
      unsub();
    }
    return unsub;
  }, []);

  // Validate invite token (public, no auth needed)
  useEffect(() => {
    organizationsApi.validateInvite(token)
      .then(({ data }) => {
        setInviteInfo(data.data!);
      })
      .catch((err) => {
        setValidateError(err instanceof ApiError ? err.message : 'This invite link is invalid.');
      })
      .finally(() => setValidating(false));
  }, [token]);

  async function handleAccept() {
    try {
      await acceptInvite.mutateAsync(token);
      router.push('/organizations');
    } catch {
      // Error shown via mutation state
    }
  }

  // Loading
  if (validating || !hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  // Invalid/expired invite
  if (validateError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="w-full max-w-md px-4">
          <div className="rounded-lg bg-white p-8 shadow text-center">
            <h1 className="mb-4 text-2xl font-bold text-neutral-900">Invalid Invite</h1>
            <p className="text-sm text-red-600">{validateError}</p>
            <Link href="/login" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
              Go to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated — show sign in / register with pre-filled email
  if (!accessToken) {
    const redirectUrl = `/invite/${token}`;
    const registerParams = new URLSearchParams({ redirect: redirectUrl });
    if (inviteInfo?.email) {
      registerParams.set('email', inviteInfo.email);
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="w-full max-w-md px-4">
          <div className="rounded-lg bg-white p-8 shadow text-center">
            <h1 className="mb-2 text-2xl font-bold text-neutral-900">You&apos;ve been invited</h1>
            <p className="mb-1 text-sm text-neutral-600">
              Join <strong>{inviteInfo?.organizationName}</strong> as {inviteInfo?.role}
            </p>
            {inviteInfo?.email && (
              <p className="mb-6 text-xs text-neutral-500">
                This invite is for <strong>{inviteInfo.email}</strong>
              </p>
            )}

            <div className="space-y-3">
              <Link
                href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
                className="block w-full rounded bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Sign in to accept
              </Link>
              <Link
                href={`/register?${registerParams.toString()}`}
                className="block w-full rounded border border-neutral-300 px-6 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated — show accept button
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md px-4">
        <div className="rounded-lg bg-white p-8 shadow text-center">
          <h1 className="mb-2 text-2xl font-bold text-neutral-900">Accept Invitation</h1>
          <p className="mb-6 text-sm text-neutral-600">
            Join <strong>{inviteInfo?.organizationName}</strong> as {inviteInfo?.role}
          </p>

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
                className="text-sm font-medium text-primary-600 hover:underline"
              >
                Go to organizations
              </Link>
            </div>
          ) : (
            <button
              onClick={handleAccept}
              disabled={acceptInvite.isPending}
              className="rounded bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {acceptInvite.isPending ? 'Accepting...' : 'Accept Invite'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
