'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status, currentOrganizationId, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && currentOrganizationId) {
      router.push('/');
      return;
    }
  }, [_hasHydrated, status, currentOrganizationId, router]);

  if (!_hasHydrated || status === 'loading') return null;
  if (status === 'unauthenticated') return null;
  if (currentOrganizationId) return null;

  return <>{children}</>;
}
