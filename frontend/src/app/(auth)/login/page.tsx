'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLogin, useResendVerification } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconBolt, IconCheckSquare, IconUsers, IconFolder } from '@/components/icons';
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
      case 'EMAIL_NOT_VERIFIED':
        return 'Please verify your email before signing in.';
    }
  }
  return 'Something went wrong. Please try again.';
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? undefined;
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

  return (
    <div className="flex min-h-screen">
      {/* Left panel — immersive branding */}
      <div className="hidden lg:flex lg:w-[52%] lg:flex-col lg:justify-between relative overflow-hidden">
        {/* Background with gradient + pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-primary-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md ring-1 ring-white/20">
              <IconBolt className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">TaskForge</span>
          </div>

          {/* Hero content */}
          <div>
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
              Where teams<br />
              build what<br />
              matters.
            </h2>
            <p className="mt-5 text-base text-white/60 max-w-md leading-relaxed">
              The multi-tenant project management platform built for teams that ship fast and ship well.
            </p>

            {/* Feature pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 ring-1 ring-white/10">
                <IconFolder className="h-4 w-4 text-white/70" />
                <span className="text-[13px] font-medium text-white/80">Project Tracking</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 ring-1 ring-white/10">
                <IconCheckSquare className="h-4 w-4 text-white/70" />
                <span className="text-[13px] font-medium text-white/80">Task Boards</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 ring-1 ring-white/10">
                <IconUsers className="h-4 w-4 text-white/70" />
                <span className="text-[13px] font-medium text-white/80">Team Workspaces</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-[13px] text-white/30">
            &copy; {new Date().getFullYear()} TaskForge. Built for modern engineering teams.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="mb-10 lg:mb-12">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 shadow-medium lg:hidden mx-auto">
              <IconBolt className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-[28px] font-bold tracking-tight text-neutral-900 text-center lg:text-left">
              Welcome back
            </h1>
            <p className="mt-2 text-[15px] text-neutral-500 text-center lg:text-left">
              Sign in to continue to your workspace
            </p>
          </div>

          {login.error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3.5">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger-100">
                <span className="text-danger-600 text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-danger-700 leading-relaxed">{getAuthErrorMessage(login.error)}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })); }}
              error={errors.email}
              placeholder="you@company.com"
            />

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-neutral-700">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
                error={errors.password}
                placeholder="Enter your password"
              />
            </div>

            {login.error instanceof ApiError && login.error.code === 'EMAIL_NOT_VERIFIED' && email.trim() && (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                loading={resend.isPending}
                onClick={() => resend.mutate(email.trim())}
              >
                Resend verification email
              </Button>
            )}

            <Button type="submit" loading={login.isPending} className="w-full !py-2.5 !text-[15px]" size="lg">
              Sign in
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-neutral-500">Loading…</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
