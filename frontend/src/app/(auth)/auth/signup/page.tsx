'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Canonical signup UI is `/register`; this keeps `/auth/signup` working per docs. */
export default function AuthSignupRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/register');
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center text-neutral-500">
      Redirecting…
    </div>
  );
}
