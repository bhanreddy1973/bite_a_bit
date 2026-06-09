'use client';

import React from 'react';

interface IconButtonProps {
  'aria-label': string;
  icon: React.ReactNode;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'primary';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const sizeMap = {
  sm: { minWidth: '44px', minHeight: '44px', padding: 'var(--space-2)', iconSize: 18 },
  md: { minWidth: '44px', minHeight: '44px', padding: 'var(--space-3)', iconSize: 20 },
  lg: { minWidth: '48px', minHeight: '48px', padding: 'var(--space-3)', iconSize: 24 },
};

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border-light)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    border: 'none',
  },
  primary: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-text-inverse)',
    border: 'none',
  },
};

export function IconButton({
  'aria-label': ariaLabel,
  icon,
  onClick,
  size = 'md',
  variant = 'ghost',
  disabled = false,
  className,
  type = 'button',
}: IconButtonProps) {
  const dimensions = sizeMap[size];

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: dimensions.minWidth,
    minHeight: dimensions.minHeight,
    padding: dimensions.padding,
    borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background-color var(--transition-fast), transform var(--transition-fast)',
    fontFamily: 'var(--font-family)',
    lineHeight: 1,
    ...variantStyles[variant],
  };

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={style}
    >
      {icon}
    </button>
  );
}

export default IconButton;
