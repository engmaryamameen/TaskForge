'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useAcceptInvite } from '@/features/organizations/hooks/useOrganizations';
import { organizationsApi } from '@/lib/api/organizations.api';
import { authApi } from '@/lib/api/auth.api';
import { ApiError } from '@/types';
import { Button } from '@/components/ui/button';

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
  const { accessToken, refreshToken, setAuth } = useAuthStore();

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [validateError, setValidateError] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);

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
      if (accessToken && refreshToken) {
        const { data } = await authApi.me();
        const user = data.data!.user;
        setAuth(user, accessToken, refreshToken);
      }
      router.push('/');
    } catch {
      // Error shown via mutation state
    }
  }

  if (validating || !hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="w-full max-w-md px-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs">
            <div className="h-7 w-48 animate-shimmer rounded-md mx-auto" />
            <div className="mt-3 h-4 w-64 animate-shimmer rounded-md mx-auto" />
            <div className="mt-6 h-4 w-56 animate-shimmer rounded-md mx-auto" />
            <div className="mt-8 space-y-3">
              <div className="h-10 w-full animate-shimmer rounded-lg" />
              <div className="h-10 w-full animate-shimmer rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (validateError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="w-full max-w-md px-4">
          <div className="rounded-2xl bg-white p-8 shadow-soft text-center">
            <h1 className="mb-4 text-2xl font-bold text-neutral-900">Invalid Invite</h1>
            <p className="text-sm text-danger-600">{validateError}</p>
            <Link href="/login">
              <Button variant="link" className="mt-4">Go to sign in</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!accessToken) {
    const redirectUrl = `/invite/${token}`;
    const registerParams = new URLSearchParams({ redirect: redirectUrl });
    if (inviteInfo?.email) {
      registerParams.set('email', inviteInfo.email);
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="w-full max-w-md px-4">
          <div className="rounded-2xl bg-white p-8 shadow-soft text-center">
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
              <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}>
                <Button fullWidth size="lg">Sign in to accept</Button>
              </Link>
              <Link href={`/register?${registerParams.toString()}`}>
                <Button variant="secondary" fullWidth size="lg">Create an account</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md px-4">
        <div className="rounded-2xl bg-white p-8 shadow-soft text-center">
          <h1 className="mb-2 text-2xl font-bold text-neutral-900">Accept Invitation</h1>
          <p className="mb-6 text-sm text-neutral-600">
            Join <strong>{inviteInfo?.organizationName}</strong> as {inviteInfo?.role}
          </p>

          {acceptInvite.error && (
            <div className="mb-4 rounded-lg bg-danger-50 border border-danger-100 p-3 text-sm text-danger-700">
              {getInviteErrorMessage(acceptInvite.error)}
            </div>
          )}

          {acceptInvite.isSuccess ? (
            <div>
              <p className="mb-4 text-sm text-success-700">Invitation accepted successfully!</p>
              <Link href="/">
                <Button variant="link">Go to dashboard</Button>
              </Link>
            </div>
          ) : (
            <Button onClick={handleAccept} loading={acceptInvite.isPending} size="lg">
              Accept Invite
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
