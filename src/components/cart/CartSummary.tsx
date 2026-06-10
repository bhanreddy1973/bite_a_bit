'use client';

import React, { useMemo } from 'react';
import { CartItem } from '@/types/cart';

interface CartSummaryProps {
  items: CartItem[];
  totalPrice: number;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ items, totalPrice }) => {
  // Group items by dish_type
  const groupedItems = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const category = item.menuItem.dish_type || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      },
      {} as Record<string, CartItem[]>,
    );
  }, [items]);

  // Calculate category subtotals
  const categorySubtotals = useMemo(() => {
    const subtotals: Record<string, number> = {};
    for (const [category, categoryItems] of Object.entries(groupedItems)) {
      subtotals[category] = categoryItems.reduce((sum, item) => sum + item.subtotal, 0);
    }
    return subtotals;
  }, [groupedItems]);

  const categories = Object.keys(groupedItems);

  return (
    <div style={containerStyles} role="region" aria-label="Order summary">
      {categories.map((category) => (
        <div key={category} style={categoryGroupStyles}>
          {/* Category Heading */}
          <h3 style={categoryHeadingStyles}>{category}</h3>

          {/* Items within category */}
          <div style={itemsListStyles}>
            {groupedItems[category].map((item) => (
              <div key={item.menuItem.id} style={summaryItemStyles}>
                <div style={itemInfoStyles}>
                  <span style={itemNameStyles}>{item.menuItem.name}</span>
                  <span style={itemDetailStyles}>
                    ₹{item.menuItem.price} × {item.quantity}
                  </span>
                </div>
                <span style={itemSubtotalStyles}>₹{item.subtotal}</span>
              </div>
            ))}
          </div>

          {/* Category Subtotal */}
          <div style={categorySubtotalRowStyles}>
            <span style={categorySubtotalLabelStyles}>{category} subtotal</span>
            <span style={categorySubtotalValueStyles}>₹{categorySubtotals[category]}</span>
          </div>
        </div>
      ))}

      {/* Grand Total */}
      <div style={grandTotalRowStyles}>
        <span style={grandTotalLabelStyles}>Grand Total</span>
        <span style={grandTotalValueStyles}>₹{totalPrice}</span>
      </div>
    </div>
  );
};

// Styles
const containerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-5)',
};

const categoryGroupStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
};

const categoryHeadingStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 'var(--font-size-body)',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-text-primary)',
  textTransform: 'capitalize',
  paddingBottom: 'var(--space-2)',
  borderBottom: '1px solid var(--color-border-light)',
};

const itemsListStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
};

const summaryItemStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 'var(--space-2) 0',
};

const itemInfoStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  minWidth: 0,
  flex: 1,
};

const itemNameStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-body)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text-primary)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const itemDetailStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-caption)',
  color: 'var(--color-text-tertiary)',
};

const itemSubtotalStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-body)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text-secondary)',
  whiteSpace: 'nowrap',
  marginLeft: 'var(--space-3)',
};

const categorySubtotalRowStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: 'var(--space-2)',
  borderTop: '1px dashed var(--color-border)',
};

const categorySubtotalLabelStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-label)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-text-secondary)',
  textTransform: 'capitalize',
};

const categorySubtotalValueStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-body)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-text-primary)',
};

const grandTotalRowStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: 'var(--space-4)',
  borderTop: '2px solid var(--color-border)',
  marginTop: 'var(--space-2)',
};

const grandTotalLabelStyles: React.CSSProperties = {
  fontSize: 'calc(var(--font-size-body) * 1.5)',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-text-primary)',
};

const grandTotalValueStyles: React.CSSProperties = {
  fontSize: 'calc(var(--font-size-body) * 1.5)',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-primary)',
};

export default CartSummary;
