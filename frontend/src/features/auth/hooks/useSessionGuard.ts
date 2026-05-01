'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, type AuthStatus } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth.api';
import { connectSocket, joinOrgRoom } from '@/lib/socket';

/**
 * Centralized session guard. Owns:
 * 1. Session verification (call /me on load if tokens exist)
 * 2. Navigation decisions (redirect based on status)
 * 3. Socket connection lifecycle
 *
 * Returns current auth status so layouts can render accordingly.
 */
export function useSessionGuard(mode: 'protected' | 'guest'): AuthStatus {
  const router = useRouter();
  const {
    status,
    accessToken,
    refreshToken,
    currentOrganizationId,
    setAuth,
    setStatus,
    logout,
  } = useAuthStore();

  // Verify session once when status is 'loading' (after hydration with tokens)
  useEffect(() => {
    if (status !== 'loading') return;

    if (!accessToken) {
      setStatus('unauthenticated');
      return;
    }

    authApi.me()
      .then(({ data }) => {
        const serverUser = data.data!.user;
        setAuth(serverUser, accessToken!, refreshToken!);
      })
      .catch(() => {
        logout();
      });
  }, [status]);

  // Handle navigation based on status and mode
  useEffect(() => {
    if (status === 'loading') return;

    if (mode === 'protected' && status === 'unauthenticated') {
      router.push('/login');
    }
    if (mode === 'guest' && status === 'authenticated') {
      router.push('/');
    }
  }, [status, mode]);

  // Connect socket when authenticated
  useEffect(() => {
    if (status !== 'authenticated' || !accessToken) return;

    const socket = connectSocket(accessToken);

    if (currentOrganizationId) {
      socket.on('connect', () => joinOrgRoom(currentOrganizationId));
      if (socket.connected) {
        joinOrgRoom(currentOrganizationId);
      }
    }
  }, [status, accessToken, currentOrganizationId]);

  return status;
}
