'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useResetPassword } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/types';

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const reset = useResetPassword();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Invalid or missing reset link');
      return;
    }
    reset.mutate(
      { token, password },
      {
        onError: (err) => {
          if (err instanceof ApiError) {
            setError(err.message);
            return;
          }
          setError('Something went wrong');
        },
      },
    );
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-slate-600">This link is invalid. Request a new reset from sign in.</p>
        <Link href="/auth/forgot-password" className="mt-4 inline-block text-sm font-medium text-primary-600">
          Forgot password
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="password"
        label="New password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 8 characters"
        required
        minLength={8}
      />
      <Input
        id="confirm"
        label="Confirm password"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        minLength={8}
      />
      <p className="text-xs text-slate-500">
        Use at least 8 characters. Mix letters and numbers for a stronger password.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" loading={reset.isPending}>
        Update password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Set a new password</h1>
        <p className="mt-2 text-sm text-slate-600">Choose a new password for your account.</p>
        <div className="mt-6">
          <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
            <ResetForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="font-medium text-primary-600">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
