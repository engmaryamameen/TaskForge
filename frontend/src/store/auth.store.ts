import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  currentOrganizationId: string | null;
  status: AuthStatus;

  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setCurrentOrganization: (orgId: string) => void;
  setStatus: (status: AuthStatus) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      currentOrganizationId: null,
      status: 'loading' as AuthStatus,

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          currentOrganizationId: user.currentOrganizationId,
          status: 'authenticated',
        }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setCurrentOrganization: (orgId) =>
        set({ currentOrganizationId: orgId }),

      setStatus: (status) =>
        set({ status }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          currentOrganizationId: null,
          status: 'unauthenticated',
        }),
    }),
    {
      name: 'taskforge-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        currentOrganizationId: state.currentOrganizationId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          useAuthStore.setState({ status: 'loading' });
        } else {
          useAuthStore.setState({ status: 'unauthenticated' });
        }
      },
    },
  ),
);
