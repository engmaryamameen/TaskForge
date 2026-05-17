import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'taskforge-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolve(pref: ThemePreference): ResolvedTheme {
  return pref === 'system' ? getSystemTheme() : pref;
}

function persist(pref: ThemePreference) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, pref);
}

function applyToDOM(theme: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

function loadPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

interface ThemeState {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setTheme: (pref: ThemePreference) => void;
  hydrate: () => void;
}

export const useThemeStore = create<ThemeState>()((set) => ({
  preference: 'system',
  resolved: 'light',

  setTheme: (pref) => {
    const resolved = resolve(pref);
    persist(pref);
    applyToDOM(resolved);
    set({ preference: pref, resolved });
  },

  hydrate: () => {
    const pref = loadPreference();
    const resolved = resolve(pref);
    applyToDOM(resolved);
    set({ preference: pref, resolved });
  },
}));
