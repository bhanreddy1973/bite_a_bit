'use client';

import { useUIStore } from '@/stores/uiStore';
import type { ThemePreference } from '@/types/common';

interface UseThemeReturn {
  theme: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemePreference) => void;
}

/**
 * useTheme — convenience hook for accessing theme state and actions from uiStore.
 *
 * @returns { theme, resolvedTheme, setTheme }
 */
export function useTheme(): UseThemeReturn {
  const theme = useUIStore((state) => state.theme);
  const resolvedTheme = useUIStore((state) => state.resolvedTheme);
  const setTheme = useUIStore((state) => state.setTheme);

  return { theme, resolvedTheme, setTheme };
}

export default useTheme;
