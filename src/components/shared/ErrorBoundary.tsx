'use client';

import React from 'react';
import { logError } from '@/services/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary — catches unhandled render errors.
 * Displays a fallback UI with error message and "Try Again" button that resets error state.
 * Logs errors with structured metadata via the logger service.
 *
 * Requirements: 12.1, 12.2, 12.5
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError('RENDER_ERROR', error.message, {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: 'var(--space-6, 24px)',
            textAlign: 'center',
            fontFamily: 'var(--font-family, Inter, sans-serif)',
            backgroundColor: 'var(--color-bg-primary, #ffffff)',
            color: 'var(--color-text-primary, #1C1C1E)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-error, #FF3B30)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-6, 24px)',
              opacity: 0.1,
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-error, #FF3B30)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: 'var(--font-size-heading, 24px)',
              fontWeight: 'var(--font-weight-semibold, 600)',
              marginBottom: 'var(--space-3, 12px)',
              margin: '0 0 var(--space-3, 12px) 0',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-body, 16px)',
              color: 'var(--color-text-secondary, #3C3C43)',
              marginBottom: 'var(--space-6, 24px)',
              maxWidth: '400px',
              lineHeight: 'var(--line-height-normal, 1.5)',
              margin: '0 0 var(--space-6, 24px) 0',
            }}
          >
            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: 'var(--space-3, 12px) var(--space-6, 24px)',
              fontSize: 'var(--font-size-body, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              backgroundColor: 'var(--color-primary, #007AFF)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill, 9999px)',
              cursor: 'pointer',
              minWidth: '44px',
              minHeight: '44px',
              transition: 'var(--transition-fast, 150ms ease-out)',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
