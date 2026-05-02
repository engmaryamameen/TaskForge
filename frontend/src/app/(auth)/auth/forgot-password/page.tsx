'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForgotPassword } from '@/features/auth/hooks/useAuth';
import { AuthShell, FormErrorAlert } from '@/features/auth/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/types';
import { AUTH_TEXT_INPUT_CLASS } from '@/features/auth/lib/auth-field-styles';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [done, setDone] = useState(false);
  const forgot = useForgotPassword();

  function validate(): boolean {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address');
      return false;
    }
    setError(undefined);
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    forgot.mutate(email.trim(), {
      onSuccess: () => setDone(true),
    });
  }

  const apiErr = forgot.error instanceof ApiError ? forgot.error : undefined;

  if (done) {
    return (
      <AuthShell
        compactVisual
        panelTitle={<>Secure<br />recovery.</>}
        panelDescription="Password reset links expire quickly. Request another from sign-in if needed."
      >
        <div className="mb-8">
          <h1 className="text-[26px] font-bold tracking-tight text-neutral-900">Check your email</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-500">
            If an account exists for this email, password reset instructions have been sent.
          </p>
        </div>
        <Button type="button" className="min-h-[48px] w-full text-[15px]" size="lg" onClick={() => router.push('/login')}>
          Back to sign in
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      compactVisual
      panelTitle={<>Account<br />recovery.</>}
      panelDescription="We’ll email you a secure link to reset your password."
    >
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight text-neutral-900">Reset your password</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">
          Enter your email and we&apos;ll send password reset instructions if an account exists.
        </p>
      </div>

      {apiErr && (
        <FormErrorAlert className="mb-6">
          <p>{apiErr.message}</p>
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
            setError(undefined);
            forgot.reset();
          }}
          error={error}
          placeholder="you@company.com"
          className={AUTH_TEXT_INPUT_CLASS}
        />

        <Button type="submit" loading={forgot.isPending} className="min-h-[48px] w-full text-[15px]" size="lg">
          Send reset link
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
