'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRegister } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconBolt } from '@/components/icons';
import { ApiError } from '@/types';

function getAuthErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'EMAIL_ALREADY_EXISTS':
        return 'An account with this email already exists. Try signing in instead.';
      case 'ACCOUNT_SUSPENDED':
        return 'Your account has been suspended. Please contact support.';
      case 'NETWORK_ERROR':
        return 'Unable to connect. Please check your internet connection.';
      case 'TIMEOUT':
        return 'The request timed out. Please try again.';
    }
  }
  return 'Something went wrong. Please try again.';
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? undefined;
  const prefillEmail = searchParams.get('email') ?? '';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const register = useRegister(redirect);

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
    } else if (password.length < 8) {
      next.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      next.password = 'Password must include uppercase, lowercase, and a number';
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
    <div className="w-full">
      {/* Branding */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
          <IconBolt className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900">Create your account</h1>
        <p className="mt-1 text-sm text-neutral-500">Start managing your projects with TaskForge.</p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-soft">
        {register.error && (
          <div className="mb-4 rounded-lg border border-danger-600/20 bg-danger-50 px-4 py-3 text-sm text-danger-600">
            {getAuthErrorMessage(register.error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="firstName"
              label="First name"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); clearError('firstName'); }}
              error={errors.firstName}
            />
            <Input
              id="lastName"
              label="Last name"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); clearError('lastName'); }}
              error={errors.lastName}
            />
          </div>

          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
            error={errors.email}
            placeholder="you@company.com"
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
            error={errors.password}
            placeholder="At least 8 characters"
          />

          <Button type="submit" loading={register.isPending} className="w-full">
            Create account
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
