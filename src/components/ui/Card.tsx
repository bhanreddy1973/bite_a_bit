'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import React from 'react';

export interface CardProps {
  variant: 'elevated' | 'flat' | 'glass';
  padding?: 'sm' | 'md' | 'lg';
  pressable?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const paddingMap: Record<NonNullable<CardProps['padding']>, string> = {
  sm: 'var(--space-3)',
  md: 'var(--space-4)',
  lg: 'var(--space-6)',
};

const variantStyles: Record<CardProps['variant'], React.CSSProperties> = {
  elevated: {
    backgroundColor: 'var(--color-surface-elevated)',
    boxShadow: 'var(--shadow-md)',
    border: '1px solid var(--color-border-light)',
  },
  flat: {
    backgroundColor: 'var(--color-surface)',
    boxShadow: 'none',
    border: '1px solid var(--color-border-light)',
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
};

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'md',
  pressable = false,
  children,
  onClick,
}) => {
  const baseStyles: React.CSSProperties = {
    borderRadius: 'var(--radius-lg)',
    padding: paddingMap[padding],
    transition: `box-shadow var(--transition-fast), transform var(--transition-fast)`,
    cursor: pressable ? 'pointer' : 'default',
    ...variantStyles[variant],
  };

  const motionProps: HTMLMotionProps<'div'> = pressable
    ? {
        whileTap: { scale: 0.98 },
        whileHover: { boxShadow: 'var(--shadow-lg)' },
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }
    : {};

  return (
    <motion.div
      style={baseStyles}
      onClick={pressable ? onClick : undefined}
      role={pressable ? 'button' : undefined}
      tabIndex={pressable ? 0 : undefined}
      onKeyDown={
        pressable
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

export default Card;
