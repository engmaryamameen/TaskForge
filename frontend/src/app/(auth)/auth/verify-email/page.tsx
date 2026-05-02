'use client';

import { Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyEmail, useResendVerification } from '@/features/auth/hooks/useAuth';
import { AuthShell, FormErrorAlert } from '@/features/auth/components';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/types';
import {
  AUTH_ACTION_STACK,
  AUTH_ACTION_STACK_DESKTOP,
  AUTH_ALERT_MARGIN,
  AUTH_DESKTOP_SUBMIT,
  AUTH_FOOTER_LINKS,
  AUTH_HEADER_SECTION,
  AUTH_MOBILE_DOCK_INNER,
  AUTH_MOBILE_PRIMARY_DOCK,
  AUTH_MOBILE_SCROLL_COLUMN,
  AUTH_PAGE_SUBTITLE,
  AUTH_PAGE_TITLE_SECONDARY,
} from '@/features/auth/lib/auth-spacing';

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
        <div className="flex min-h-0 flex-1 flex-col lg:block lg:flex-none">
          <div className={AUTH_MOBILE_SCROLL_COLUMN}>
            <header className={AUTH_HEADER_SECTION}>
              <h1 className={AUTH_PAGE_TITLE_SECONDARY}>Invalid verification link</h1>
              <p className={AUTH_PAGE_SUBTITLE}>
                This page is missing a token. Use the link from your email or request a new message after signing in.
              </p>
            </header>
          </div>
          <Button
            type="button"
            className={`${AUTH_DESKTOP_SUBMIT} items-center justify-center`}
            size="lg"
            onClick={() => router.push('/login')}
          >
            Go to sign in
          </Button>
          <div className={AUTH_MOBILE_PRIMARY_DOCK}>
            <div className={AUTH_MOBILE_DOCK_INNER}>
              <Button type="button" className="min-h-[48px] w-full text-[15px]" size="lg" onClick={() => router.push('/login')}>
                Go to sign in
              </Button>
            </div>
          </div>
        </div>
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
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-12 text-center lg:min-h-[280px] lg:py-16">
          <div
            className="mb-5 h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600"
            aria-hidden
          />
          <h1 className="text-lg font-semibold text-neutral-900 sm:text-xl">Verifying your email…</h1>
          <p className="mt-2 text-[15px] text-neutral-500">This only takes a moment.</p>
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
        <div className="flex min-h-0 flex-1 flex-col lg:block lg:flex-none">
          <div className={AUTH_MOBILE_SCROLL_COLUMN}>
            <header className={AUTH_HEADER_SECTION}>
              <h1 className={AUTH_PAGE_TITLE_SECONDARY}>Email verified successfully</h1>
              <p className={AUTH_PAGE_SUBTITLE}>You&apos;re all set — continue to your workspace.</p>
            </header>
          </div>
          <Button
            type="button"
            className={`${AUTH_DESKTOP_SUBMIT} items-center justify-center`}
            size="lg"
            onClick={() => router.push('/')}
          >
            Go to workspace
          </Button>
          <div className={AUTH_MOBILE_PRIMARY_DOCK}>
            <div className={AUTH_MOBILE_DOCK_INNER}>
              <Button type="button" className="min-h-[48px] w-full text-[15px]" size="lg" onClick={() => router.push('/')}>
                Go to workspace
              </Button>
            </div>
          </div>
        </div>
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
      <div className="flex min-h-0 flex-1 flex-col lg:block lg:flex-none">
        <div className={AUTH_MOBILE_SCROLL_COLUMN}>
          <header className={AUTH_HEADER_SECTION}>
            <h1 className={AUTH_PAGE_TITLE_SECONDARY}>
              {expired ? 'Verification link expired' : invalid ? 'Invalid verification link' : 'Could not verify email'}
            </h1>
          </header>

          <FormErrorAlert className={AUTH_ALERT_MARGIN}>
            <p className="font-medium leading-relaxed">{apiErr.message}</p>
            {expired && (
              <p className="mt-2 text-sm text-danger-800/90">
                Request a new verification email from the sign-in page if you still need to verify.
              </p>
            )}
            {invalid && !expired && (
              <p className="mt-2 text-sm text-danger-800/90">
                This link may have already been used. Try signing in, or request a new verification email.
              </p>
            )}
          </FormErrorAlert>

          <div className={`${AUTH_ACTION_STACK_DESKTOP} mt-2`}>
            <Button type="button" variant="secondary" className="min-h-[48px] w-full" size="lg" onClick={() => router.push('/login')}>
              Go to sign in
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-[48px] w-full"
              size="lg"
              loading={resend.isPending}
              onClick={() => {
                const em = searchParams.get('email')?.trim();
                if (em) resend.mutate(em);
              }}
              disabled={!searchParams.get('email')?.trim()}
            >
              Resend verification email
            </Button>
          </div>

          {!searchParams.get('email')?.trim() && (
            <p className="mt-4 text-center text-xs leading-relaxed text-neutral-500">
              Add <span className="font-mono">?email=</span> to this URL to enable resend, or use &quot;Resend&quot; from sign in.
            </p>
          )}

          <div className={`${AUTH_FOOTER_LINKS} lg:mt-5`}>
            <Link href="/login" className="font-semibold text-primary-600 transition hover:text-primary-700">
              Back to sign in
            </Link>
          </div>
        </div>

        <div className={AUTH_MOBILE_PRIMARY_DOCK}>
          <div className={AUTH_MOBILE_DOCK_INNER}>
            <div className={AUTH_ACTION_STACK}>
              <Button type="button" variant="secondary" className="min-h-[48px] w-full" size="lg" onClick={() => router.push('/login')}>
                Go to sign in
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-[48px] w-full"
                size="lg"
                loading={resend.isPending}
                onClick={() => {
                  const em = searchParams.get('email')?.trim();
                  if (em) resend.mutate(em);
                }}
                disabled={!searchParams.get('email')?.trim()}
              >
                Resend verification email
              </Button>
            </div>
          </div>
        </div>
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
