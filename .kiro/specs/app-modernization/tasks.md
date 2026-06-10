# Implementation Plan: App Modernization

## Overview

Complete modernization of the Bite a Bit food ordering app from prototype to production-ready. Implementation proceeds in layers: project setup and tooling, design system tokens and primitives, state management, service layer, feature pages (home → menu → cart → order → nutrition), animations, and testing. Each step builds incrementally on the previous, ensuring no orphaned code.

## Tasks

- [x] 1. Project setup, dependency management, and tooling
  - [x] 1.1 Update package.json: remove @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, react-icons; add zustand, framer-motion, lucide-react as dependencies; add vitest, @testing-library/react, @testing-library/jest-dom, jsdom, @vitejs/plugin-react, husky, lint-staged, prettier as devDependencies
    - Remove unused packages and add all new dependencies with pinned versions
    - _Requirements: 17.2_

  - [x] 1.2 Create project folder structure and configuration files
    - Create directories: src/components/ui/, src/components/layout/, src/components/home/, src/components/menu/, src/components/cart/, src/components/order/, src/components/nutrition/, src/components/shared/, src/stores/, src/services/, src/hooks/, src/types/, src/utils/, src/__tests__/stores/, src/__tests__/services/, src/__tests__/components/, src/__tests__/utils/
    - Create vitest.config.ts with jsdom environment, globals, setup file, and coverage thresholds (70% lines for stores/, services/, utils/)
    - Create src/__tests__/setup.ts with @testing-library/jest-dom imports
    - Create .prettierrc with printWidth, tabWidth, singleQuote, trailingComma settings
    - Configure husky pre-commit hook with lint-staged running eslint and prettier on staged files
    - Update package.json scripts: add "test": "vitest --run", "test:watch": "vitest", "test:coverage": "vitest --run --coverage", "format": "prettier --write src/", "prepare": "husky"
    - _Requirements: 17.1, 17.2, 17.4, 15.1_

  - [x] 1.3 Create shared TypeScript type definitions
    - Create src/types/menu.ts with MenuItem interface
    - Create src/types/cart.ts with CartItem and CartState interfaces
    - Create src/types/order.ts with Order and OrderItem interfaces
    - Create src/types/user.ts with UserSession interface
    - Create src/types/common.ts with Result<T> discriminated union, ErrorCategory type, ThemePreference type
    - All types as defined in the design document
    - _Requirements: 17.3, 16.1_

  - [x] 1.4 Create environment variable configuration and Firebase initialization
    - Create src/services/firebase.ts that reads NEXT_PUBLIC_FIREBASE_* env vars, validates they exist and are non-empty (throw descriptive error if missing), and initializes Firebase app
    - Create .env.local.example documenting required variables
    - _Requirements: 16.3, 16.4_

- [x] 2. Design system foundation: tokens and primitive components
  - [x] 2.1 Implement design tokens in globals.css
    - Replace existing globals.css with full CSS custom properties for colors (light + dark), typography (Inter font, 5+ sizes), spacing scale (8 steps, 4px base), border radii (sm/md/lg/xl/pill), shadows (3 elevations), transitions, and layout breakpoints
    - Add [data-theme="dark"] overrides for all color tokens
    - Add responsive layout rules: max-width 480px below 768px, fill to 768px for tablet, center at 1280px for desktop
    - Add @media (prefers-reduced-motion: reduce) to disable animations
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 2.4, 2.5, 13.7_

  - [x] 2.2 Build Button component
    - Create src/components/ui/Button.tsx with variants (primary, secondary, ghost, danger), sizes (sm, md, lg), loading state, disabled state, fullWidth option
    - Apply design tokens, min 44×44px tap target, focus ring (2px, 3:1 contrast), hover scale 1.02x, press 0.98x via Framer Motion
    - _Requirements: 1.3, 1.4, 10.2, 10.3, 13.1, 13.8_

  - [x] 2.3 Build Card component
    - Create src/components/ui/Card.tsx with variants (elevated, flat, glass), padding options, pressable prop
    - Border-radius 12px min, soft shadow, glassmorphism variant with backdrop-blur, press animation via Framer Motion
    - _Requirements: 1.3, 1.4, 10.3_

  - [x] 2.4 Build Input component
    - Create src/components/ui/Input.tsx with label, type (text/tel/email/search), value, onChange, error, placeholder, icon, disabled props
    - Floating label animation, border-radius 8px, error state with inline message, focus ring, left icon slot
    - _Requirements: 1.3, 1.4, 12.3_

  - [x] 2.5 Build Badge, Skeleton, Toast, Modal, and IconButton components
    - Create src/components/ui/Badge.tsx for diet badges and cart count
    - Create src/components/ui/Skeleton.tsx with shimmer animation (1200ms cycle), variants (text, circular, rectangular, card), respects prefers-reduced-motion
    - Create src/components/ui/Toast.tsx with slide-in animation, auto-dismiss (5s default), action button, ARIA live region (assertive for errors, polite for info), swipe/X dismiss
    - Create src/components/ui/Modal.tsx with focus trapping, aria-modal, escape to close, return focus to trigger
    - Create src/components/ui/IconButton.tsx with 44×44px min target, aria-label required
    - _Requirements: 1.3, 10.5, 12.1, 13.2, 13.5, 13.6, 13.8_

  - [x] 2.6 Build DonutChart component
    - Create src/components/ui/DonutChart.tsx with SVG donut rendering, animated segment drawing on mount, center label for calories, color-coded segments, aria-label describing percentages
    - _Requirements: 9.2, 9.5, 13.2_

- [x] 3. State management layer (Zustand stores)
  - [x] 3.1 Implement cart store
    - Create src/stores/cartStore.ts with Zustand + persist middleware (key: "bite-a-bit-cart")
    - State: items array; Actions: addItem, removeItem, increaseQuantity, decreaseQuantity, clearCart
    - Derived selectors: getTotalCount, getTotalPrice, getItemsByCategory
    - addItem checks item.available, enforces max 50 per item on increase
    - Persist to localStorage within 500ms of mutation
    - Hydration validation: discard corrupted slice, reset to defaults
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 14.1, 14.4, 14.5, 14.6_

  - [x] 3.2 Implement user store
    - Create src/stores/userStore.ts with Zustand + persist middleware (key: "bite-a-bit-user")
    - State: session (UserSession | null), isLoading; Actions: login, logout, setRestaurantName
    - login calls authService, returns Result
    - logout resets session, clears localStorage entry
    - Hydration validation on load
    - _Requirements: 14.2, 14.4, 14.5, 14.7_

  - [x] 3.3 Implement UI store
    - Create src/stores/uiStore.ts with Zustand + persist middleware (key: "bite-a-bit-ui")
    - State: theme (ThemePreference), resolvedTheme ('light'|'dark'), activeNav, toasts array, loadingStates record
    - Actions: setTheme, setActiveNav, addToast, removeToast, setLoading
    - Theme resolution: detect system preference via matchMedia, listen for changes, apply data-theme attribute to document
    - Persist theme preference to localStorage
    - _Requirements: 2.1, 2.2, 2.3, 2.8, 14.3, 14.4, 14.5_

  - [x] 3.4 Implement menu cache store
    - Create src/stores/menuCacheStore.ts with Zustand + persist middleware (key: "bite-a-bit-menu-cache")
    - State: items, lastFetchedAt, isStale; Actions: setItems, invalidate, shouldRefresh
    - Stale-while-revalidate: stale after 5 min, force refresh after 30 min
    - _Requirements: 11.3, 14.4, 14.5_

  - [x] 3.5 Write unit tests for cart store
    - Test add item, remove item, increase quantity, decrease quantity, clear cart
    - Test computed values: getTotalCount, getTotalPrice, getItemsByCategory
    - Test max quantity enforcement (50), unavailable item rejection
    - _Requirements: 15.2_

  - [x] 3.6 Write property test for cart total integrity
    - **Property 1: Cart Total Integrity**
    - Verify totalPrice always equals sum of (item.price × item.quantity) for all items after any sequence of add/remove/increase/decrease operations
    - **Validates: Requirements 6.2, 6.3, 14.1**

- [x] 4. Service layer
  - [x] 4.1 Implement Firebase service with interface
    - Create src/services/firebaseService.ts implementing IFirebaseService interface
    - Functions: getMenuItems, createUser, placeOrder, getOrderStatus
    - 10-second timeout on all Firestore operations
    - Map Firestore errors to typed ErrorCategory in Result union
    - Request deduplication: cache identical requests for 5 seconds
    - Never expose internal Firestore error details
    - _Requirements: 16.1, 16.2, 16.5, 16.6_

  - [x] 4.2 Implement auth service
    - Create src/services/authService.ts implementing IAuthService interface
    - Validates name (1–50 chars, letters + spaces) and phone (10 digits) before network call
    - Calls firebaseService.createUser on valid input
    - Returns typed Result<UserSession>
    - _Requirements: 4.2, 4.3, 12.3, 16.6_

  - [x] 4.3 Implement logger service
    - Create src/services/logger.ts with logError, logWarn, logInfo functions
    - Each log entry includes: timestamp (ISO 8601), level, type, message, context (component, action, metadata)
    - Logs to browser console with structured format
    - _Requirements: 12.5_

  - [x] 4.4 Create utility functions
    - Create src/utils/validation.ts with validateName, validatePhone functions
    - Create src/utils/formatters.ts with formatPrice, formatTime helpers
    - Create src/utils/nutrition.ts with calculateTotals, calculateMacroPercentages, getProteinRatio functions
    - Create src/utils/storage.ts with safe localStorage get/set with JSON parse error handling
    - _Requirements: 4.2, 9.1, 9.3, 9.4, 12.4_

  - [x] 4.5 Write property test for validation before network
    - **Property 6: Validation Before Network**
    - Verify no network auth request is made unless client-side validation passes (name: 1–50 chars; phone: 10 digits)
    - Mock firebaseService and assert it is never called when inputs are invalid
    - **Validates: Requirements 4.2, 4.3, 12.3**

  - [x] 4.6 Write property test for request deduplication
    - **Property 5: Request Deduplication**
    - Verify for any (functionName, params) pair, at most one Firestore request is in-flight within a 5-second window
    - **Validates: Requirements 16.5**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Layout shell and navigation
  - [x] 6.1 Implement ThemeToggle component
    - Create src/components/layout/ThemeToggle.tsx reading/writing to uiStore
    - Sun/moon icon from lucide-react, 44×44px tap target, keyboard operable (Enter/Space)
    - Accessible label: "Switch to dark/light mode"
    - Theme applied within 200ms of toggle
    - _Requirements: 2.3, 2.7, 13.1, 13.2, 13.8_

  - [x] 6.2 Implement BottomTabBar and Sidebar components
    - Create src/components/layout/BottomTabBar.tsx for viewports below 768px: fixed bottom, 56–64px height, icons + labels for Home, Menu, Cart, Profile
    - Create src/components/layout/Sidebar.tsx for viewports 768px+: fixed left, 240–280px width, nav links, user info, theme toggle
    - Active item: filled icon variant + accent background
    - Cart badge showing item count (1–99, "99+" for >99)
    - Keyboard navigation: Tab between items, Arrow keys within group
    - ARIA landmarks, accessible names matching visible labels
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 13.1, 13.4, 13.5_

  - [x] 6.3 Implement NavigationShell and PageTransition
    - Create src/components/layout/NavigationShell.tsx that renders BottomTabBar or Sidebar based on viewport width, wraps children in <main> with ARIA landmark
    - Switch between layouts within 150ms on breakpoint change without losing active state
    - Create src/components/layout/PageTransition.tsx wrapping content with Framer Motion AnimatePresence: fade + 20px slide, 300ms ease-out, respects prefers-reduced-motion
    - _Requirements: 3.7, 10.1, 10.6, 13.4_

  - [x] 6.4 Update root layout.tsx
    - Rewrite src/app/layout.tsx: import Inter font via next/font, wrap app in providers (Zustand hydration), include NavigationShell, apply data-theme attribute from uiStore, add ErrorBoundary at app level
    - Add metadata (title, description)
    - _Requirements: 1.2, 2.1, 2.6, 12.2, 17.1_

  - [x] 6.5 Write property test for theme consistency
    - **Property 3: Theme Consistency**
    - Verify resolvedTheme in uiStore always matches the data-theme attribute on <html> after any theme toggle or system preference change
    - **Validates: Requirements 2.1, 2.6**

  - [x] 6.6 Write property test for navigation state sync
    - **Property 4: Navigation State Sync**
    - Verify activeNav in uiStore always reflects the current route pathname after any navigation event
    - **Validates: Requirements 3.3, 3.7**

- [x] 7. Home page and authentication
  - [x] 7.1 Implement LoginForm component
    - Create src/components/home/LoginForm.tsx: name input (1–50 chars), phone input (10 digits, numeric mask)
    - Inline validation on blur and submit, calls userStore.login on valid input
    - Loading state on button during auth, error toast on failure (5s), preserves form input on error
    - Redirects to /menu on success within 500ms
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 12.3_

  - [x] 7.2 Implement HeroSection and BannerCarousel components
    - Create src/components/home/HeroSection.tsx: restaurant name display, default "bbq_in" if no URL param, QR scan prompt when no restaurant detected
    - Create src/components/home/BannerCarousel.tsx: auto-advance every 5s, crossfade transitions (≤700ms), dot indicators, swipe gesture support, static display for <2 banners
    - _Requirements: 4.1, 4.6, 4.7, 4.8_

  - [x] 7.3 Implement Home page
    - Rewrite src/app/page.tsx: compose HeroSection, BannerCarousel, LoginForm
    - Read restaurant name from URL params
    - _Requirements: 4.1, 4.7_

- [x] 8. Menu browsing page
  - [x] 8.1 Create custom hooks for menu data
    - Create src/hooks/useDebounce.ts with configurable delay
    - Create src/hooks/useMenuData.ts implementing stale-while-revalidate logic: check menuCacheStore, fetch from firebaseService with 10s timeout, show skeleton during fetch, handle errors with retry
    - Create src/hooks/useMediaQuery.ts for responsive breakpoint detection
    - Create src/hooks/useTheme.ts for theme resolution logic
    - Create src/hooks/useToast.ts for toast management convenience
    - _Requirements: 5.1, 5.8, 11.3_

  - [x] 8.2 Implement MenuCard and MenuCardExpanded components
    - Create src/components/menu/MenuCard.tsx: image (Next.js Image with blur placeholder), name, price, rating (star icon), prep time, diet badge, Add button (or quantity stepper if in cart)
    - Apply React.memo, press animation, disabled state for unavailable items
    - Create src/components/menu/MenuCardExpanded.tsx (dynamic import): full details overlay with description, ingredients, allergens, nutritional info, pairing suggestions
    - _Requirements: 5.2, 5.7, 6.8, 10.3, 11.2, 11.5_

  - [x] 8.3 Implement CategoryFilter, SearchBar, SortDropdown components
    - Create src/components/menu/CategoryFilter.tsx: filter by category with animated transition (300ms)
    - Create src/components/menu/SearchBar.tsx: debounced input (300ms), highlight matching text
    - Create src/components/menu/SortDropdown.tsx: sort options (price low-high, price high-low, rating, prep time), layout animation on reorder (300ms)
    - _Requirements: 5.3, 5.4, 5.5, 5.6_

  - [x] 8.4 Implement MenuGrid and FloatingCartBar
    - Create src/components/menu/MenuGrid.tsx: renders grid of MenuCards, skeleton loading (6 placeholders), error state with retry, empty state, staggered entry animation, layout animation on filter/sort
    - Create src/components/menu/FloatingCartBar.tsx: fixed bottom position (above bottom nav on mobile), shows total count + price, slide-up/down animations, navigates to /order-summary
    - _Requirements: 5.1, 5.5, 5.8, 6.6, 6.7, 10.4, 10.5_

  - [x] 8.5 Implement Menu page
    - Rewrite src/app/menu/page.tsx: compose useMenuData hook, CategoryFilter, SearchBar, SortDropdown, MenuGrid, FloatingCartBar
    - Add auth guard: redirect to / if not authenticated
    - Apply useMemo for filtered/sorted menu list
    - _Requirements: 5.1, 5.2, 11.1, 11.5_

  - [x] 8.6 Write property test for authentication gate
    - **Property 2: Authentication Gate**
    - Verify pages /menu, /order-summary, /order-confirmation, /nutrition-info redirect to / when userStore.session.isAuthenticated is false
    - **Validates: Requirements 4.5, 7.8**

- [x] 9. Cart and order flow
  - [x] 9.1 Implement cart components
    - Create src/components/cart/CartItemRow.tsx: item name, unit price, quantity stepper (+/-), line subtotal, apply React.memo
    - Create src/components/cart/CartSummary.tsx: items grouped by dish_type, category subtotals, grand total (1.5x font size)
    - Create src/components/cart/EmptyCart.tsx: illustration, browse menu prompt
    - _Requirements: 6.2, 6.3, 6.7, 7.1, 7.2_

  - [x] 9.2 Implement Order Summary page
    - Rewrite src/app/order-summary/page.tsx: display cart items grouped by category, Place Order button
    - On Place Order: validate userId + restaurantName exist, show loading/disable button, call firebaseService.placeOrder with 15s timeout
    - On success: clear cart, store orderId in localStorage, navigate to /order-confirmation
    - On failure: error toast with retry, cart preserved
    - Empty cart state with link to menu
    - Auth guard: redirect to / if not authenticated
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [x] 9.3 Write property test for order idempotency
    - **Property 7: Order Idempotency**
    - Verify Place Order button is disabled after first click until the request resolves, preventing duplicate submissions
    - **Validates: Requirements 7.4**

  - [x] 9.4 Implement Order Confirmation page
    - Rewrite src/app/order-confirmation/page.tsx: display order status heading, estimated prep time, list of items with status (preparing/ready/served), addedBy, and prep time
    - "Check Nutrition Balance" button navigates to /nutrition-info
    - "Add More" button navigates to /menu while retaining order in localStorage
    - Empty state when no order data in localStorage
    - Auth guard
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 9.5 Implement Nutrition Info page
    - Rewrite src/app/nutrition-info/page.tsx: calculate total calories, carbs, protein, fat from order items × quantity
    - Render DonutChart with macronutrient percentages, total calories in center
    - Display legend with color indicators and rounded percentage values
    - Show contextual message based on protein ratio (≥30% encouraging, <30% suggestion)
    - Empty state when no items
    - Auth guard
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Error handling, accessibility, and performance
  - [x] 11.1 Implement ErrorBoundary and shared components
    - Create src/components/shared/ErrorBoundary.tsx: React Error Boundary catching unhandled errors, fallback UI with error message and "Try Again" button that reloads page component
    - Create src/components/shared/EmptyState.tsx: reusable empty state with icon, message, action button
    - Create src/components/shared/LoadingScreen.tsx: full-page loading indicator
    - _Requirements: 12.1, 12.2, 12.4_

  - [ ] 11.2 Add accessibility enhancements across all components
    - Ensure heading hierarchy (one h1 per page, no skipped levels) across all pages
    - Add ARIA live regions for toast notifications and cart count updates
    - Verify all icon buttons have aria-label
    - Ensure focus indicators (2px outline, 3:1 contrast) on all interactive elements
    - Add keyboard navigation support for modal focus trapping
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ] 11.3 Apply performance optimizations
    - Add dynamic imports for DonutChart, MenuCardExpanded, Modal components
    - Ensure all food images use Next.js Image component with blur placeholder and responsive sizes
    - Verify React.memo applied to MenuCard, CartItemRow, OrderItemCard
    - Verify useMemo for cart totals, filtered menu list, nutrition calculations
    - _Requirements: 11.1, 11.2, 11.5_

  - [ ] 11.4 Write property test for cache freshness
    - **Property 8: Cache Freshness**
    - Verify menu data served from cache always has a lastFetchedAt timestamp, and data older than 30 minutes is never served without a background refresh attempt
    - **Validates: Requirements 11.3**

- [ ] 12. Integration testing and code quality
  - [ ] 12.1 Write integration tests for auth flow
    - Test successful login: form submit → session stored in userStore → redirect to /menu
    - Test validation rejection: invalid name/phone → inline error messages → no network call
    - Test network failure: mock rejected service call → error toast → form input preserved
    - _Requirements: 15.3_

  - [ ] 12.2 Write component tests for menu browsing
    - Test initial render displays expected number of item cards from mock data
    - Test category filter reduces visible items to only that category
    - Test sort option reorders items correctly
    - Test tapping item card expands to show description and allergens
    - _Requirements: 15.4_

  - [ ] 12.3 Write unit tests for utilities and services
    - Test validation functions (validateName, validatePhone) with valid and edge-case inputs
    - Test nutrition calculations (totals, percentages, protein ratio)
    - Test formatters (formatPrice, formatTime)
    - Test firebaseService error mapping and request deduplication
    - _Requirements: 15.2, 15.5, 15.6_

  - [ ] 12.4 Configure code quality tooling and final README
    - Verify husky + lint-staged configuration works (lint + format on pre-commit)
    - Update README.md with: project setup steps, folder structure overview, available npm scripts, required environment variables with examples, deployment instructions
    - _Requirements: 17.2, 17.5_

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties defined in the design (8 properties total)
- Unit tests validate specific examples and edge cases
- The design uses TypeScript throughout — all implementations use TypeScript
- All Firebase interactions are mocked in tests for deterministic results
- The existing route structure is preserved; order-arrival merges into order-confirmation

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6"] },
    { "id": 4, "tasks": ["3.1", "3.2", "3.3", "3.4", "4.3", "4.4"] },
    { "id": 5, "tasks": ["4.1", "4.2", "3.5", "3.6"] },
    { "id": 6, "tasks": ["4.5", "4.6", "6.1"] },
    { "id": 7, "tasks": ["6.2", "6.3"] },
    { "id": 8, "tasks": ["6.4", "6.5", "6.6"] },
    { "id": 9, "tasks": ["7.1", "7.2", "8.1"] },
    { "id": 10, "tasks": ["7.3", "8.2", "8.3"] },
    { "id": 11, "tasks": ["8.4", "8.5"] },
    { "id": 12, "tasks": ["8.6", "9.1"] },
    { "id": 13, "tasks": ["9.2", "9.4", "9.5"] },
    { "id": 14, "tasks": ["9.3", "11.1"] },
    { "id": 15, "tasks": ["11.2", "11.3"] },
    { "id": 16, "tasks": ["11.4", "12.1", "12.2", "12.3"] },
    { "id": 17, "tasks": ["12.4"] }
  ]
}
```
