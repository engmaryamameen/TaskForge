'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useAcceptInvite } from '@/features/organizations/hooks/useOrganizations';
import { ApiError } from '@/types';

function getInviteErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'INVITE_NOT_FOUND':
        // Backend sends specific message (e.g. "not issued to your email")
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

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const acceptInvite = useAcceptInvite();

  // Track hydration locally — don't depend on status (requires useSessionGuard)
  const [hydrated, setHydrated] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    // Subscribe to store — once any state change fires after rehydration, we're ready
    const unsub = useAuthStore.subscribe(() => {
      setHydrated(true);
      unsub();
    });
    // If already hydrated (status !== initial default), set immediately
    if (useAuthStore.getState().status !== 'loading' || useAuthStore.getState().accessToken) {
      setHydrated(true);
      unsub();
    }
    return unsub;
  }, []);

  async function handleAccept() {
    try {
      await acceptInvite.mutateAsync(token);
      router.push('/organizations');
    } catch {
      // Error shown via mutation state
    }
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // Not authenticated
  if (!accessToken) {
    const redirectUrl = `/invite/${token}`;
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-4">
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
        </div>
      </div>
    );
  }

  // Authenticated
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
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
      </div>
    </div>
  );
}
