'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { CartItem } from '@/types/cart';

interface CartItemRowProps {
  item: CartItem;
  onIncrease: (itemId: string) => void;
  onDecrease: (itemId: string) => void;
}

const CartItemRowComponent: React.FC<CartItemRowProps> = ({ item, onIncrease, onDecrease }) => {
  const { menuItem, quantity, subtotal } = item;

  return (
    <motion.div
      style={rowStyles}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      role="row"
      aria-label={`${menuItem.name}, ₹${menuItem.price} each, quantity ${quantity}, subtotal ₹${subtotal}`}
    >
      {/* Item Info */}
      <div style={infoStyles}>
        <h3 style={nameStyles}>{menuItem.name}</h3>
        <span style={unitPriceStyles}>₹{menuItem.price}</span>
      </div>

      {/* Quantity Stepper */}
      <div style={stepperStyles}>
        <button
          onClick={() => onDecrease(menuItem.id)}
          style={stepperButtonStyles}
          aria-label={`Decrease quantity of ${menuItem.name}`}
        >
          <Minus size={14} />
        </button>
        <span style={quantityStyles} aria-live="polite" aria-atomic="true">
          {quantity}
        </span>
        <button
          onClick={() => onIncrease(menuItem.id)}
          style={stepperButtonStyles}
          aria-label={`Increase quantity of ${menuItem.name}`}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Line Subtotal */}
      <span style={subtotalStyles}>₹{subtotal}</span>
    </motion.div>
  );
};

// Styles
const rowStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-3)',
  padding: 'var(--space-3) var(--space-4)',
  backgroundColor: 'var(--color-surface)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border-light)',
};

const infoStyles: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-1)',
  minWidth: 0,
};

const nameStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 'var(--font-size-body)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-text-primary)',
  lineHeight: 'var(--line-height-tight)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const unitPriceStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-caption)',
  color: 'var(--color-text-tertiary)',
};

const stepperStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  backgroundColor: 'var(--color-primary-light)',
  borderRadius: 'var(--radius-pill)',
  padding: 'var(--space-1) var(--space-2)',
};

const stepperButtonStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-text-inverse)',
  cursor: 'pointer',
  minWidth: '44px',
  minHeight: '44px',
};

const quantityStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-body)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-primary)',
  minWidth: '24px',
  textAlign: 'center',
};

const subtotalStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-body)',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-text-primary)',
  whiteSpace: 'nowrap',
};

export const CartItemRow = React.memo(CartItemRowComponent);
export default CartItemRow;
