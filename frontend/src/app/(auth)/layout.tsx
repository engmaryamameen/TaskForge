'use client';

import { useSessionGuard } from '@/features/auth/hooks/useSessionGuard';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = useSessionGuard('guest');

  /* Allow loading + unauthenticated so signup/check-email render during hydrate */
  if (status === 'authenticated') return null;

  return <>{children}</>;
}
