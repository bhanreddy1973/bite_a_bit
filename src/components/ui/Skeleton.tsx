'use client';

import React from 'react';

interface SkeletonProps {
  variant: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number; // for text variant
  className?: string;
}

const shimmerKeyframes = `
@keyframes skeleton-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;

function getVariantStyles(variant: SkeletonProps['variant']): React.CSSProperties {
  switch (variant) {
    case 'text':
      return {
        height: '1em',
        borderRadius: 'var(--radius-sm)',
        width: '100%',
      };
    case 'circular':
      return {
        borderRadius: '50%',
        width: '40px',
        height: '40px',
      };
    case 'rectangular':
      return {
        borderRadius: 'var(--radius-md)',
        width: '100%',
        height: '120px',
      };
    case 'card':
      return {
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        height: '200px',
      };
  }
}

export function Skeleton({ variant, width, height, count = 1, className }: SkeletonProps) {
  const variantStyles = getVariantStyles(variant);

  const baseStyle: React.CSSProperties = {
    ...variantStyles,
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined
      ? { height: typeof height === 'number' ? `${height}px` : height }
      : {}),
    backgroundColor: 'var(--color-bg-tertiary)',
    backgroundImage:
      'linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-secondary) 50%, var(--color-bg-tertiary) 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 1200ms ease-in-out infinite',
    display: 'block',
  };

  const items = variant === 'text' ? Array.from({ length: count }) : [null];

  return (
    <>
      <style>{shimmerKeyframes}</style>
      {items.map((_, index) => (
        <span
          key={index}
          className={className}
          style={{
            ...baseStyle,
            // Make last text line shorter for visual variety
            ...(variant === 'text' && index === count - 1 && count > 1 ? { width: '75%' } : {}),
            ...(variant === 'text' && index > 0 ? { marginTop: 'var(--space-2)' } : {}),
          }}
          aria-hidden="true"
          role="presentation"
        />
      ))}
    </>
  );
}

export default Skeleton;
