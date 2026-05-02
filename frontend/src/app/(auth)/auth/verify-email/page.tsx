'use client';

import { Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyEmail, useResendVerification } from '@/features/auth/hooks/useAuth';
import { AuthShell, FormErrorAlert } from '@/features/auth/components';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/types';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const verifyMutation = useVerifyEmail({ redirectTo: null });
  const resend = useResendVerification();
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verifyMutation.mutate(token);
  }, [token, verifyMutation.mutate]);

  if (!token) {
    return (
      <AuthShell
        compactVisual
        panelTitle="Verification"
        panelDescription="Email verification keeps your workspace secure."
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Invalid verification link</h1>
          <p className="mt-2 text-[15px] text-neutral-500">
            This page is missing a token. Use the link from your email or request a new message after signing in.
          </p>
        </div>
        <Button type="button" className="min-h-[48px] w-full text-[15px]" size="lg" onClick={() => router.push('/login')}>
          Go to sign in
        </Button>
      </AuthShell>
    );
  }

  if (verifyMutation.isPending) {
    return (
      <AuthShell
        compactVisual
        panelTitle="Verifying"
        panelDescription="Hang tight — we’re confirming your email."
      >
        <div className="py-4">
          <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
          <h1 className="text-center text-xl font-semibold text-neutral-900">Verifying your email…</h1>
          <p className="mt-2 text-center text-[15px] text-neutral-500">This only takes a moment.</p>
        </div>
      </AuthShell>
    );
  }

  if (verifyMutation.isSuccess) {
    return (
      <AuthShell
        compactVisual
        panelTitle="You’re in"
        panelDescription="Your email is verified and your session is ready."
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Email verified successfully</h1>
          <p className="mt-2 text-[15px] text-neutral-500">
            You&apos;re all set — continue to your workspace.
          </p>
        </div>
        <Button type="button" className="min-h-[48px] w-full text-[15px]" size="lg" onClick={() => router.push('/')}>
          Go to workspace
        </Button>
      </AuthShell>
    );
  }

  const apiErr =
    verifyMutation.error instanceof ApiError
      ? verifyMutation.error
      : ApiError.from(verifyMutation.error);
  const expired = apiErr.code === 'VERIFICATION_TOKEN_EXPIRED';
  const invalid = apiErr.code === 'VERIFICATION_TOKEN_INVALID';

  return (
    <AuthShell
      compactVisual
      panelTitle="Verification"
      panelDescription="Secure access starts with a verified email."
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          {expired ? 'Verification link expired' : invalid ? 'Invalid verification link' : 'Could not verify email'}
        </h1>
      </div>

      <FormErrorAlert className="mb-6">
        <p className="font-medium leading-relaxed">{apiErr.message}</p>
        {expired && (
          <p className="text-sm text-danger-800/90">
            Request a new verification email from the sign-in page if you still need to verify.
          </p>
        )}
        {invalid && !expired && (
          <p className="text-sm text-danger-800/90">
            This link may have already been used. Try signing in, or request a new verification email.
          </p>
        )}
      </FormErrorAlert>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="secondary"
          className="min-h-[48px] w-full"
          size="lg"
          onClick={() => router.push('/login')}
        >
          Go to sign in
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-[48px] w-full"
          size="lg"
          loading={resend.isPending}
          onClick={() => {
            const email = searchParams.get('email')?.trim();
            if (email) resend.mutate(email);
          }}
          disabled={!searchParams.get('email')?.trim()}
        >
          Resend verification email
        </Button>
      </div>
      {!searchParams.get('email')?.trim() && (
        <p className="mt-3 text-center text-xs text-neutral-500">
          Add <span className="font-mono">?email=</span> to this URL to enable resend, or use &quot;Resend&quot; from sign in.
        </p>
      )}
      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-neutral-500">
          Loading…
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
