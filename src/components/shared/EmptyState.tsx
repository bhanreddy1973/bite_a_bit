'use client';

import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Reusable empty state component with icon, title, optional message, and optional action button.
 * Uses design tokens for spacing and typography. Accessible with proper heading levels and button labels.
 *
 * Requirements: 12.4
 */
export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12, 48px) var(--space-6, 24px)',
        textAlign: 'center',
        fontFamily: 'var(--font-family, Inter, sans-serif)',
      }}
    >
      {icon && (
        <div
          style={{
            marginBottom: 'var(--space-5, 20px)',
            color: 'var(--color-text-tertiary, #8E8E93)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h2
        style={{
          fontSize: 'var(--font-size-title, 20px)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          color: 'var(--color-text-primary, #1C1C1E)',
          margin: '0 0 var(--space-2, 8px) 0',
          lineHeight: 'var(--line-height-tight, 1.2)',
        }}
      >
        {title}
      </h2>
      {message && (
        <p
          style={{
            fontSize: 'var(--font-size-body, 16px)',
            color: 'var(--color-text-secondary, #3C3C43)',
            margin: '0 0 var(--space-6, 24px) 0',
            maxWidth: '320px',
            lineHeight: 'var(--line-height-normal, 1.5)',
          }}
        >
          {message}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          aria-label={actionLabel}
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
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
