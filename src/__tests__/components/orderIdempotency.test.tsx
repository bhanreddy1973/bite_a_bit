import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';

/**
 * **Validates: Requirements 7.4**
 *
 * Property 7: Order Idempotency
 * Verify Place Order button is disabled after first click until the request resolves,
 * preventing duplicate submissions.
 *
 * For any number of rapid clicks on the "Place Order" button while a request is in-flight,
 * only one firebaseService.placeOrder call should be made. The button should be disabled
 * (or show loading state) after the first click. After the request resolves, the button
 * becomes interactive again.
 */

// Control the placeOrder promise externally
let resolvePlaceOrder: (value: { success: true; data: { orderId: string } }) => void;
let rejectPlaceOrder: (reason: unknown) => void;
const mockPlaceOrder = vi.fn();

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/order-summary',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: Record<string, unknown>) => {
      const { whileHover, whileTap, transition, ...htmlProps } = props;
      void whileHover;
      void whileTap;
      void transition;
      return <button {...(htmlProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{children as React.ReactNode}</button>;
    },
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial, animate, exit, variants, layout, transition, whileHover, whileTap, ...htmlProps } = props;
      void initial;
      void animate;
      void exit;
      void variants;
      void layout;
      void transition;
      void whileHover;
      void whileTap;
      return <div {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}>{children as React.ReactNode}</div>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
}));

// Mock firebaseService
vi.mock('@/services/firebaseService', () => ({
  firebaseService: {
    placeOrder: (...args: unknown[]) => mockPlaceOrder(...args),
    getMenuItems: vi.fn(),
    createUser: vi.fn(),
    getOrderStatus: vi.fn(),
  },
}));

// Mock cartStore
const mockCartItems = [
  {
    menuItem: {
      id: 'item-1',
      name: 'Test Burger',
      price: 250,
      available: true,
      dish_type: 'main',
      diet: 'Non-Vegetarian',
      prep_time: '15 mins',
      description: 'A test burger',
      image_url: '',
      cuisine: 'American',
      meal_type: ['lunch'],
      allergens: [],
      spice_level: 'None',
      taste_profile: [],
      flavor_tags: [],
      ingredients: [],
      calories: 500,
      carbs: 40,
      protein: 30,
      fat: 20,
      is_best_seller: false,
      rating: 4.5,
      review_count: 10,
      portion_size: 'Regular',
      serves: '1',
      cooking_method: 'Grilled',
      available_time: ['lunch', 'dinner'],
      occasion: [],
      pairs_well_with: [],
      combo_items: [],
    },
    quantity: 2,
    subtotal: 500,
  },
];

const mockClearCart = vi.fn();

vi.mock('@/stores/cartStore', () => ({
  useCartStore: (selector: (state: unknown) => unknown) => {
    const state = {
      items: mockCartItems,
      getTotalCount: () => 2,
      getTotalPrice: () => 500,
      getItemsByCategory: () => ({ main: mockCartItems }),
      increaseQuantity: vi.fn(),
      decreaseQuantity: vi.fn(),
      clearCart: mockClearCart,
    };
    if (typeof selector === 'function') {
      return selector(state);
    }
    return state;
  },
}));

// Mock userStore with authenticated session
vi.mock('@/stores/userStore', () => ({
  useUserStore: (selector: (state: unknown) => unknown) => {
    const state = {
      session: {
        id: 'user-123',
        name: 'Test User',
        phone: '9876543210',
        restaurantName: 'test_restaurant',
        isAuthenticated: true,
      },
    };
    if (typeof selector === 'function') {
      return selector(state);
    }
    return state;
  },
}));

// Mock uiStore
const mockAddToast = vi.fn();
vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (state: unknown) => unknown) => {
    const state = {
      addToast: mockAddToast,
    };
    if (typeof selector === 'function') {
      return selector(state);
    }
    return state;
  },
}));

// Mock CartItemRow, CartSummary, EmptyCart to simplify rendering
vi.mock('@/components/cart/CartItemRow', () => ({
  CartItemRow: ({ item }: { item: { menuItem: { name: string } } }) => (
    <div data-testid="cart-item-row">{item.menuItem.name}</div>
  ),
}));

vi.mock('@/components/cart/CartSummary', () => ({
  CartSummary: () => <div data-testid="cart-summary">Summary</div>,
}));

vi.mock('@/components/cart/EmptyCart', () => ({
  EmptyCart: () => <div data-testid="empty-cart">Empty</div>,
}));

describe('Property 7: Order Idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up controlled promise for each test
    mockPlaceOrder.mockImplementation(() => {
      return new Promise((resolve, reject) => {
        resolvePlaceOrder = resolve;
        rejectPlaceOrder = reject;
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call placeOrder exactly once regardless of the number of rapid clicks while request is in-flight', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 20 }),
        async (clickCount: number) => {
          // Reset mocks for each property run
          mockPlaceOrder.mockClear();
          mockPush.mockClear();
          mockClearCart.mockClear();

          // Re-setup the controlled promise
          mockPlaceOrder.mockImplementation(() => {
            return new Promise((resolve, reject) => {
              resolvePlaceOrder = resolve;
              rejectPlaceOrder = reject;
            });
          });

          const { default: OrderSummaryPage } = await import(
            '@/app/order-summary/page'
          );

          const { unmount } = render(<OrderSummaryPage />);

          // Wait for hydration
          await waitFor(() => {
            expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument();
          });

          const placeOrderButton = screen.getByRole('button', { name: /place order/i });

          // Perform the first click
          await act(async () => {
            fireEvent.click(placeOrderButton);
          });

          // Now rapidly click the button `clickCount - 1` more times
          for (let i = 1; i < clickCount; i++) {
            await act(async () => {
              fireEvent.click(placeOrderButton);
            });
          }

          // Despite N clicks, placeOrder should be called exactly once
          expect(mockPlaceOrder).toHaveBeenCalledTimes(1);

          // The button should be disabled after the first click
          expect(placeOrderButton).toBeDisabled();

          // Resolve the promise to clean up
          await act(async () => {
            resolvePlaceOrder({ success: true, data: { orderId: 'order-abc' } });
          });

          unmount();
        },
      ),
      { numRuns: 20 },
    );
  });

  it('should disable the button (show loading state) after first click while request is in-flight', async () => {
    mockPlaceOrder.mockImplementation(() => {
      return new Promise((resolve, reject) => {
        resolvePlaceOrder = resolve;
        rejectPlaceOrder = reject;
      });
    });

    const { default: OrderSummaryPage } = await import(
      '@/app/order-summary/page'
    );

    const { unmount } = render(<OrderSummaryPage />);

    // Wait for hydration
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument();
    });

    const placeOrderButton = screen.getByRole('button', { name: /place order/i });

    // Button should be enabled initially
    expect(placeOrderButton).not.toBeDisabled();

    // Click the button
    await act(async () => {
      fireEvent.click(placeOrderButton);
    });

    // Button should now be disabled
    expect(placeOrderButton).toBeDisabled();
    expect(placeOrderButton).toHaveAttribute('aria-busy', 'true');

    // Resolve to clean up
    await act(async () => {
      resolvePlaceOrder({ success: true, data: { orderId: 'order-123' } });
    });

    unmount();
  });

  it('should re-enable the button after the request resolves successfully', async () => {
    // For this test we need to keep the cart items after resolution
    // But the page navigates away on success, so we test with failure scenario
    mockPlaceOrder.mockImplementation(() => {
      return new Promise((resolve, reject) => {
        resolvePlaceOrder = resolve;
        rejectPlaceOrder = reject;
      });
    });

    const { default: OrderSummaryPage } = await import(
      '@/app/order-summary/page'
    );

    const { unmount } = render(<OrderSummaryPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument();
    });

    const placeOrderButton = screen.getByRole('button', { name: /place order/i });

    // Click to start request
    await act(async () => {
      fireEvent.click(placeOrderButton);
    });

    // Should be disabled
    expect(placeOrderButton).toBeDisabled();

    // Resolve with failure to keep on page
    await act(async () => {
      resolvePlaceOrder({
        success: false,
        error: { category: 'network', message: 'Network error' },
      } as unknown as { success: true; data: { orderId: string } });
    });

    // Button should be re-enabled after resolution
    await waitFor(() => {
      expect(placeOrderButton).not.toBeDisabled();
    });

    unmount();
  });

  it('should re-enable the button after the request rejects (error)', async () => {
    mockPlaceOrder.mockImplementation(() => {
      return new Promise((resolve, reject) => {
        resolvePlaceOrder = resolve;
        rejectPlaceOrder = reject;
      });
    });

    const { default: OrderSummaryPage } = await import(
      '@/app/order-summary/page'
    );

    const { unmount } = render(<OrderSummaryPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument();
    });

    const placeOrderButton = screen.getByRole('button', { name: /place order/i });

    // Click to start request
    await act(async () => {
      fireEvent.click(placeOrderButton);
    });

    expect(placeOrderButton).toBeDisabled();

    // Reject the promise (simulating unexpected error)
    await act(async () => {
      rejectPlaceOrder(new Error('Unexpected failure'));
    });

    // Button should be re-enabled
    await waitFor(() => {
      expect(placeOrderButton).not.toBeDisabled();
    });

    unmount();
  });
});
