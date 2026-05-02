'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResetPassword } from '@/features/auth/hooks/useAuth';
import { AuthShell, FormErrorAlert, PasswordInput, PasswordRules } from '@/features/auth/components';
import { Button } from '@/components/ui/button';
import { mergeFieldError } from '@/features/auth/lib/merge-field-error';
import { meetsPasswordRules } from '@/features/auth/lib/password-rules';
import { shouldShowFormLevelBanner } from '@/features/auth/lib/form-level-banner';
import { ApiError } from '@/types';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [clientError, setClientError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const reset = useResetPassword();
  const apiErr = reset.error instanceof ApiError ? reset.error : undefined;

  if (!token) {
    return (
      <AuthShell compactVisual panelTitle="Invalid link" panelDescription="Request a new reset link from your inbox.">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Invalid reset link</h1>
          <p className="mt-2 text-[15px] text-neutral-500">
            This page needs a valid token. Open the link from your email or request a new password reset.
          </p>
        </div>
        <Button
          type="button"
          className="min-h-[48px] w-full text-[15px]"
          size="lg"
          onClick={() => router.push('/auth/forgot-password')}
        >
          Request a new link
        </Button>
        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  function validate(): boolean {
    let ok = true;
    if (!password) {
      setClientError('Password is required');
      ok = false;
    } else if (!meetsPasswordRules(password)) {
      setClientError('Complete all password requirements');
      ok = false;
    } else {
      setClientError(undefined);
    }
    if (password !== confirm) {
      setConfirmError('Passwords do not match');
      ok = false;
    } else {
      setConfirmError(undefined);
    }
    return ok;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    reset.mutate({ token, password });
  }

  const tokenIssue =
    apiErr?.code === 'RESET_TOKEN_EXPIRED' || apiErr?.code === 'RESET_TOKEN_INVALID';

  return (
    <AuthShell
      compactVisual
      panelTitle={
        <>
          Fresh
          <br />
          credentials.
        </>
      }
      panelDescription="Choose a strong password you haven’t used elsewhere."
    >
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight text-neutral-900">Set a new password</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">
          Enter and confirm your new password below.
        </p>
      </div>

      {apiErr && shouldShowFormLevelBanner(apiErr) && (
        <FormErrorAlert className="mb-6">
          <p>{apiErr.message}</p>
          {tokenIssue && (
            <p className="mt-2 text-sm text-danger-700/90">
              If this link expired or was already used, request a new reset email.
            </p>
          )}
        </FormErrorAlert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <PasswordInput
            id="password"
            label="New password"
            autoCompleteMode="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setClientError(undefined);
              reset.reset();
            }}
            error={mergeFieldError(apiErr, 'password', clientError)}
            placeholder="New password"
          />
          <PasswordRules password={password} />
        </div>

        <PasswordInput
          id="confirmPassword"
          label="Confirm password"
          autoCompleteMode="new-password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            setConfirmError(undefined);
            reset.reset();
          }}
          error={mergeFieldError(apiErr, 'confirmPassword', confirmError)}
          placeholder="Confirm new password"
        />

        <Button type="submit" loading={reset.isPending} className="min-h-[48px] w-full text-[15px]" size="lg">
          Update password
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link href="/login" className="text-sm font-semibold text-primary-600 transition hover:text-primary-700">
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-neutral-500">
          Loading…
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
