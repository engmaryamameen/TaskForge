'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLogin } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconBolt } from '@/components/icons';
import { ApiError } from '@/types';

function getAuthErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'INVALID_CREDENTIALS':
        return 'Invalid email or password. Please try again.';
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

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? undefined;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const login = useLogin(redirect);

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

  return (
    <div className="w-full">
      {/* Branding */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
          <IconBolt className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900">Sign in to TaskForge</h1>
        <p className="mt-1 text-sm text-neutral-500">Welcome back. Enter your credentials to continue.</p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-soft">
        {login.error && (
          <div className="mb-4 rounded-lg border border-danger-600/20 bg-danger-50 px-4 py-3 text-sm text-danger-600">
            {getAuthErrorMessage(login.error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })); }}
            error={errors.email}
            placeholder="you@company.com"
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
            error={errors.password}
            placeholder="Enter your password"
          />

          <Button type="submit" loading={login.isPending} className="w-full">
            Sign in
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-primary-600 hover:text-primary-700">
          Create an account
        </Link>
      </p>
    </div>
  );
}
