'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { NavigationShell } from './NavigationShell';
import { PageTransition } from './PageTransition';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

/**
 * ClientProviders — client component that handles:
 * 1. Zustand store hydration (stores auto-hydrate via persist middleware)
 * 2. Applies data-theme attribute from uiStore to the document element
 * 3. Wraps children in ErrorBoundary → NavigationShell → PageTransition
 *
 * Requirements: 1.2, 2.1, 2.6, 12.2, 17.1
 */

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const resolvedTheme = useUIStore((state) => state.resolvedTheme);

  // Sync data-theme attribute with uiStore's resolvedTheme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  return (
    <ErrorBoundary>
      <NavigationShell>
        <PageTransition>{children}</PageTransition>
      </NavigationShell>
    </ErrorBoundary>
  );
}

export default ClientProviders;
