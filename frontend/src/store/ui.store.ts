import { create } from 'zustand';

interface UIState {
  /** Mobile: whether overlay sidebar is showing */
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  /** Desktop: collapsed (icon-only 64px) vs expanded (256px) */
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;

  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

function loadCollapsedPref(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('sidebar-collapsed') === '1';
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  sidebarCollapsed: loadCollapsedPref(),
  toggleSidebarCollapsed: () =>
    set((state) => {
      const next = !state.sidebarCollapsed;
      localStorage.setItem('sidebar-collapsed', next ? '1' : '0');
      return { sidebarCollapsed: next };
    }),

  activeModal: null,
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
}));
