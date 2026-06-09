'use client';

import { motion } from 'framer-motion';
import React from 'react';

export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const variantStyles: Record<ButtonProps['variant'], React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-pill)',
  },
  secondary: {
    backgroundColor: 'var(--color-secondary)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
  },
  danger: {
    backgroundColor: 'var(--color-error)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
  },
};

const sizeStyles: Record<ButtonProps['size'], React.CSSProperties> = {
  sm: {
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--font-size-caption)',
    minHeight: '44px',
    minWidth: '44px',
  },
  md: {
    padding: 'var(--space-3) var(--space-6)',
    fontSize: 'var(--font-size-body)',
    minHeight: '44px',
    minWidth: '44px',
  },
  lg: {
    padding: 'var(--space-4) var(--space-8)',
    fontSize: 'var(--font-size-title)',
    minHeight: '48px',
    minWidth: '48px',
  },
};

function LoadingSpinner() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ animation: 'btn-spinner-spin 1s linear infinite' }}
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.25"
      />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Global styles for Button component focus ring and spinner animation.
 * Injected once via a <style> tag.
 */
const buttonGlobalStyles = `
  @keyframes btn-spinner-spin {
    to { transform: rotate(360deg); }
  }
  .btn-ui:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  .btn-ui.btn-variant-ghost:focus-visible {
    outline-color: var(--color-primary);
  }
  .btn-ui.btn-variant-danger:focus-visible {
    outline-color: var(--color-error);
  }
`;

export function Button({
  variant,
  size,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  children,
  onClick,
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const combinedStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    fontFamily: 'var(--font-family)',
    fontWeight: 600,
    lineHeight: 'var(--line-height-tight)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    transition: 'background-color var(--transition-fast), opacity var(--transition-fast)',
    outline: 'none',
    textDecoration: 'none',
    userSelect: 'none',
    ...variantStyles[variant],
    ...sizeStyles[size],
  };

  return (
    <>
      <style>{buttonGlobalStyles}</style>
      <motion.button
        type="button"
        className={`btn-ui btn-variant-${variant}`}
        style={combinedStyles}
        onClick={isDisabled ? undefined : onClick}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <span
          style={{
            visibility: isLoading ? 'hidden' : 'visible',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          {children}
        </span>
        {isLoading && (
          <span
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LoadingSpinner />
          </span>
        )}
      </motion.button>
    </>
  );
}

export default Button;
