'use client';

import React from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { MenuItem } from '@/types/menu';
import { MenuCard } from './MenuCard';
import { useCartStore } from '@/stores/cartStore';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

export interface MenuGridProps {
  items: MenuItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const SKELETON_COUNT = 6;

function MenuGridComponent({ items, isLoading, error, onRetry }: MenuGridProps) {
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

  const getCartQuantity = (itemId: string): number => {
    const cartItem = cartItems.find((ci) => ci.menuItem.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const isInCart = (itemId: string): boolean => {
    return cartItems.some((ci) => ci.menuItem.id === itemId);
  };

  const handleExpand = (item: MenuItem) => {
    // Future: expand card to show details via MenuCardExpanded
    console.info('Expand item:', item.id);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="menu-grid" aria-busy="true" aria-label="Loading menu items">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <div key={index} className="menu-grid__skeleton-card">
            <Skeleton variant="rectangular" height={140} />
            <div
              style={{
                padding: 'var(--space-3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="50%" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="menu-grid__error" role="alert">
        <p className="menu-grid__error-message">Unable to load menu items</p>
        <p className="menu-grid__error-detail">{error}</p>
        <Button variant="primary" size="md" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="menu-grid__empty" role="status">
        <p className="menu-grid__empty-message">No items match your current filters</p>
        <p className="menu-grid__empty-hint">Try adjusting your search or category filter</p>
      </div>
    );
  }

  // Menu items grid
  return (
    <LayoutGroup>
      <motion.div className="menu-grid" layout aria-label="Menu items">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: 0.2,
                delay: index * 0.05,
                layout: { duration: 0.3, ease: 'easeOut' },
              }}
            >
              <MenuCard
                item={item}
                onAdd={addItem}
                isInCart={isInCart(item.id)}
                cartQuantity={getCartQuantity(item.id)}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onExpand={handleExpand}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}

export const MenuGrid = React.memo(MenuGridComponent);
export default MenuGrid;
