'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useRegister } from '@/features/auth/hooks/useAuth';
import { AuthShell, PasswordInput, PasswordRules } from '@/features/auth/components';
import { useToast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/types';
import { mergeFieldError } from '@/features/auth/lib/merge-field-error';
import { meetsPasswordRules } from '@/features/auth/lib/password-rules';
import { shouldShowFormLevelBanner } from '@/features/auth/lib/form-level-banner';
import { AUTH_TEXT_INPUT_CLASS } from '@/features/auth/lib/auth-field-styles';
import {
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

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get('email') ?? '';
  const postSignupRedirect = searchParams.get('redirect') ?? '';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const register = useRegister({ postVerifyRedirect: postSignupRedirect || undefined });
  const toast = useToast();

  const apiErr = register.error instanceof ApiError ? register.error : undefined;

  function validate(): boolean {
    const next: FormErrors = {};
    if (!firstName.trim()) next.firstName = 'First name is required';
    if (!lastName.trim()) next.lastName = 'Last name is required';
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      next.email = 'Enter a valid email address';
    }
    if (!password) {
      next.password = 'Password is required';
    } else if (!meetsPasswordRules(password)) {
      next.password = 'Complete all password requirements above';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function clearError(field: keyof FormErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    register.mutate(
      { email: email.trim(), password, firstName: firstName.trim(), lastName: lastName.trim() },
      {
        onError: (err) => {
          if (err instanceof ApiError && shouldShowFormLevelBanner(err)) {
            const msg = err.message;
            const duplicateEmail =
              /already\s+registered|email\s+already|already\s+exists/i.test(msg) ||
              msg.toLowerCase().includes('already registered');
            toast.error({
              title: 'Workspace creation failed',
              description: duplicateEmail
                ? 'This email is already registered. Try signing in instead.'
                : msg,
            });
          }
        },
      },
    );
  }

  return (
    <AuthShell
      panelTitle={
        <>
          Build momentum
          <br />
          every sprint.
        </>
      }
      panelDescription="Join teams that use TaskForge to plan, track, and deliver projects with confidence."
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col lg:block lg:flex-none">
        <div className={AUTH_MOBILE_SCROLL_COLUMN}>
          <header className={AUTH_HEADER_SECTION}>
            <h1 className={AUTH_PAGE_TITLE}>Create your workspace</h1>
            <p className={AUTH_PAGE_SUBTITLE}>Start planning, tracking, and shipping work with your team.</p>
          </header>

          <div className={AUTH_FORM_STACK}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-0">
              <div className="min-w-0">
                <Input
                  id="firstName"
                  label="First name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    clearError('firstName');
                    register.reset();
                  }}
                  error={mergeFieldError(apiErr, 'firstName', errors.firstName)}
                  placeholder="John"
                  className={AUTH_TEXT_INPUT_CLASS}
                />
              </div>
              <div className="min-w-0">
                <Input
                  id="lastName"
                  label="Last name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    clearError('lastName');
                    register.reset();
                  }}
                  error={mergeFieldError(apiErr, 'lastName', errors.lastName)}
                  placeholder="Doe"
                  className={AUTH_TEXT_INPUT_CLASS}
                />
              </div>
            </div>

            <Input
              id="email"
              label="Work email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError('email');
                register.reset();
              }}
              error={mergeFieldError(apiErr, 'email', errors.email)}
              placeholder="you@company.com"
              className={AUTH_TEXT_INPUT_CLASS}
            />

            <div className="space-y-0">
              <PasswordInput
                id="password"
                label="Password"
                autoCompleteMode="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError('password');
                  register.reset();
                }}
                error={mergeFieldError(apiErr, 'password', errors.password)}
                placeholder="Create a strong password"
                toggleSrLabel="Show password"
              />
              <PasswordRules password={password} />
            </div>
          </div>

          <div className={AUTH_FOOTER_LINKS}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary-600 transition hover:text-primary-700">
              Sign in
            </Link>
          </div>
        </div>

        <Button type="submit" loading={register.isPending} className={AUTH_DESKTOP_SUBMIT} size="lg">
          Create workspace
        </Button>

        <div className={AUTH_MOBILE_PRIMARY_DOCK}>
          <div className={AUTH_MOBILE_DOCK_INNER}>
            <Button type="submit" loading={register.isPending} className="min-h-[48px] w-full text-[15px]" size="lg">
              Create workspace
            </Button>
          </div>
        </div>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={<PageSkeleton variant="auth" />}
    >
      <RegisterPageContent />
    </Suspense>
  );
}
