'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRegister } from '@/features/auth/hooks/useAuth';
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const register = useRegister(redirect);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!firstName.trim()) {
      next.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      next.lastName = 'Last name is required';
    }
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
    <div className="rounded-lg bg-white p-8 shadow">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Create your account</h1>

      {register.error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {getAuthErrorMessage(register.error)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); clearError('firstName'); }}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); clearError('lastName'); }}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={register.isPending}
          className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {register.isPending ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
