'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResendVerification } from '@/features/auth/hooks/useAuth';
import { AuthShell, FormErrorAlert } from '@/features/auth/components';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/types';
import {
  AUTH_ACTION_STACK,
  AUTH_ACTION_STACK_DESKTOP,
  AUTH_ALERT_MARGIN,
  AUTH_HEADER_SECTION,
  AUTH_MOBILE_DOCK_INNER,
  AUTH_MOBILE_PRIMARY_DOCK,
  AUTH_MOBILE_SCROLL_COLUMN,
  AUTH_PAGE_SUBTITLE,
  AUTH_PAGE_TITLE,
} from '@/features/auth/lib/auth-spacing';

function CheckEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email')?.trim() ?? '';
  const resend = useResendVerification();
  const apiErr = resend.error instanceof ApiError ? resend.error : undefined;

  return (
    <AuthShell
      compactVisual
      panelTitle={<>Check<br />your inbox.</>}
      panelDescription="We sent a verification link to protect your workspace."
    >
      <div className="flex min-h-0 flex-1 flex-col lg:block lg:flex-none">
        <div className={AUTH_MOBILE_SCROLL_COLUMN}>
          <header className={AUTH_HEADER_SECTION}>
            <h1 className={AUTH_PAGE_TITLE}>Verify your email</h1>
            <p className={AUTH_PAGE_SUBTITLE}>
              {email ? (
                <>
                  We sent a message to <span className="font-medium text-neutral-700">{email}</span>. Click the link
                  inside to activate your account.
                </>
              ) : (
                <>We sent a verification link to your email. Click the link inside to activate your account.</>
              )}
            </p>
          </header>

          {apiErr && (
            <FormErrorAlert className={AUTH_ALERT_MARGIN}>
              <p>{apiErr.message}</p>
            </FormErrorAlert>
          )}

          <div className={`${AUTH_ACTION_STACK_DESKTOP} mt-2`}>
            <Button
              type="button"
              className="min-h-[48px] w-full text-[15px]"
              size="lg"
              variant="secondary"
              loading={resend.isPending}
              disabled={!email}
              onClick={() => email && resend.mutate(email)}
            >
              Resend verification email
            </Button>
            <Button type="button" className="min-h-[48px] w-full text-[15px]" size="lg" onClick={() => router.push('/login')}>
              Go to sign in
            </Button>
          </div>

          {!email && (
            <p className="mt-4 text-center text-xs leading-relaxed text-neutral-500">
              Missing email in the URL — resend is available after registration or from the sign-in page.
            </p>
          )}
        </div>

        <div className={AUTH_MOBILE_PRIMARY_DOCK}>
          <div className={AUTH_MOBILE_DOCK_INNER}>
            <div className={AUTH_ACTION_STACK}>
              <Button
                type="button"
                className="min-h-[48px] w-full text-[15px]"
                size="lg"
                variant="secondary"
                loading={resend.isPending}
                disabled={!email}
                onClick={() => email && resend.mutate(email)}
              >
                Resend verification email
              </Button>
              <Button type="button" className="min-h-[48px] w-full text-[15px]" size="lg" onClick={() => router.push('/login')}>
                Go to sign in
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-neutral-500">
          Loading…
        </div>
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
}
