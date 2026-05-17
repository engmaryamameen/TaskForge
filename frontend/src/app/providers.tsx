'use client';

import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import { ToastProvider } from '@/components/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  useEffect(() => {
    void useAuthStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    useThemeStore.getState().hydrate();

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const { preference } = useThemeStore.getState();
      if (preference === 'system') {
        useThemeStore.getState().setTheme('system');
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
