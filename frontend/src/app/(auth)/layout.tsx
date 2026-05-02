'use client';

import { useSessionGuard } from '@/features/auth/hooks/useSessionGuard';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = useSessionGuard('guest');

  if (status !== 'unauthenticated') return null;

  return <>{children}</>;
}
