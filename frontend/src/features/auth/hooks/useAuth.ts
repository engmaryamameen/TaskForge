'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi, type RegisterPayload, type LoginPayload } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { connectSocket, disconnectSocket, joinOrgRoom } from '@/lib/socket';

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ data }) => {
      const { user, accessToken, refreshToken } = data.data!;
      setAuth(user, accessToken, refreshToken);

      const socket = connectSocket(accessToken);
      if (user.currentOrganizationId) {
        socket.on('connect', () => joinOrgRoom(user.currentOrganizationId!));
      }

      router.push('/');
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: ({ data }) => {
      const { user, accessToken, refreshToken } = data.data!;
      setAuth(user, accessToken, refreshToken);
      connectSocket(accessToken);
      router.push('/');
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      disconnectSocket();
      logout();
      router.push('/login');
    },
  });
}
