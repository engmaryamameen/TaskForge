'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRegister } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconBolt, IconCheckSquare, IconUsers, IconFolder } from '@/components/icons';
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
      next.password = 'Must include uppercase, lowercase, and a number';
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
    <div className="flex min-h-screen">
      {/* Left panel — immersive branding */}
      <div className="hidden lg:flex lg:w-[52%] lg:flex-col lg:justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-primary-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md ring-1 ring-white/20">
              <IconBolt className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">TaskForge</span>
          </div>

          <div>
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
              Start building<br />
              with your<br />
              team today.
            </h2>
            <p className="mt-5 text-base text-white/60 max-w-md leading-relaxed">
              Join teams that use TaskForge to plan, track, and deliver projects with confidence.
            </p>

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

          <p className="text-[13px] text-white/30">
            &copy; {new Date().getFullYear()} TaskForge. Built for modern engineering teams.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-[380px]">
          <div className="mb-10 lg:mb-12">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 shadow-medium lg:hidden mx-auto">
              <IconBolt className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-[28px] font-bold tracking-tight text-neutral-900 text-center lg:text-left">
              Create your account
            </h1>
            <p className="mt-2 text-[15px] text-neutral-500 text-center lg:text-left">
              Get started with TaskForge in seconds
            </p>
          </div>

          {register.error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3.5">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger-100">
                <span className="text-danger-600 text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-danger-700 leading-relaxed">{getAuthErrorMessage(register.error)}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="firstName"
                label="First name"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); clearError('firstName'); }}
                error={errors.firstName}
                placeholder="John"
              />
              <Input
                id="lastName"
                label="Last name"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); clearError('lastName'); }}
                error={errors.lastName}
                placeholder="Doe"
              />
            </div>

            <Input
              id="email"
              label="Work email"
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
              hint="Must include uppercase, lowercase, and a number"
            />

            <Button type="submit" loading={register.isPending} className="w-full !py-2.5 !text-[15px]" size="lg">
              Create account
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
