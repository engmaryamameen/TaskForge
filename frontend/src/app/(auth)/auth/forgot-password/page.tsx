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
import {
  AUTH_ALERT_MARGIN,
  AUTH_DESKTOP_SUBMIT,
  AUTH_FOOTER_LINKS,
  AUTH_FORM_STACK,
  AUTH_HEADER_SECTION,
  AUTH_MOBILE_DOCK_INNER,
  AUTH_MOBILE_PRIMARY_DOCK,
  AUTH_MOBILE_SCROLL_COLUMN,
  AUTH_PAGE_SUBTITLE,
  AUTH_PAGE_TITLE,
} from '@/features/auth/lib/auth-spacing';

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
        <div className="flex min-h-0 flex-1 flex-col lg:block lg:flex-none">
          <div className={AUTH_MOBILE_SCROLL_COLUMN}>
            <header className={AUTH_HEADER_SECTION}>
              <h1 className={AUTH_PAGE_TITLE}>Check your email</h1>
              <p className={AUTH_PAGE_SUBTITLE}>
                If an account exists for this email, password reset instructions have been sent.
              </p>
            </header>
          </div>
          <Button
            type="button"
            className={`${AUTH_DESKTOP_SUBMIT} items-center justify-center`}
            size="lg"
            onClick={() => router.push('/login')}
          >
            Back to sign in
          </Button>
          <div className={AUTH_MOBILE_PRIMARY_DOCK}>
            <div className={AUTH_MOBILE_DOCK_INNER}>
              <Button
                type="button"
                className="min-h-[48px] w-full text-[15px]"
                size="lg"
                onClick={() => router.push('/login')}
              >
                Back to sign in
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
      panelTitle={<>Account<br />recovery.</>}
      panelDescription="We’ll email you a secure link to reset your password."
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col lg:block lg:flex-none">
        <div className={AUTH_MOBILE_SCROLL_COLUMN}>
          <header className={AUTH_HEADER_SECTION}>
            <h1 className={AUTH_PAGE_TITLE}>Reset your password</h1>
            <p className={AUTH_PAGE_SUBTITLE}>
              Enter your email and we&apos;ll send password reset instructions if an account exists.
            </p>
          </header>

          {apiErr && (
            <FormErrorAlert className={AUTH_ALERT_MARGIN}>
              <p>{apiErr.message}</p>
            </FormErrorAlert>
          )}

          <div className={AUTH_FORM_STACK}>
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
          </div>

          <div className={AUTH_FOOTER_LINKS}>
            <Link href="/login" className="font-semibold text-primary-600 transition hover:text-primary-700">
              Back to sign in
            </Link>
          </div>
        </div>

        <Button type="submit" loading={forgot.isPending} className={AUTH_DESKTOP_SUBMIT} size="lg">
          Send reset link
        </Button>

        <div className={AUTH_MOBILE_PRIMARY_DOCK}>
          <div className={AUTH_MOBILE_DOCK_INNER}>
            <Button type="submit" loading={forgot.isPending} className="min-h-[48px] w-full text-[15px]" size="lg">
              Send reset link
            </Button>
          </div>
        </div>
      </form>
    </AuthShell>
  );
}
