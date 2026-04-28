'use client';

import { useSessionGuard } from '@/features/auth/hooks/useSessionGuard';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = useSessionGuard('guest');

  if (status !== 'unauthenticated') return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
