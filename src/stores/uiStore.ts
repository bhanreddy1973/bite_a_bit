import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemePreference } from '@/types/common';

export interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  action?: { label: string; onClick: () => void };
  duration?: number;
}

export interface UIStore {
  theme: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  activeNav: string;
  toasts: ToastData[];
  loadingStates: Record<string, boolean>;
  setTheme: (theme: ThemePreference) => void;
  setActiveNav: (nav: string) => void;
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  setLoading: (key: string, value: boolean) => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference === 'system') return getSystemTheme();
  return preference;
}

function applyThemeToDocument(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

let mediaQueryCleanup: (() => void) | null = null;

function setupSystemThemeListener(store: {
  getState: () => UIStore;
  setState: (partial: Partial<UIStore>) => void;
}): void {
  if (typeof window === 'undefined') return;

  // Clean up any previous listener
  if (mediaQueryCleanup) {
    mediaQueryCleanup();
    mediaQueryCleanup = null;
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handler = () => {
    const state = store.getState();
    if (state.theme === 'system') {
      const resolved = getSystemTheme();
      store.setState({ resolvedTheme: resolved });
      applyThemeToDocument(resolved);
    }
  };

  mediaQuery.addEventListener('change', handler);
  mediaQueryCleanup = () => mediaQuery.removeEventListener('change', handler);
}

let toastCounter = 0;

function generateToastId(): string {
  toastCounter += 1;
  return `toast-${Date.now()}-${toastCounter}`;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'system',
      resolvedTheme: resolveTheme('system'),
      activeNav: '/',
      toasts: [],
      loadingStates: {},

      setTheme: (theme: ThemePreference) => {
        const resolved = resolveTheme(theme);
        set({ theme, resolvedTheme: resolved });
        applyThemeToDocument(resolved);
      },

      setActiveNav: (nav: string) => {
        set({ activeNav: nav });
      },

      addToast: (toast: Omit<ToastData, 'id'>) => {
        const id = generateToastId();
        const newToast: ToastData = { ...toast, id };
        set((state) => ({ toasts: [...state.toasts, newToast] }));
      },

      removeToast: (id: string) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      setLoading: (key: string, value: boolean) => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, [key]: value },
        }));
      },
    }),
    {
      name: 'bite-a-bit-ui',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            // After rehydration, resolve theme and apply to document
            const resolved = resolveTheme(state.theme);
            state.resolvedTheme = resolved;
            applyThemeToDocument(resolved);
          }
        };
      },
    },
  ),
);

// Set up system theme change listener on client side
if (typeof window !== 'undefined') {
  setupSystemThemeListener(useUIStore);

  // Apply initial theme to document
  const initialState = useUIStore.getState();
  applyThemeToDocument(initialState.resolvedTheme);
}
