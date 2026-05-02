'use client';

import { usePathname } from 'next/navigation';
import { useSessionGuard } from '@/features/auth/hooks/useSessionGuard';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const status = useSessionGuard('guest');

  const showPostVerifySuccess =
    pathname === '/auth/verify-email' && status === 'authenticated';

  /* Hide logged-in users on login/register; keep verify-email visible after token exchange */
  if (status === 'authenticated' && !showPostVerifySuccess) return null;

  return <>{children}</>;
}
