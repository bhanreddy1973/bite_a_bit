import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';

// Mock matchMedia before importing the store
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
let mockMatches = false;

function createMatchMediaMock() {
  return vi.fn().mockImplementation((query: string) => ({
    matches: mockMatches,
    media: query,
    onchange: null,
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: createMatchMediaMock(),
});

// Provide a localStorage mock if not available
if (!globalThis.localStorage) {
  const store: Record<string, string> = {};
  (globalThis as unknown as Record<string, unknown>).localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
}

describe('uiStore', () => {
  let useUIStore: typeof import('@/stores/uiStore').useUIStore;

  beforeEach(async () => {
    localStorage.clear();
    mockMatches = false;
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();

    // Reassign matchMedia mock (in case vi.resetModules affected it)
    window.matchMedia = createMatchMediaMock();

    // Reset module to get a fresh store instance
    vi.resetModules();
    const module = await import('@/stores/uiStore');
    useUIStore = module.useUIStore;
  });

  describe('initial state', () => {
    it('should have default theme as system', () => {
      const state = useUIStore.getState();
      expect(state.theme).toBe('system');
    });

    it('should resolve to light when system prefers light', () => {
      const state = useUIStore.getState();
      expect(state.resolvedTheme).toBe('light');
    });

    it('should have empty toasts array', () => {
      const state = useUIStore.getState();
      expect(state.toasts).toEqual([]);
    });

    it('should have empty loadingStates', () => {
      const state = useUIStore.getState();
      expect(state.loadingStates).toEqual({});
    });

    it('should have default activeNav as /', () => {
      const state = useUIStore.getState();
      expect(state.activeNav).toBe('/');
    });
  });

  describe('setTheme', () => {
    it('should set theme to light', () => {
      act(() => {
        useUIStore.getState().setTheme('light');
      });
      const state = useUIStore.getState();
      expect(state.theme).toBe('light');
      expect(state.resolvedTheme).toBe('light');
    });

    it('should set theme to dark', () => {
      act(() => {
        useUIStore.getState().setTheme('dark');
      });
      const state = useUIStore.getState();
      expect(state.theme).toBe('dark');
      expect(state.resolvedTheme).toBe('dark');
    });

    it('should resolve system theme based on matchMedia', () => {
      act(() => {
        useUIStore.getState().setTheme('system');
      });
      const state = useUIStore.getState();
      expect(state.theme).toBe('system');
      expect(state.resolvedTheme).toBe('light');
    });

    it('should apply data-theme attribute to document', () => {
      act(() => {
        useUIStore.getState().setTheme('dark');
      });
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('setActiveNav', () => {
    it('should update activeNav', () => {
      act(() => {
        useUIStore.getState().setActiveNav('/menu');
      });
      expect(useUIStore.getState().activeNav).toBe('/menu');
    });
  });

  describe('addToast', () => {
    it('should add a toast with a generated id', () => {
      act(() => {
        useUIStore.getState().addToast({
          message: 'Item added',
          type: 'success',
        });
      });
      const toasts = useUIStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Item added');
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].id).toBeDefined();
      expect(toasts[0].id).toMatch(/^toast-/);
    });

    it('should add multiple toasts', () => {
      act(() => {
        useUIStore.getState().addToast({ message: 'First', type: 'info' });
        useUIStore.getState().addToast({ message: 'Second', type: 'error' });
      });
      expect(useUIStore.getState().toasts).toHaveLength(2);
    });

    it('should preserve optional action on toast', () => {
      const onClick = vi.fn();
      act(() => {
        useUIStore.getState().addToast({
          message: 'Retry?',
          type: 'error',
          action: { label: 'Retry', onClick },
        });
      });
      const toast = useUIStore.getState().toasts[0];
      expect(toast.action).toBeDefined();
      expect(toast.action!.label).toBe('Retry');
    });
  });

  describe('removeToast', () => {
    it('should remove a toast by id', () => {
      act(() => {
        useUIStore.getState().addToast({ message: 'Test', type: 'info' });
      });
      const id = useUIStore.getState().toasts[0].id;
      act(() => {
        useUIStore.getState().removeToast(id);
      });
      expect(useUIStore.getState().toasts).toHaveLength(0);
    });

    it('should not affect other toasts', () => {
      act(() => {
        useUIStore.getState().addToast({ message: 'First', type: 'info' });
        useUIStore.getState().addToast({ message: 'Second', type: 'info' });
      });
      const firstId = useUIStore.getState().toasts[0].id;
      act(() => {
        useUIStore.getState().removeToast(firstId);
      });
      const remaining = useUIStore.getState().toasts;
      expect(remaining).toHaveLength(1);
      expect(remaining[0].message).toBe('Second');
    });
  });

  describe('setLoading', () => {
    it('should set a loading state to true', () => {
      act(() => {
        useUIStore.getState().setLoading('fetchMenu', true);
      });
      expect(useUIStore.getState().loadingStates['fetchMenu']).toBe(true);
    });

    it('should set a loading state to false', () => {
      act(() => {
        useUIStore.getState().setLoading('fetchMenu', true);
        useUIStore.getState().setLoading('fetchMenu', false);
      });
      expect(useUIStore.getState().loadingStates['fetchMenu']).toBe(false);
    });

    it('should handle multiple loading keys', () => {
      act(() => {
        useUIStore.getState().setLoading('fetchMenu', true);
        useUIStore.getState().setLoading('placeOrder', true);
      });
      const states = useUIStore.getState().loadingStates;
      expect(states['fetchMenu']).toBe(true);
      expect(states['placeOrder']).toBe(true);
    });
  });

  describe('persistence', () => {
    it('should only persist theme preference', () => {
      act(() => {
        useUIStore.getState().setTheme('dark');
        useUIStore.getState().addToast({ message: 'Test', type: 'info' });
        useUIStore.getState().setLoading('test', true);
      });

      const stored = JSON.parse(localStorage.getItem('bite-a-bit-ui') || '{}');
      expect(stored.state.theme).toBe('dark');
      // Toasts and loadingStates should not be persisted
      expect(stored.state.toasts).toBeUndefined();
      expect(stored.state.loadingStates).toBeUndefined();
    });
  });

  describe('system theme listener', () => {
    it('should register a listener for system theme changes', () => {
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });
  });
});
