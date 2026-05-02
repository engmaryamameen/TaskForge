'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, type AuthStatus } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth.api';
import { connectSocket, joinOrgRoom } from '@/lib/socket';

/**
 * Centralized session guard. Owns:
 * 1. Waiting for Zustand hydration from localStorage
 * 2. Session verification (call /me on load if tokens exist)
 * 3. Navigation decisions (redirect based on status)
 * 4. Socket connection lifecycle
 */
export function useSessionGuard(mode: 'protected' | 'guest'): AuthStatus {
  const router = useRouter();
  const verifyingRef = useRef(false);
  const {
    status,
    accessToken,
    refreshToken,
    currentOrganizationId,
    _hasHydrated,
    setAuth,
    setStatus,
    logout,
  } = useAuthStore();

  // Wait for hydration, then verify session
  useEffect(() => {
    if (!_hasHydrated) return;
    if (status !== 'loading') return;
    if (verifyingRef.current) return;

    if (!accessToken) {
      setStatus('unauthenticated');
      return;
    }

    verifyingRef.current = true;

    authApi.me()
      .then(({ data }) => {
        const serverUser = data.data!.user;
        setAuth(serverUser, accessToken!, refreshToken!);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        verifyingRef.current = false;
      });
  }, [_hasHydrated, status, accessToken, refreshToken, setAuth, setStatus, logout]);

  // Handle navigation based on status and mode — only after hydration
  useEffect(() => {
    if (!_hasHydrated) return;
    if (status === 'loading') return;

    if (mode === 'protected' && status === 'unauthenticated') {
      router.push('/login');
    }
    if (mode === 'guest' && status === 'authenticated') {
      router.push('/');
    }
  }, [_hasHydrated, status, mode, router]);

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
