'use client';

import { BottomTabBar } from './BottomTabBar';
import { Sidebar } from './Sidebar';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * NavigationShell component — renders BottomTabBar or Sidebar based on viewport width.
 * Wraps children in <main> with ARIA landmark.
 * Switches between layouts within 150ms on breakpoint change without losing active state.
 *
 * Requirements: 3.7, 10.1, 10.6, 13.4
 */

interface NavigationShellProps {
  children: React.ReactNode;
}

const BREAKPOINT_QUERY = '(min-width: 768px)';

export function NavigationShell({ children }: NavigationShellProps) {
  const isDesktop = useMediaQuery(BREAKPOINT_QUERY);

  return (
    <div className="navigation-shell">
      {isDesktop && <Sidebar />}

      <main
        aria-label="Page content"
        className={`navigation-shell__content layout-container ${
          isDesktop ? 'navigation-shell__content--desktop' : 'navigation-shell__content--mobile'
        }`}
      >
        {children}
      </main>

      {!isDesktop && <BottomTabBar />}
    </div>
  );
}

export default NavigationShell;
