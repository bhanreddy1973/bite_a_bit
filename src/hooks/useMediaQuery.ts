'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * useMediaQuery hook — listens to a CSS media query and returns whether it matches.
 * Updates within one frame of the media query change event.
 *
 * @param query - A CSS media query string (e.g., '(min-width: 768px)')
 * @returns boolean indicating if the media query currently matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  const handleChange = useCallback((event: MediaQueryListEvent) => {
    setMatches(event.matches);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Sync state on mount (handles SSR hydration mismatch)
    setMatches(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query, handleChange]);

  return matches;
}

/**
 * Convenience hook — returns true when viewport width is at least 768px (tablet/desktop).
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)');
}

/**
 * Convenience hook — returns true when the user prefers reduced motion.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export default useMediaQuery;
