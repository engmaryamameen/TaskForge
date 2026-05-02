'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRegister } from '@/features/auth/hooks/useAuth';
import {
  AuthShell,
  FormErrorAlert,
  PasswordInput,
  PasswordRules,
} from '@/features/auth/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/types';
import { mergeFieldError } from '@/features/auth/lib/merge-field-error';
import { meetsPasswordRules } from '@/features/auth/lib/password-rules';
import { shouldShowFormLevelBanner } from '@/features/auth/lib/form-level-banner';
import { AUTH_TEXT_INPUT_CLASS } from '@/features/auth/lib/auth-field-styles';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get('email') ?? '';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const register = useRegister();

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
    register.mutate({ email: email.trim(), password, firstName: firstName.trim(), lastName: lastName.trim() });
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
      <div className="mb-9">
        <h1 className="text-[28px] font-bold tracking-tight text-neutral-900">Create your workspace</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">
          Start planning, tracking, and shipping work with your team.
        </p>
      </div>

      {apiErr && shouldShowFormLevelBanner(apiErr) && (
        <FormErrorAlert className="mb-6">
          <p>{apiErr.message}</p>
        </FormErrorAlert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4">
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

        <div>
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

        <Button type="submit" loading={register.isPending} className="min-h-[48px] w-full text-[15px]" size="lg">
          Create workspace
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-neutral-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary-600 transition hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-neutral-500">
          Loading…
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
