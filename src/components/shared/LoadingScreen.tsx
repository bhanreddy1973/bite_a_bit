'use client';

import React from 'react';

/**
 * Full-page centered loading indicator with spinner animation and "Loading..." text.
 * Can be used as a React Suspense fallback. Uses design tokens for styling.
 * Respects prefers-reduced-motion by using a CSS-based animation that inherits the media query.
 *
 * Requirements: 12.1, 12.4
 */
export function LoadingScreen() {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 'var(--space-6, 24px)',
        fontFamily: 'var(--font-family, Inter, sans-serif)',
        backgroundColor: 'var(--color-bg-primary, #ffffff)',
      }}
    >
      <div
        className="loading-spinner"
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--color-border-light, #E5E5EA)',
          borderTopColor: 'var(--color-primary, #007AFF)',
          borderRadius: '50%',
          marginBottom: 'var(--space-4, 16px)',
        }}
        aria-hidden="true"
      />
      <p
        style={{
          fontSize: 'var(--font-size-body, 16px)',
          color: 'var(--color-text-secondary, #3C3C43)',
          margin: 0,
          fontWeight: 'var(--font-weight-medium, 500)',
        }}
      >
        Loading...
      </p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .loading-spinner {
            animation: none;
            border-top-color: var(--color-primary, #007AFF);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}

export default LoadingScreen;
