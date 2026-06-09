import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';

/**
 * **Validates: Requirements 2.1, 2.6**
 *
 * Property 3: Theme Consistency
 * The resolvedTheme in uiStore always matches the data-theme attribute on <html>
 * after any theme toggle or system preference change.
 */

// We need to mock matchMedia before importing the store
let mockDarkMode = false;
const mediaQueryListeners: Array<() => void> = [];

function createMockMatchMedia(darkMode: boolean) {
  return (query: string): MediaQueryList => {
    const matches = query === '(prefers-color-scheme: dark)' ? darkMode : false;
    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: (_event: string, handler: () => void) => {
        mediaQueryListeners.push(handler);
      },
      removeEventListener: (_event: string, handler: () => void) => {
        const index = mediaQueryListeners.indexOf(handler);
        if (index !== -1) mediaQueryListeners.splice(index, 1);
      },
      dispatchEvent: vi.fn(() => true),
    } as unknown as MediaQueryList;
  };
}

function triggerSystemThemeChange(dark: boolean) {
  mockDarkMode = dark;
  // Update the matchMedia mock to reflect new system preference
  window.matchMedia = createMockMatchMedia(dark);
  // Notify all listeners
  for (const listener of [...mediaQueryListeners]) {
    listener();
  }
}

describe('uiStore - Property 3: Theme Consistency', () => {
  let useUIStore: typeof import('@/stores/uiStore').useUIStore;

  beforeEach(async () => {
    // Reset DOM
    document.documentElement.removeAttribute('data-theme');

    // Reset mocks
    mockDarkMode = false;
    mediaQueryListeners.length = 0;
    window.matchMedia = createMockMatchMedia(false);

    // Clear localStorage
    localStorage.removeItem('bite-a-bit-ui');

    // Dynamically import the store fresh each time
    vi.resetModules();
    const module = await import('@/stores/uiStore');
    useUIStore = module.useUIStore;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function assertThemeConsistency() {
    const state = useUIStore.getState();
    const dataThemeAttr = document.documentElement.getAttribute('data-theme');
    expect(dataThemeAttr).toBe(state.resolvedTheme);
  }

  it('should have resolvedTheme match data-theme after setTheme("light")', () => {
    fc.assert(
      fc.property(fc.constant('light' as const), (theme) => {
        useUIStore.getState().setTheme(theme);
        const state = useUIStore.getState();
        const attr = document.documentElement.getAttribute('data-theme');
        return state.resolvedTheme === 'light' && attr === 'light';
      })
    );
  });

  it('should have resolvedTheme match data-theme after setTheme("dark")', () => {
    fc.assert(
      fc.property(fc.constant('dark' as const), (theme) => {
        useUIStore.getState().setTheme(theme);
        const state = useUIStore.getState();
        const attr = document.documentElement.getAttribute('data-theme');
        return state.resolvedTheme === 'dark' && attr === 'dark';
      })
    );
  });

  it('should have resolvedTheme match data-theme after setTheme("system") with mocked system preference', () => {
    fc.assert(
      fc.property(fc.boolean(), (systemIsDark) => {
        // Set up the system preference mock
        mockDarkMode = systemIsDark;
        window.matchMedia = createMockMatchMedia(systemIsDark);

        useUIStore.getState().setTheme('system');
        const state = useUIStore.getState();
        const attr = document.documentElement.getAttribute('data-theme');
        const expectedTheme = systemIsDark ? 'dark' : 'light';

        return state.resolvedTheme === expectedTheme && attr === expectedTheme;
      })
    );
  });

  it('should maintain theme consistency for any sequence of theme toggles', () => {
    const themeArb = fc.constantFrom('light' as const, 'dark' as const, 'system' as const);
    const systemPrefArb = fc.boolean();

    // Generate a sequence of (themeChoice, systemPreference) pairs
    const operationArb = fc.tuple(themeArb, systemPrefArb);
    const operationsArb = fc.array(operationArb, { minLength: 1, maxLength: 30 });

    fc.assert(
      fc.property(operationsArb, (operations) => {
        for (const [theme, systemIsDark] of operations) {
          // Simulate system preference change
          mockDarkMode = systemIsDark;
          window.matchMedia = createMockMatchMedia(systemIsDark);

          // Apply the theme
          useUIStore.getState().setTheme(theme);

          // Assert consistency
          const state = useUIStore.getState();
          const attr = document.documentElement.getAttribute('data-theme');

          if (attr !== state.resolvedTheme) {
            return false;
          }

          // Also verify resolvedTheme is correct based on inputs
          if (theme === 'light' && state.resolvedTheme !== 'light') return false;
          if (theme === 'dark' && state.resolvedTheme !== 'dark') return false;
          if (theme === 'system') {
            const expected = systemIsDark ? 'dark' : 'light';
            if (state.resolvedTheme !== expected) return false;
          }
        }
        return true;
      }),
      { numRuns: 200 }
    );
  });

  it('should maintain theme consistency when system preference changes while theme is "system"', () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), { minLength: 1, maxLength: 20 }),
        (systemPreferences) => {
          // Set theme to system mode
          useUIStore.getState().setTheme('system');

          for (const isDark of systemPreferences) {
            // Simulate system preference change
            triggerSystemThemeChange(isDark);

            // Check consistency
            const state = useUIStore.getState();
            const attr = document.documentElement.getAttribute('data-theme');
            const expectedTheme = isDark ? 'dark' : 'light';

            if (state.resolvedTheme !== expectedTheme) return false;
            if (attr !== expectedTheme) return false;
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should NOT change resolvedTheme on system preference change when explicit theme is set', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('light' as const, 'dark' as const),
        fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }),
        (explicitTheme, systemChanges) => {
          // Set an explicit theme
          useUIStore.getState().setTheme(explicitTheme);

          for (const isDark of systemChanges) {
            // Simulate system preference change
            triggerSystemThemeChange(isDark);

            // resolvedTheme should stay at the explicit value
            const state = useUIStore.getState();
            const attr = document.documentElement.getAttribute('data-theme');

            if (state.resolvedTheme !== explicitTheme) return false;
            if (attr !== explicitTheme) return false;
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
