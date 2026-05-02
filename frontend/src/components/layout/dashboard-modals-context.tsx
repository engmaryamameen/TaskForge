'use client';

import { createContext, useContext } from 'react';

export interface DashboardModalsContextValue {
  openTaskModal: () => void;
  openProjectModal: () => void;
}

export const DashboardModalsContext = createContext<DashboardModalsContextValue | null>(null);

export function useDashboardModals(): DashboardModalsContextValue {
  const ctx = useContext(DashboardModalsContext);
  if (!ctx) {
    throw new Error('useDashboardModals must be used within DashboardShell');
  }
  return ctx;
}

/** Same as dashboard modals API, or null outside `DashboardShell` (e.g. tests). */
export function useOptionalDashboardModals(): DashboardModalsContextValue | null {
  return useContext(DashboardModalsContext);
}
