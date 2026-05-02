'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResendVerification } from '@/features/auth/hooks/useAuth';
import { AuthShell, FormErrorAlert } from '@/features/auth/components';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/types';

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
      <div className="mb-8">
        <h1 className="text-[26px] font-bold tracking-tight text-neutral-900">Verify your email</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-500">
          {email ? (
            <>
              We sent a message to <span className="font-medium text-neutral-700">{email}</span>. Click the link inside
              to activate your account.
            </>
          ) : (
            <>We sent a verification link to your email. Click the link inside to activate your account.</>
          )}
        </p>
      </div>

      {apiErr && (
        <FormErrorAlert className="mb-6">
          <p>{apiErr.message}</p>
        </FormErrorAlert>
      )}

      <div className="space-y-3">
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
        <Button
          type="button"
          className="min-h-[48px] w-full text-[15px]"
          size="lg"
          onClick={() => router.push('/login')}
        >
          Go to sign in
        </Button>
      </div>

      {!email && (
        <p className="mt-4 text-center text-xs text-neutral-500">
          Missing email in the URL — resend is available after registration or from the sign-in page.
        </p>
      )}
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
