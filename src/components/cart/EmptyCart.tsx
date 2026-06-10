'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export const EmptyCart: React.FC = () => {
  return (
    <div style={containerStyles} role="status" aria-label="Your cart is empty">
      {/* Cart Illustration */}
      <div style={illustrationStyles}>
        <ShoppingCart size={64} strokeWidth={1.2} color="var(--color-text-tertiary)" />
      </div>

      {/* Message */}
      <h2 style={headingStyles}>Your cart is empty</h2>
      <p style={descriptionStyles}>
        Browse our menu and add items to get started with your order.
      </p>

      {/* Browse Menu Link */}
      <Link href="/menu" style={browseButtonStyles}>
        Browse Menu
      </Link>
    </div>
  );
};

// Styles
const containerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-4)',
  padding: 'var(--space-12) var(--space-4)',
  textAlign: 'center',
};

const illustrationStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  backgroundColor: 'var(--color-bg-secondary)',
};

const headingStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 'var(--font-size-title)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-text-primary)',
};

const descriptionStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 'var(--font-size-body)',
  color: 'var(--color-text-tertiary)',
  maxWidth: '280px',
  lineHeight: 'var(--line-height-normal)',
};

const browseButtonStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-3) var(--space-6)',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-text-inverse)',
  borderRadius: 'var(--radius-pill)',
  fontSize: 'var(--font-size-body)',
  fontWeight: 'var(--font-weight-semibold)',
  textDecoration: 'none',
  minHeight: '44px',
  minWidth: '44px',
  transition: 'background-color var(--transition-fast), transform var(--transition-fast)',
};

export default EmptyCart;
