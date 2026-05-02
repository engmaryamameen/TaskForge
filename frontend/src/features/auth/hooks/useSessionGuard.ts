'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  const pathname = usePathname();
  const verifyingRef = useRef(false);
  const backgroundSyncRef = useRef(false);
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      verifyingRef.current = false;
      backgroundSyncRef.current = false;
    }
  }, [status]);

  // Token but no persisted user: must block on /me once.
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

  // Optimistic session: verify in background so the UI does not wait on /me.
  useEffect(() => {
    if (!_hasHydrated) return;
    if (status !== 'authenticated' || !accessToken) return;
    if (backgroundSyncRef.current) return;

    backgroundSyncRef.current = true;

    authApi.me()
      .then(({ data }) => {
        setAuth(data.data!.user, accessToken!, refreshToken!);
      })
      .catch(() => {
        backgroundSyncRef.current = false;
        logout();
      });
  }, [_hasHydrated, status, accessToken, refreshToken, setAuth, logout]);

  // Handle navigation based on status and mode — only after hydration
  useEffect(() => {
    if (!_hasHydrated) return;
    if (status === 'loading') return;

    if (mode === 'protected' && status === 'unauthenticated') {
      router.push('/login');
    }
    if (mode === 'guest' && status === 'authenticated') {
      if (pathname === '/auth/verify-email') return;
      router.push('/');
    }
  }, [_hasHydrated, status, mode, router, pathname]);

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
