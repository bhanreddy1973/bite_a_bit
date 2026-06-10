'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';
import { useUIStore } from '@/stores/uiStore';
import { firebaseService } from '@/services/firebaseService';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { Button } from '@/components/ui/Button';
import { OrderItem } from '@/types/order';

const ORDER_TIMEOUT_MS = 15_000;

export default function OrderSummaryPage() {
  const router = useRouter();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Store selectors
  const items = useCartStore((s) => s.items);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const getItemsByCategory = useCartStore((s) => s.getItemsByCategory);
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const session = useUserStore((s) => s.session);
  const addToast = useUIStore((s) => s.addToast);

  // Auth guard: redirect to / if not authenticated
  useEffect(() => {
    if (!session?.isAuthenticated) {
      router.push('/');
    }
  }, [session, router]);

  // Mark hydrated after first render
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    // Validate userId and restaurantName exist
    if (!session?.id || !session?.restaurantName) {
      addToast({
        message: 'Missing user or restaurant information. Please log in again.',
        type: 'error',
        duration: 5000,
      });
      router.push('/');
      return;
    }

    if (items.length === 0) {
      return;
    }

    setIsPlacingOrder(true);

    // Build order items
    const orderItems: OrderItem[] = items.map((cartItem) => ({
      menuItemId: cartItem.menuItem.id,
      name: cartItem.menuItem.name,
      quantity: cartItem.quantity,
      price: cartItem.menuItem.price,
      subtotal: cartItem.subtotal,
      status: 'preparing' as const,
      prepTime: cartItem.menuItem.prep_time || '15 mins',
      addedBy: session.name,
    }));

    const totalPrice = getTotalPrice();

    // Call placeOrder with 15s timeout using Promise.race
    const timeoutPromise = new Promise<{ success: false; error: { category: 'timeout'; message: string } }>((resolve) => {
      setTimeout(() => {
        resolve({
          success: false,
          error: {
            category: 'timeout',
            message: 'Order submission timed out. Please try again.',
          },
        });
      }, ORDER_TIMEOUT_MS);
    });

    try {
      const result = await Promise.race([
        firebaseService.placeOrder({
          userId: session.id,
          restaurantName: session.restaurantName,
          items: orderItems,
          status: 'pending',
          totalPrice,
        }),
        timeoutPromise,
      ]);

      if (result.success) {
        // On success: clear cart, store orderId, navigate
        clearCart();
        localStorage.setItem('bite-a-bit-order-id', result.data.orderId);
        router.push('/order-confirmation');
      } else {
        // On failure: error toast with retry, cart preserved
        addToast({
          message: result.error.message,
          type: 'error',
          duration: 5000,
          action: {
            label: 'Retry',
            onClick: () => handlePlaceOrder(),
          },
        });
      }
    } catch {
      addToast({
        message: 'An unexpected error occurred. Please try again.',
        type: 'error',
        duration: 5000,
        action: {
          label: 'Retry',
          onClick: () => handlePlaceOrder(),
        },
      });
    } finally {
      setIsPlacingOrder(false);
    }
  }, [session, items, getTotalPrice, clearCart, addToast, router]);

  // Don't render until hydrated (avoid SSR mismatch)
  if (!isHydrated) {
    return null;
  }

  // Auth guard: don't render if not authenticated
  if (!session?.isAuthenticated) {
    return null;
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div style={pageContainerStyles}>
        <h1 style={pageHeadingStyles}>Order Summary</h1>
        <EmptyCart />
      </div>
    );
  }

  const groupedItems = getItemsByCategory();
  const totalPrice = getTotalPrice();

  return (
    <div style={pageContainerStyles}>
      <h1 style={pageHeadingStyles}>Order Summary</h1>

      {/* Cart items grouped by category */}
      <div style={categorySectionStyles}>
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} style={categoryGroupStyles}>
            <h2 style={categoryHeadingStyles}>{category}</h2>
            <div style={itemsListStyles}>
              <AnimatePresence mode="popLayout">
                {categoryItems.map((item) => (
                  <CartItemRow
                    key={item.menuItem.id}
                    item={item}
                    onIncrease={increaseQuantity}
                    onDecrease={decreaseQuantity}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary with totals */}
      <div style={summaryContainerStyles}>
        <CartSummary items={items} totalPrice={totalPrice} />
      </div>

      {/* Place Order Button */}
      <div style={actionContainerStyles}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isPlacingOrder}
          disabled={isPlacingOrder}
          onClick={handlePlaceOrder}
        >
          Place Order
        </Button>
      </div>
    </div>
  );
}

// Styles
const pageContainerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-5)',
  padding: 'var(--space-5) var(--space-4)',
  paddingBottom: 'var(--space-16)',
  maxWidth: 'var(--max-width-mobile)',
  margin: '0 auto',
  minHeight: '100vh',
};

const pageHeadingStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 'var(--font-size-heading)',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-text-primary)',
  lineHeight: 'var(--line-height-tight)',
};

const categorySectionStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-6)',
};

const categoryGroupStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
};

const categoryHeadingStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 'var(--font-size-title)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-text-primary)',
  textTransform: 'capitalize',
};

const itemsListStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
};

const summaryContainerStyles: React.CSSProperties = {
  padding: 'var(--space-4)',
  backgroundColor: 'var(--color-surface-elevated)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border-light)',
};

const actionContainerStyles: React.CSSProperties = {
  position: 'sticky',
  bottom: 'var(--space-4)',
  padding: 'var(--space-4) 0',
};
