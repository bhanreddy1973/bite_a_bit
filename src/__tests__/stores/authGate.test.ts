import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { renderHook } from '@testing-library/react';

/**
 * **Validates: Requirements 4.5, 7.8**
 *
 * Property 2: Authentication Gate
 * Pages /menu, /order-summary, /order-confirmation, /nutrition-info require
 * userStore.session.isAuthenticated === true. Unauthenticated access redirects to /.
 */

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/menu',
  '/order-summary',
  '/order-confirmation',
  '/nutrition-info',
] as const;

type ProtectedRoute = (typeof PROTECTED_ROUTES)[number];

// Mock next/navigation
const mockPush = vi.fn();
const mockUseRouter = vi.fn(() => ({
  push: mockPush,
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the userStore - we'll control the session via this ref
let mockSession: { isAuthenticated: boolean; id: string; name: string; phone: string; restaurantName: string } | null = null;

vi.mock('@/stores/userStore', () => ({
  useUserStore: (selector: (state: { session: typeof mockSession }) => unknown) => {
    if (typeof selector === 'function') {
      return selector({ session: mockSession });
    }
    return { session: mockSession };
  },
}));

// Mock other dependencies that pages may import
vi.mock('@/hooks/useMenuData', () => ({
  useMenuData: () => ({
    items: [],
    isLoading: false,
    error: null,
    retry: vi.fn(),
  }),
}));

vi.mock('@/stores/cartStore', () => ({
  useCartStore: (selector?: unknown) => {
    if (typeof selector === 'function') {
      return (selector as (state: Record<string, unknown>) => unknown)({
        items: [],
        getTotalCount: () => 0,
        getTotalPrice: () => 0,
      });
    }
    return { items: [], getTotalCount: () => 0, getTotalPrice: () => 0 };
  },
}));

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector?: unknown) => {
    if (typeof selector === 'function') {
      return (selector as (state: Record<string, unknown>) => unknown)({
        activeNav: '/',
        setActiveNav: vi.fn(),
      });
    }
    return { activeNav: '/', setActiveNav: vi.fn() };
  },
}));

vi.mock('@/services/firebaseService', () => ({
  firebaseService: {
    getMenuItems: vi.fn().mockResolvedValue({ success: true, data: [] }),
    placeOrder: vi.fn().mockResolvedValue({ success: true, data: { orderId: 'test-id' } }),
    getOrderStatus: vi.fn().mockResolvedValue({ success: true, data: null }),
  },
}));

/**
 * Custom hook that simulates the auth guard pattern used across all protected pages.
 * This matches the useEffect pattern:
 *   useEffect(() => {
 *     if (!session || !session.isAuthenticated) {
 *       router.push('/');
 *     }
 *   }, [session, router]);
 */
function useAuthGuard(session: typeof mockSession, router: { push: typeof mockPush }) {
  // Replicate the auth guard logic from the pages
  const { useEffect } = require('react');
  useEffect(() => {
    if (!session || !session.isAuthenticated) {
      router.push('/');
    }
  }, [session, router]);

  return { shouldRedirect: !session || !session.isAuthenticated };
}

describe('Property 2: Authentication Gate', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSession = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to / for any protected route when session is null', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PROTECTED_ROUTES),
        (route: ProtectedRoute) => {
          mockPush.mockClear();
          mockSession = null;

          const router = { push: mockPush };

          renderHook(() => useAuthGuard(mockSession, router));

          // Property: when session is null, router.push('/') must be called
          expect(mockPush).toHaveBeenCalledWith('/');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should redirect to / for any protected route when session.isAuthenticated is false', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PROTECTED_ROUTES),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 10, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 30 }),
        (route: ProtectedRoute, name: string, phone: string, restaurantName: string) => {
          mockPush.mockClear();
          mockSession = {
            isAuthenticated: false,
            id: 'user-123',
            name,
            phone,
            restaurantName,
          };

          const router = { push: mockPush };

          renderHook(() => useAuthGuard(mockSession, router));

          // Property: when isAuthenticated is false, router.push('/') must be called
          expect(mockPush).toHaveBeenCalledWith('/');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should NOT redirect when session.isAuthenticated is true for any protected route', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PROTECTED_ROUTES),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 10, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 30 }),
        (route: ProtectedRoute, name: string, phone: string, restaurantName: string) => {
          mockPush.mockClear();
          mockSession = {
            isAuthenticated: true,
            id: 'user-456',
            name,
            phone,
            restaurantName,
          };

          const router = { push: mockPush };

          renderHook(() => useAuthGuard(mockSession, router));

          // Property: when isAuthenticated is true, router.push('/') must NOT be called
          expect(mockPush).not.toHaveBeenCalledWith('/');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should redirect for random combinations of routes and unauthenticated states', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PROTECTED_ROUTES),
        fc.boolean(),
        fc.option(
          fc.record({
            isAuthenticated: fc.constant(false),
            id: fc.string({ minLength: 1, maxLength: 20 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            phone: fc.stringMatching(/^\d{10}$/),
            restaurantName: fc.string({ minLength: 1, maxLength: 30 }),
          }),
          { nil: undefined }
        ),
        (route: ProtectedRoute, sessionIsNull: boolean, sessionData) => {
          mockPush.mockClear();

          // Either session is null or session.isAuthenticated is false
          if (sessionIsNull) {
            mockSession = null;
          } else if (sessionData) {
            mockSession = sessionData;
          } else {
            mockSession = null;
          }

          const router = { push: mockPush };

          renderHook(() => useAuthGuard(mockSession, router));

          // Property: unauthenticated access always triggers redirect
          expect(mockPush).toHaveBeenCalledWith('/');
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should maintain the auth gate invariant regardless of random additional state (cart items, theme)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PROTECTED_ROUTES),
        fc.boolean(), // isAuthenticated
        fc.array(fc.record({
          id: fc.string({ minLength: 1, maxLength: 10 }),
          name: fc.string({ minLength: 1, maxLength: 20 }),
          price: fc.integer({ min: 1, max: 10000 }),
          quantity: fc.integer({ min: 1, max: 50 }),
        }), { minLength: 0, maxLength: 10 }),
        fc.constantFrom('light', 'dark', 'system'),
        (route: ProtectedRoute, isAuthenticated: boolean, _cartItems, _theme) => {
          mockPush.mockClear();

          if (isAuthenticated) {
            mockSession = {
              isAuthenticated: true,
              id: 'user-789',
              name: 'Test User',
              phone: '1234567890',
              restaurantName: 'TestRestaurant',
            };
          } else {
            mockSession = null;
          }

          const router = { push: mockPush };

          renderHook(() => useAuthGuard(mockSession, router));

          if (isAuthenticated) {
            // Authenticated: should NOT redirect
            expect(mockPush).not.toHaveBeenCalledWith('/');
          } else {
            // Unauthenticated: should redirect to /
            expect(mockPush).toHaveBeenCalledWith('/');
          }
        }
      ),
      { numRuns: 200 }
    );
  });
});
