import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { act } from '@testing-library/react';

/**
 * **Validates: Requirements 3.3, 3.7**
 *
 * Property 4: Navigation State Sync
 * The activeNav in uiStore always reflects the current route pathname
 * after any navigation event. Navigation highlights are never stale.
 */

// Mock matchMedia before importing the store
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

function createMatchMediaMock() {
  return vi.fn().mockImplementation((query: string) => ({
    matches: false,
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

// Valid routes in the application
const VALID_ROUTES = [
  '/',
  '/menu',
  '/order-summary',
  '/order-confirmation',
  '/nutrition-info',
  '/profile',
] as const;

describe('uiStore - Property 4: Navigation State Sync', () => {
  let useUIStore: typeof import('@/stores/uiStore').useUIStore;

  beforeEach(async () => {
    localStorage.clear();
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();
    window.matchMedia = createMatchMediaMock();

    vi.resetModules();
    const module = await import('@/stores/uiStore');
    useUIStore = module.useUIStore;
  });

  it('should set activeNav to the navigated route for any valid route', () => {
    fc.assert(
      fc.property(fc.constantFrom(...VALID_ROUTES), (route) => {
        act(() => {
          useUIStore.getState().setActiveNav(route);
        });
        expect(useUIStore.getState().activeNav).toBe(route);
      }),
      { numRuns: 100 }
    );
  });

  it('should always reflect the last navigated route after any sequence of navigation events', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...VALID_ROUTES), { minLength: 1, maxLength: 50 }),
        (navigationSequence) => {
          // Reset activeNav to default
          act(() => {
            useUIStore.getState().setActiveNav('/');
          });

          // Perform all navigations in sequence
          for (const route of navigationSequence) {
            act(() => {
              useUIStore.getState().setActiveNav(route);
            });
          }

          // activeNav should always equal the last route navigated to
          const lastRoute = navigationSequence[navigationSequence.length - 1];
          expect(useUIStore.getState().activeNav).toBe(lastRoute);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not change activeNav when other UI state is modified (theme, toasts, loading)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_ROUTES),
        fc.constantFrom('light' as const, 'dark' as const, 'system' as const),
        (route, theme) => {
          // Set a navigation route
          act(() => {
            useUIStore.getState().setActiveNav(route);
          });

          // Perform other UI state changes
          act(() => {
            useUIStore.getState().setTheme(theme);
          });
          expect(useUIStore.getState().activeNav).toBe(route);

          act(() => {
            useUIStore.getState().addToast({ message: 'test', type: 'info' });
          });
          expect(useUIStore.getState().activeNav).toBe(route);

          act(() => {
            useUIStore.getState().setLoading('someKey', true);
          });
          expect(useUIStore.getState().activeNav).toBe(route);

          act(() => {
            useUIStore.getState().setLoading('someKey', false);
          });
          expect(useUIStore.getState().activeNav).toBe(route);

          // Clean up toasts to avoid state leakage
          const toasts = useUIStore.getState().toasts;
          for (const toast of toasts) {
            act(() => {
              useUIStore.getState().removeToast(toast.id);
            });
          }
          expect(useUIStore.getState().activeNav).toBe(route);
        }
      ),
      { numRuns: 100 }
    );
  });
});
