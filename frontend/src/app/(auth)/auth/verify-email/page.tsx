'use client';

import { Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CircleCheck } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useVerifyEmail, consumePostVerifyRedirect } from '@/features/auth/hooks/useAuth';
import { AuthShell, FormErrorAlert } from '@/features/auth/components';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/types';
import {
  AUTH_ALERT_MARGIN,
  AUTH_DESKTOP_SUBMIT,
  AUTH_HEADER_SECTION,
  AUTH_MOBILE_DOCK_INNER,
  AUTH_MOBILE_PRIMARY_DOCK,
  AUTH_MOBILE_SCROLL_COLUMN,
  AUTH_PAGE_SUBTITLE,
  AUTH_PAGE_TITLE,
} from '@/features/auth/lib/auth-spacing';

function storageKeyForToken(t: string) {
  return `tf_verify_ok_${t.slice(0, 48)}`;
}

/** One in-flight verify per token (React Strict Mode runs effects twice before the first completes). */
const verifyEmailInflight = new Map<string, Promise<unknown>>();

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const verify = useVerifyEmail({ redirectTo: null });

  const okStorageKey = useMemo(() => (token ? storageKeyForToken(token) : ''), [token]);
  const [cachedOk, setCachedOk] = useState(false);
  const [promiseFailed, setPromiseFailed] = useState(false);

  // Consume a saved redirect (e.g. from invite flow) once on mount
  const [savedRedirect] = useState(() => consumePostVerifyRedirect());

  useLayoutEffect(() => {
    if (!okStorageKey || typeof window === 'undefined') return;
    setCachedOk(sessionStorage.getItem(okStorageKey) === '1');
  }, [okStorageKey]);

  useEffect(() => {
    setPromiseFailed(false);
  }, [token]);

  useEffect(() => {
    if (!token || !okStorageKey) return;
    if (typeof window !== 'undefined' && sessionStorage.getItem(okStorageKey) === '1') {
      setCachedOk(true);
      return;
    }

    let p = verifyEmailInflight.get(token);
    if (!p) {
      p = verify.mutateAsync(token);
      verifyEmailInflight.set(token, p);
    }

    void p
      .then(() => {
        if (typeof window !== 'undefined') sessionStorage.setItem(okStorageKey, '1');
        setCachedOk(true);
      })
      .catch(() => setPromiseFailed(true))
      .finally(() => {
        verifyEmailInflight.delete(token);
      });
  }, [token, okStorageKey, verify]);

  const apiErr = verify.error instanceof ApiError ? verify.error : undefined;
  const showVerifyError = verify.isError || promiseFailed;

  if (!token) {
    return (
      <AuthShell
        compactVisual
        panelTitle={
          <>
            Verify
            <br />
            your email.
          </>
        }
        panelDescription="Complete verification from the link we sent you."
      >
        <div className="flex min-h-0 flex-1 flex-col lg:block lg:flex-none">
          <div className={AUTH_MOBILE_SCROLL_COLUMN}>
            <header className={AUTH_HEADER_SECTION}>
              <h1 className={AUTH_PAGE_TITLE}>This link is incomplete</h1>
              <p className={AUTH_PAGE_SUBTITLE}>
                Open the verification link from your email, or request a new one from the sign-in page if it expired.
              </p>
            </header>
            <Button type="button" size="lg" className={AUTH_DESKTOP_SUBMIT} onClick={() => router.push('/login')}>
              Go to sign in
            </Button>
          </div>
          <div className={AUTH_MOBILE_PRIMARY_DOCK}>
            <div className={AUTH_MOBILE_DOCK_INNER}>
              <Button type="button" size="lg" className="min-h-[48px] w-full text-[15px]" onClick={() => router.push('/login')}>
                Go to sign in
              </Button>
            </div>
          </div>
        </div>
      </AuthShell>
    );
  }

  const showSuccess = verify.isSuccess || cachedOk;

  if (token && !showSuccess && !showVerifyError) {
    return (
      <AuthShell
        compactVisual
        panelTitle={
          <>
            Almost
            <br />
            there.
          </>
        }
        panelDescription="Confirming your email keeps your workspace secure."
      >
        <div className={AUTH_MOBILE_SCROLL_COLUMN}>
          <header className={AUTH_HEADER_SECTION}>
            <h1 className={AUTH_PAGE_TITLE}>Verifying your email</h1>
            <p className={AUTH_PAGE_SUBTITLE}>Hang tight — we are activating your account.</p>
          </header>
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm text-neutral-600">
            <Spinner className="h-6 w-6 shrink-0 text-primary-600" />
            <span>Securely confirming your link…</span>
          </div>
        </div>
      </AuthShell>
    );
  }

  if (showSuccess) {
    const successDest = savedRedirect || '/onboarding/create-organization';
    const successLabel = savedRedirect ? 'Continue' : 'Create your organization';
    const successSubtitle = savedRedirect
      ? 'Your account is active. Continue where you left off.'
      : 'Your account is active. Next, create your organization to get started.';
    const successDetail = savedRedirect
      ? 'Your email is verified and your account is ready.'
      : "Your email is verified. Let's set up your workspace.";
    const panelDesc = savedRedirect
      ? 'Your account is verified — pick up where you left off.'
      : 'One more step — set up your workspace.';

    return (
      <AuthShell
        compactVisual
        panelTitle={
          <>
            Welcome
            <br />
            aboard.
          </>
        }
        panelDescription={panelDesc}
      >
        <div className="flex min-h-0 flex-1 flex-col lg:block lg:flex-none">
          <div className={AUTH_MOBILE_SCROLL_COLUMN}>
            <header className={AUTH_HEADER_SECTION}>
              <h1 className={AUTH_PAGE_TITLE}>Email verified</h1>
              <p className={AUTH_PAGE_SUBTITLE}>{successSubtitle}</p>
            </header>

            <div className="rounded-xl border border-success-200 bg-success-50 px-4 py-4 text-success-900">
              <div className="flex gap-3">
                <CircleCheck className="mt-0.5 h-6 w-6 shrink-0 text-success-600" aria-hidden />
                <div className="min-w-0">
                  <p className="font-semibold leading-snug">Success</p>
                  <p className="mt-1 text-sm leading-relaxed text-success-800">
                    {successDetail}
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              size="lg"
              className={AUTH_DESKTOP_SUBMIT}
              onClick={() => router.push(successDest)}
            >
              {successLabel}
            </Button>
          </div>

          <div className={AUTH_MOBILE_PRIMARY_DOCK}>
            <div className={AUTH_MOBILE_DOCK_INNER}>
              <Button type="button" size="lg" className="min-h-[48px] w-full text-[15px]" onClick={() => router.push(successDest)}>
                {successLabel}
              </Button>
            </div>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      compactVisual
      panelTitle={
        <>
          Verify
          <br />
          your email.
        </>
      }
      panelDescription="We could not confirm this link."
    >
      <div className="flex min-h-0 flex-1 flex-col lg:block lg:flex-none">
        <div className={AUTH_MOBILE_SCROLL_COLUMN}>
          <header className={AUTH_HEADER_SECTION}>
            <h1 className={AUTH_PAGE_TITLE}>Verification did not complete</h1>
            <p className={AUTH_PAGE_SUBTITLE}>
              The link may be invalid or expired. You can request a fresh email from sign-in, or try registering again.
            </p>
          </header>

          {(apiErr || promiseFailed) && (
            <FormErrorAlert className={AUTH_ALERT_MARGIN}>
              <p>
                {apiErr?.message ??
                  'This link is invalid, expired, or was already used. Request a new verification email from sign-in.'}
              </p>
            </FormErrorAlert>
          )}

          <Button type="button" size="lg" className={AUTH_DESKTOP_SUBMIT} onClick={() => router.push('/login')}>
            Back to sign in
          </Button>
        </div>

        <div className={AUTH_MOBILE_PRIMARY_DOCK}>
          <div className={AUTH_MOBILE_DOCK_INNER}>
            <Button type="button" size="lg" className="min-h-[48px] w-full text-[15px]" onClick={() => router.push('/login')}>
              Back to sign in
            </Button>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={<PageSkeleton variant="auth" />}
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
