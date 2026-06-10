'use client';

import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'vegetarian' | 'non-vegetarian' | 'vegan' | 'cart' | 'warning' | 'success' | 'info';
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--color-bg-tertiary)',
    color: 'var(--color-text-secondary)',
  },
  vegetarian: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  'non-vegetarian': {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  },
  vegan: {
    backgroundColor: '#E8F5E9',
    color: '#1B5E20',
  },
  cart: {
    backgroundColor: 'var(--color-error)',
    color: 'var(--color-text-inverse)',
  },
  warning: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  },
  success: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  info: {
    backgroundColor: '#E3F2FD',
    color: '#1565C0',
  },
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: variant === 'cart' ? 'var(--space-1) var(--space-2)' : 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius-pill)',
    fontSize: variant === 'cart' ? 'var(--font-size-caption)' : 'var(--font-size-label)',
    fontWeight: 'var(--font-weight-semibold)',
    lineHeight: 'var(--line-height-tight)',
    whiteSpace: 'nowrap',
    minWidth: variant === 'cart' ? '20px' : undefined,
    ...variantStyles[variant],
  };

  return (
    <span
      className={className}
      style={style}
      aria-label={variant === 'cart' ? `${children} items in cart` : undefined}
    >
      {children}
    </span>
  );
}

export default Badge;
