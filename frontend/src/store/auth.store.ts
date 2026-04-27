import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  currentOrganizationId: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setCurrentOrganization: (orgId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      currentOrganizationId: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          currentOrganizationId: user.currentOrganizationId,
          isAuthenticated: true,
        }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setCurrentOrganization: (orgId) =>
        set({ currentOrganizationId: orgId }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          currentOrganizationId: null,
          isAuthenticated: false,
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
    },
  ),
);
