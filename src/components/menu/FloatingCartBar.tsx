'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';

export function FloatingCartBar() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const getTotalCount = useCartStore((state) => state.getTotalCount);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const totalCount = getTotalCount();
  const totalPrice = getTotalPrice();
  const hasItems = items.length > 0;

  const handleNavigate = () => {
    router.push('/order-summary');
  };

  return (
    <AnimatePresence>
      {hasItems && (
        <motion.div
          className="floating-cart-bar"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          role="status"
          aria-live="polite"
          aria-label={`Cart: ${totalCount} items, total ₹${totalPrice}`}
        >
          <button
            className="floating-cart-bar__content"
            onClick={handleNavigate}
            aria-label={`View order summary. ${totalCount} items, ₹${totalPrice}`}
          >
            <div className="floating-cart-bar__left">
              <div className="floating-cart-bar__icon">
                <ShoppingCart size={20} />
                <span className="floating-cart-bar__badge">{totalCount}</span>
              </div>
              <span className="floating-cart-bar__count">
                {totalCount} {totalCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="floating-cart-bar__right">
              <span className="floating-cart-bar__total">₹{totalPrice}</span>
              <span className="floating-cart-bar__action">View Cart →</span>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FloatingCartBar;
