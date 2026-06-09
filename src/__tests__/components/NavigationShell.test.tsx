import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NavigationShell } from '@/components/layout/NavigationShell';
import { useUIStore } from '@/stores/uiStore';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Track matchMedia listeners
let matchMediaListeners: Map<string, ((event: MediaQueryListEvent) => void)[]>;
let matchMediaState: Map<string, boolean>;

beforeEach(() => {
  matchMediaListeners = new Map();
  matchMediaState = new Map();

  // Default: mobile viewport (below 768px)
  matchMediaState.set('(min-width: 768px)', false);

  useUIStore.setState({
    theme: 'light',
    resolvedTheme: 'light',
    activeNav: '/',
  });

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

function simulateBreakpointChange(query: string, matches: boolean) {
  matchMediaState.set(query, matches);
  const listeners = matchMediaListeners.get(query) || [];
  listeners.forEach((listener) => {
    listener({ matches, media: query } as MediaQueryListEvent);
  });
}

describe('NavigationShell', () => {
  it('renders children inside a main element with aria-label', () => {
    render(
      <NavigationShell>
        <div data-testid="child-content">Hello</div>
      </NavigationShell>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-label', 'Page content');
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders BottomTabBar on mobile viewport (below 768px)', () => {
    render(
      <NavigationShell>
        <div>Content</div>
      </NavigationShell>
    );

    // BottomTabBar renders a <nav> with aria-label="Main navigation"
    const nav = screen.getByLabelText('Main navigation');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('bottom-tab-bar');
  });

  it('renders Sidebar on desktop viewport (768px+)', () => {
    matchMediaState.set('(min-width: 768px)', true);

    render(
      <NavigationShell>
        <div>Content</div>
      </NavigationShell>
    );

    // Sidebar renders an <aside> with aria-label
    const sidebar = screen.getByLabelText('Sidebar navigation');
    expect(sidebar).toBeInTheDocument();
  });

  it('does not render Sidebar on mobile viewport', () => {
    render(
      <NavigationShell>
        <div>Content</div>
      </NavigationShell>
    );

    expect(screen.queryByLabelText('Sidebar navigation')).not.toBeInTheDocument();
  });

  it('does not render BottomTabBar on desktop viewport', () => {
    matchMediaState.set('(min-width: 768px)', true);

    render(
      <NavigationShell>
        <div>Content</div>
      </NavigationShell>
    );

    // BottomTabBar has class 'bottom-tab-bar', while Sidebar's nav has class 'sidebar__nav'
    expect(document.querySelector('.bottom-tab-bar')).not.toBeInTheDocument();
  });

  it('switches from mobile to desktop layout on breakpoint change', () => {
    render(
      <NavigationShell>
        <div>Content</div>
      </NavigationShell>
    );

    // Initially mobile — BottomTabBar present, Sidebar absent
    expect(document.querySelector('.bottom-tab-bar')).toBeInTheDocument();
    expect(screen.queryByLabelText('Sidebar navigation')).not.toBeInTheDocument();

    // Simulate crossing 768px breakpoint
    act(() => {
      simulateBreakpointChange('(min-width: 768px)', true);
    });

    // Now desktop — Sidebar present, BottomTabBar absent
    expect(screen.getByLabelText('Sidebar navigation')).toBeInTheDocument();
    expect(document.querySelector('.bottom-tab-bar')).not.toBeInTheDocument();
  });

  it('applies mobile content class below breakpoint', () => {
    render(
      <NavigationShell>
        <div>Content</div>
      </NavigationShell>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveClass('navigation-shell__content--mobile');
    expect(main).not.toHaveClass('navigation-shell__content--desktop');
  });

  it('applies desktop content class at or above breakpoint', () => {
    matchMediaState.set('(min-width: 768px)', true);

    render(
      <NavigationShell>
        <div>Content</div>
      </NavigationShell>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveClass('navigation-shell__content--desktop');
    expect(main).not.toHaveClass('navigation-shell__content--mobile');
  });

  it('preserves active navigation state across breakpoint change', () => {
    useUIStore.setState({ activeNav: '/menu' });

    render(
      <NavigationShell>
        <div>Content</div>
      </NavigationShell>
    );

    // Initially mobile, active state is /menu
    expect(useUIStore.getState().activeNav).toBe('/menu');

    // Switch to desktop
    act(() => {
      simulateBreakpointChange('(min-width: 768px)', true);
    });

    // Active state should be preserved
    expect(useUIStore.getState().activeNav).toBe('/menu');
  });
});
