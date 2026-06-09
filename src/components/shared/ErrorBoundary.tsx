'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * App-level Error Boundary — catches unhandled React errors.
 * Displays a fallback UI with error message and "Try Again" button.
 *
 * Requirements: 12.2
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
    // Log the error with structured metadata
    console.error('[ErrorBoundary]', {
      timestamp: new Date().toISOString(),
      level: 'error',
      type: 'RENDER_ERROR',
      message: error.message,
      context: {
        component: 'ErrorBoundary',
        action: 'componentDidCatch',
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      },
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
          <h1
            style={{
              fontSize: 'var(--font-size-heading, 24px)',
              fontWeight: 'var(--font-weight-semibold, 600)',
              marginBottom: 'var(--space-4, 16px)',
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
            }}
          >
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '12px 24px',
              fontSize: 'var(--font-size-body, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              backgroundColor: 'var(--color-primary, #007AFF)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill, 9999px)',
              cursor: 'pointer',
              minWidth: '44px',
              minHeight: '44px',
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
