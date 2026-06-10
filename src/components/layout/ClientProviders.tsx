'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { NavigationShell } from './NavigationShell';
import { PageTransition } from './PageTransition';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { Toast } from '@/components/ui/Toast';

/**
 * ClientProviders — client component that handles:
 * 1. Zustand store hydration (stores auto-hydrate via persist middleware)
 * 2. Applies data-theme attribute from uiStore to the document element
 * 3. Wraps children in ErrorBoundary → NavigationShell → PageTransition
 * 4. Renders toast notifications with ARIA live regions
 *
 * Requirements: 1.2, 2.1, 2.6, 12.2, 13.2, 17.1
 */

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const resolvedTheme = useUIStore((state) => state.resolvedTheme);
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  // Sync data-theme attribute with uiStore's resolvedTheme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  return (
    <ErrorBoundary>
      <NavigationShell>
        <PageTransition>{children}</PageTransition>
      </NavigationShell>

      {/* Toast notifications — persistent ARIA live region container */}
      <div
        aria-live="polite"
        aria-relevant="additions removals"
        className="toast-container"
        style={{
          position: 'fixed',
          top: 'var(--space-4)',
          right: 'var(--space-4)',
          left: 'var(--space-4)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-2)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto', width: '100%', maxWidth: '420px' }}>
            <Toast
              message={toast.message}
              type={toast.type}
              action={toast.action}
              duration={toast.duration}
              onDismiss={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ErrorBoundary>
  );
}

export default ClientProviders;
