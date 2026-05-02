'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useResendVerification } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/types';

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const resend = useResendVerification();
  const [cooldown, setCooldown] = useState(0);

  function handleResend() {
    if (!email || cooldown > 0) return;
    resend.mutate(email, {
      onSuccess: () => {
        setCooldown(60);
        const t = setInterval(() => {
          setCooldown((c) => {
            if (c <= 1) {
              clearInterval(t);
              return 0;
            }
            return c - 1;
          });
        }, 1000);
      },
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Check your email</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          We sent a verification link to{' '}
          <span className="font-medium text-slate-900">{email || 'your inbox'}</span>.
          Please verify your email to activate your workspace.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={!email || cooldown > 0 || resend.isPending}
            onClick={handleResend}
            className="w-full"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : resend.isPending ? 'Sending…' : 'Resend email'}
          </Button>
          {resend.isError && (
            <p className="text-sm text-red-600">
              {resend.error instanceof ApiError
                ? resend.error.message
                : 'Could not resend. Try again.'}
            </p>
          )}
          {resend.isSuccess && (
            <p className="text-sm text-emerald-600">If eligible, we sent another link.</p>
          )}
          <Link
            href="/login"
            className="text-center text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <CheckEmailContent />
    </Suspense>
  );
}
