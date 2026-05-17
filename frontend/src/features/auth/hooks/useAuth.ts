'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  authApi,
  type RegisterPayload,
  type LoginPayload,
} from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { connectSocket, disconnectSocket, joinOrgRoom } from '@/lib/socket';

export function useLogin(redirectTo?: string) {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ data }) => {
      const inner = data.data;
      if (!inner?.user || !inner.accessToken || !inner.refreshToken) return;
      const { user, accessToken, refreshToken } = inner;
      setAuth(user, accessToken, refreshToken);

      const socket = connectSocket(accessToken);
      if (user.currentOrganizationId) {
        socket.on('connect', () => joinOrgRoom(user.currentOrganizationId!));
      }

      const dest = redirectTo
        || (user.currentOrganizationId ? '/' : '/onboarding/create-organization');
      router.push(dest);
    },
  });
}

const POST_VERIFY_REDIRECT_KEY = 'tf_post_verify_redirect';

export function savePostVerifyRedirect(url: string) {
  if (typeof window !== 'undefined') sessionStorage.setItem(POST_VERIFY_REDIRECT_KEY, url);
}

export function consumePostVerifyRedirect(): string | null {
  if (typeof window === 'undefined') return null;
  const url = sessionStorage.getItem(POST_VERIFY_REDIRECT_KEY);
  if (url) sessionStorage.removeItem(POST_VERIFY_REDIRECT_KEY);
  return url;
}

type RegisterOptions = {
  /** URL to redirect to after email verification (e.g. invite acceptance page). Saved to sessionStorage to survive the email verification flow. */
  postVerifyRedirect?: string;
};

export function useRegister(options?: RegisterOptions) {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: ({ data }) => {
      const inner = data.data;
      if (inner?.nextStep === 'VERIFY_EMAIL' && inner.email) {
        if (options?.postVerifyRedirect) {
          savePostVerifyRedirect(options.postVerifyRedirect);
        }
        router.push(
          `/auth/check-email?email=${encodeURIComponent(inner.email)}`,
        );
        return;
      }
    },
  });
}

type VerifyEmailOptions = {
  /** Default `/`. Set `null` to stay on the page (e.g. verification success UI). */
  redirectTo?: string | null;
};

export function useVerifyEmail(options?: VerifyEmailOptions) {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const redirectTo = options?.redirectTo !== undefined ? options.redirectTo : '/';

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: ({ data }) => {
      const inner = data.data;
      if (!inner?.accessToken || !inner.user) return;
      setAuth(inner.user, inner.accessToken, inner.refreshToken);
      const socket = connectSocket(inner.accessToken);
      if (inner.user.currentOrganizationId) {
        socket.on('connect', () => joinOrgRoom(inner.user.currentOrganizationId!));
      }
      if (redirectTo != null) router.push(redirectTo);
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerificationEmail(email),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (args: { token: string; password: string }) =>
      authApi.resetPassword(args.token, args.password),
    onSuccess: () => {
      router.push('/login?reset=1');
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
