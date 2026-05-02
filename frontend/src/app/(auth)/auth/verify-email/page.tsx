'use client';

import { useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useVerifyEmail } from '@/features/auth/hooks/useAuth';
import { ApiError } from '@/types';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const verify = useVerifyEmail();
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verify.mutate(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per token
  }, [token]);

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Invalid verification link</h1>
          <p className="mt-2 text-sm text-slate-600">Missing token. Use the link from your email.</p>
          <Link href="/login" className="mt-4 inline-block text-sm font-medium text-primary-600">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!verify.isError && !verify.isSuccess && token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Verifying…</p>
      </div>
    );
  }

  if (verify.isError) {
    const err = verify.error;
    const code = err instanceof ApiError ? err.code : '';
    const expired = code === 'VERIFICATION_TOKEN_EXPIRED';
    const invalid = code === 'VERIFICATION_TOKEN_INVALID';

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            {expired ? 'Link expired' : invalid ? 'Invalid link' : 'Verification failed'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {err instanceof ApiError
              ? err.message
              : 'Something went wrong.'}
          </p>
          <Link href="/login" className="mt-4 inline-block text-sm font-medium text-primary-600">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <VerifyContent />
    </Suspense>
  );
}
