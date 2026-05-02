'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLogin, useResendVerification } from '@/features/auth/hooks/useAuth';
import { AuthShell, FormErrorAlert, PasswordInput } from '@/features/auth/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/types';
import { AUTH_TEXT_INPUT_CLASS } from '@/features/auth/lib/auth-field-styles';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? undefined;
  const resetDone = searchParams.get('reset') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const login = useLogin(redirect);
  const resend = useResendVerification();

  function validate(): boolean {
    const next: { email?: string; password?: string } = {};
    const trimmed = email.trim();
    if (!trimmed) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      next.email = 'Enter a valid email address';
    }
    if (!password) {
      next.password = 'Password is required';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    login.mutate({ email: email.trim(), password });
  }

  const apiErr = login.error instanceof ApiError ? login.error : undefined;
  const isNotVerified = apiErr?.code === 'EMAIL_NOT_VERIFIED';

  return (
    <AuthShell
      panelTitle={
        <>
          Where teams
          <br />
          ship together.
        </>
      }
      panelDescription="Plan milestones, assign ownership, and keep everyone aligned from one workspace."
    >
      <div className="mb-9">
        <h1 className="text-[28px] font-bold tracking-tight text-neutral-900">Welcome back</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">
          Sign in to continue managing your workspace.
        </p>
        {resetDone && (
          <p className="mt-3 rounded-xl border border-success-200 bg-success-50 px-3 py-2 text-sm text-success-800">
            Your password has been reset. You can now sign in.
          </p>
        )}
      </div>

      {isNotVerified && apiErr && (
        <FormErrorAlert variant="warning" className="mb-6">
          <p>{apiErr.message}</p>
          {email.trim() ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full border-amber-300/80 bg-white text-amber-950 hover:bg-amber-50"
              loading={resend.isPending}
              onClick={() => resend.mutate(email.trim())}
            >
              Resend verification email
            </Button>
          ) : (
            <p className="text-sm text-amber-900/90">Enter your email above to resend verification.</p>
          )}
        </FormErrorAlert>
      )}

      {!isNotVerified && login.error && (
        <FormErrorAlert className="mb-6">
          <p>{login.error.message}</p>
        </FormErrorAlert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((prev) => ({ ...prev, email: undefined }));
            login.reset();
          }}
          error={errors.email}
          placeholder="you@company.com"
          className={AUTH_TEXT_INPUT_CLASS}
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label htmlFor="password" className="text-sm font-medium text-neutral-700">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-primary-600 transition hover:text-primary-700"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoCompleteMode="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: undefined }));
              login.reset();
            }}
            error={errors.password}
            placeholder="Enter your password"
            toggleSrLabel="Show password"
          />
        </div>

        <Button type="submit" loading={login.isPending} className="min-h-[48px] w-full text-[15px]" size="lg">
          Sign in
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-neutral-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold text-primary-600 transition hover:text-primary-700"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-neutral-500">
          Loading…
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
