import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMediaQuery } from '@/hooks/useMediaQuery';

let matchMediaListeners: Map<string, ((event: MediaQueryListEvent) => void)[]>;
let matchMediaState: Map<string, boolean>;

beforeEach(() => {
  matchMediaListeners = new Map();
  matchMediaState = new Map();

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => {
      if (!matchMediaListeners.has(query)) {
        matchMediaListeners.set(query, []);
      }
      return {
        matches: matchMediaState.get(query) ?? false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: (_event: string, handler: (event: MediaQueryListEvent) => void) => {
          matchMediaListeners.get(query)!.push(handler);
        },
        removeEventListener: (_event: string, handler: (event: MediaQueryListEvent) => void) => {
          const listeners = matchMediaListeners.get(query)!;
          const index = listeners.indexOf(handler);
          if (index > -1) listeners.splice(index, 1);
        },
        dispatchEvent: () => false,
      };
    },
  });
});

function simulateMediaChange(query: string, matches: boolean) {
  matchMediaState.set(query, matches);
  const listeners = matchMediaListeners.get(query) || [];
  listeners.forEach((listener) => {
    listener({ matches, media: query } as MediaQueryListEvent);
  });
}

describe('useMediaQuery', () => {
  it('returns false when query does not match', () => {
    matchMediaState.set('(min-width: 768px)', false);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('returns true when query matches', () => {
    matchMediaState.set('(min-width: 768px)', true);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('updates when media query changes to match', () => {
    matchMediaState.set('(min-width: 768px)', false);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);

    act(() => {
      simulateMediaChange('(min-width: 768px)', true);
    });

    expect(result.current).toBe(true);
  });

  it('updates when media query changes to not match', () => {
    matchMediaState.set('(min-width: 768px)', true);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(true);

    act(() => {
      simulateMediaChange('(min-width: 768px)', false);
    });

    expect(result.current).toBe(false);
  });

  it('handles prefers-reduced-motion query', () => {
    matchMediaState.set('(prefers-reduced-motion: reduce)', true);
    const { result } = renderHook(() =>
      useMediaQuery('(prefers-reduced-motion: reduce)')
    );
    expect(result.current).toBe(true);
  });

  it('cleans up listener on unmount', () => {
    matchMediaState.set('(min-width: 768px)', false);
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    const listeners = matchMediaListeners.get('(min-width: 768px)') || [];
    expect(listeners.length).toBeGreaterThan(0);

    unmount();

    const listenersAfter = matchMediaListeners.get('(min-width: 768px)') || [];
    expect(listenersAfter.length).toBe(0);
  });
});
