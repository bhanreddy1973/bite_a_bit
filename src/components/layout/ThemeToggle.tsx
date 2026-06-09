'use client';

import { Sun, Moon } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

/**
 * ThemeToggle component — reads and writes to uiStore.
 * Displays a sun or moon icon based on the current resolved theme.
 * Toggles between light and dark modes on click or keyboard activation.
 *
 * Requirements: 2.3, 2.7, 13.1, 13.2, 13.8
 */
export function ThemeToggle() {
  const theme = useUIStore((state) => state.theme);
  const resolvedTheme = useUIStore((state) => state.resolvedTheme);
  const setTheme = useUIStore((state) => state.setTheme);

  const isDark = resolvedTheme === 'dark';

  const handleToggle = () => {
    if (theme === 'system') {
      // When set to system, toggle to the opposite of the resolved theme
      setTheme(isDark ? 'light' : 'dark');
    } else {
      // Toggle between light and dark
      setTheme(isDark ? 'light' : 'dark');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      aria-label={label}
      title={label}
      className="theme-toggle"
    >
      {isDark ? <Sun size={22} aria-hidden="true" /> : <Moon size={22} aria-hidden="true" />}
    </button>
  );
}

export default ThemeToggle;
