# Technical Design Document

## Overview

This document describes the architecture and technical design for the complete modernization of the Bite a Bit food ordering application. The system is a Next.js 15 App Router application with a Firebase backend, redesigned with an Apple-inspired premium aesthetic, production-grade state management, comprehensive testing, and performance optimizations.

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Next.js App Router (v15)                        │    │
│  │                                                                     │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │    │
│  │  │  Layout Shell │  │  Page Routes │  │   Design System Layer    │  │    │
│  │  │  (Nav + Theme)│  │  (6 routes)  │  │   (Tokens + Primitives)  │  │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────────────────────┘  │    │
│  │         │                  │                                         │    │
│  │  ┌──────┴──────────────────┴───────────────────────────────────┐    │    │
│  │  │                    Component Layer                           │    │    │
│  │  │  Feature Components (Menu, Cart, Order, Nutrition, Auth)     │    │    │
│  │  └──────────────────────────┬──────────────────────────────────┘    │    │
│  │                             │                                        │    │
│  │  ┌──────────────────────────┴──────────────────────────────────┐    │    │
│  │  │                   State Management (Zustand)                 │    │    │
│  │  │   ┌─────────┐  ┌──────────┐  ┌────────┐  ┌────────────┐   │    │    │
│  │  │   │CartSlice │  │UserSlice │  │UISlice │  │ MenuCache  │   │    │    │
│  │  │   └─────────┘  └──────────┘  └────────┘  └────────────┘   │    │    │
│  │  └──────────────────────────┬──────────────────────────────────┘    │    │
│  │                             │                                        │    │
│  │  ┌──────────────────────────┴──────────────────────────────────┐    │    │
│  │  │                  Service Layer                               │    │    │
│  │  │   ┌─────────────────┐  ┌───────────────┐  ┌────────────┐   │    │    │
│  │  │   │ Firebase Service │  │ Auth Service  │  │  Logger    │   │    │    │
│  │  │   └────────┬────────┘  └───────┬───────┘  └────────────┘   │    │    │
│  │  │            │                    │                            │    │    │
│  │  └────────────┼────────────────────┼────────────────────────────┘    │    │
│  │               │                    │                                  │    │
│  └───────────────┼────────────────────┼──────────────────────────────────┘    │
│                  │                    │                                        │
│  ┌───────────────┴────────────────────┴──────────────────────────────────┐    │
│  │                       localStorage (Persistence)                       │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ HTTPS
                                     ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                            FIREBASE BACKEND                                    │
│                                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │    Firestore     │  │  Cloud Functions │  │     Firebase Hosting     │    │
│  │   (Database)     │  │  (Server Logic)  │  │   (Static + SSR)         │    │
│  │                  │  │                  │  │                          │    │
│  │  - restaurants   │  │  - createOrder   │  │  - Next.js App Hosting   │    │
│  │  - menu_items    │  │  - createUser    │  │                          │    │
│  │  - orders        │  │                  │  │                          │    │
│  │  - users         │  │                  │  │                          │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘    │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (providers, shell, fonts)
│   ├── page.tsx                  # Home / Login page
│   ├── menu/
│   │   └── page.tsx              # Menu browsing page
│   ├── order-summary/
│   │   └── page.tsx              # Cart review / order placement
│   ├── order-confirmation/
│   │   └── page.tsx              # Post-order confirmation & tracking
│   ├── nutrition-info/
│   │   └── page.tsx              # Nutritional breakdown
│   ├── globals.css               # Design tokens + base styles
│   └── favicon.ico
├── components/
│   ├── ui/                       # Design system primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Toast.tsx
│   │   ├── Modal.tsx
│   │   ├── IconButton.tsx
│   │   └── DonutChart.tsx
│   ├── layout/                   # Layout components
│   │   ├── NavigationShell.tsx
│   │   ├── BottomTabBar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── PageTransition.tsx
│   ├── home/                     # Home page components
│   │   ├── HeroSection.tsx
│   │   ├── BannerCarousel.tsx
│   │   └── LoginForm.tsx
│   ├── menu/                     # Menu page components
│   │   ├── MenuGrid.tsx
│   │   ├── MenuCard.tsx
│   │   ├── MenuCardExpanded.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SortDropdown.tsx
│   │   └── FloatingCartBar.tsx
│   ├── cart/                     # Cart components
│   │   ├── CartItemRow.tsx
│   │   ├── CartSummary.tsx
│   │   └── EmptyCart.tsx
│   ├── order/                    # Order components
│   │   ├── OrderItemCard.tsx
│   │   ├── OrderStatusBadge.tsx
│   │   └── OrderTimeline.tsx
│   ├── nutrition/                # Nutrition components
│   │   ├── NutritionChart.tsx
│   │   ├── MacroLegend.tsx
│   │   └── NutritionMessage.tsx
│   └── shared/                   # Shared components
│       ├── ErrorBoundary.tsx
│       ├── EmptyState.tsx
│       └── LoadingScreen.tsx
├── stores/                       # Zustand state management
│   ├── cartStore.ts
│   ├── userStore.ts
│   ├── uiStore.ts
│   └── menuCacheStore.ts
├── services/                     # Service layer
│   ├── firebase.ts               # Firebase initialization
│   ├── firebaseService.ts        # Firestore CRUD operations
│   ├── authService.ts            # Authentication logic
│   └── logger.ts                 # Structured error logging
├── hooks/                        # Custom React hooks
│   ├── useTheme.ts
│   ├── useMediaQuery.ts
│   ├── useDebounce.ts
│   ├── useMenuData.ts
│   └── useToast.ts
├── types/                        # TypeScript type definitions
│   ├── menu.ts
│   ├── cart.ts
│   ├── order.ts
│   ├── user.ts
│   └── common.ts
├── utils/                        # Utility functions
│   ├── validation.ts
│   ├── formatters.ts
│   ├── nutrition.ts
│   └── storage.ts
└── __tests__/                    # Test files
    ├── stores/
    │   └── cartStore.test.ts
    ├── services/
    │   └── firebaseService.test.ts
    ├── components/
    │   ├── MenuGrid.test.tsx
    │   └── LoginForm.test.tsx
    └── utils/
        └── validation.test.ts
```

## Components and Interfaces

### Design System Primitives

#### Button Component

```typescript
// src/components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

Renders a button with:
- Rounded corners (radius-pill for primary, radius-lg for others)
- Scale animation on hover (1.02x) and press (0.98x)
- Loading spinner state that disables interaction
- Minimum touch target of 44×44px
- Accessible focus ring (2px outline, 3:1 contrast)

#### Card Component

```typescript
// src/components/ui/Card.tsx
interface CardProps {
  variant: 'elevated' | 'flat' | 'glass';
  padding?: 'sm' | 'md' | 'lg';
  pressable?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

Renders a container with:
- Border-radius: 12px minimum
- Soft shadow (elevation-1 by default, elevation-2 on hover if pressable)
- Glassmorphism variant with backdrop-blur and semi-transparent background
- Press animation (0.98x scale) when pressable

#### Input Component

```typescript
// src/components/ui/Input.tsx
interface InputProps {
  label: string;
  type: 'text' | 'tel' | 'email' | 'search';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}
```

Renders an input with:
- Floating label animation
- Border-radius: 8px
- Error state with inline message and red accent
- Focus ring with primary color
- Left icon slot for search/phone icons

#### Toast Component

```typescript
// src/components/ui/Toast.tsx
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  action?: { label: string; onClick: () => void };
  duration?: number; // default 5000ms
  onDismiss: () => void;
}
```

Renders a notification with:
- Slide-in from top animation
- Auto-dismiss after duration
- Action button for retry
- ARIA live region (assertive for errors, polite for info)
- Dismiss on swipe or X button

#### Skeleton Component

```typescript
// src/components/ui/Skeleton.tsx
interface SkeletonProps {
  variant: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number; // for text variant
}
```

Renders placeholder with:
- Shimmer gradient animation (1200ms cycle)
- Matches target content dimensions
- Respects prefers-reduced-motion

### Layout Components

#### NavigationShell

```typescript
// src/components/layout/NavigationShell.tsx
interface NavigationShellProps {
  children: React.ReactNode;
}
```

Behavior:
- Below 768px: renders `<BottomTabBar />`
- 768px and above: renders `<Sidebar />`
- Wraps children in `<main>` with ARIA landmark
- Passes cart count to badge display
- Contains the theme toggle
- Transition between layouts on breakpoint change (150ms)

#### ThemeToggle

```typescript
// src/components/layout/ThemeToggle.tsx
// No props — reads and writes to uiStore
```

Behavior:
- Displays sun/moon icon based on current theme
- Toggles between light/dark/system
- Minimum 44×44px tap target
- Accessible label: "Switch to dark/light mode"
- Keyboard operable (Enter/Space)

#### PageTransition

```typescript
// src/components/layout/PageTransition.tsx
interface PageTransitionProps {
  children: React.ReactNode;
}
```

Wraps page content with Framer Motion `AnimatePresence`:
- Fade + 20px slide on enter/exit
- Duration: 300ms, ease-out
- Respects prefers-reduced-motion (instant if enabled)

### Feature Components

#### LoginForm

```typescript
// src/components/home/LoginForm.tsx
// Uses userStore for authentication state
```

Behavior:
- Name input (1–50 chars, letters + spaces)
- Phone input (exactly 10 digits, numeric mask)
- Inline validation on blur and submit
- Calls authService.authenticateUser on submit
- Shows loading state on button during auth
- Displays error toast on failure
- Redirects to /menu on success

#### MenuGrid

```typescript
// src/components/menu/MenuGrid.tsx
interface MenuGridProps {
  items: MenuItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}
```

Behavior:
- Renders grid of `MenuCard` components
- Shows skeleton cards during loading (6 placeholders)
- Shows error state with retry button on failure
- Shows empty state when filter yields no results
- AnimatePresence for staggered card entry
- Layout animation on filter/sort changes

#### MenuCard

```typescript
// src/components/menu/MenuCard.tsx
interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  isInCart: boolean;
  cartQuantity: number;
}
```

Behavior:
- Displays image, name, price, rating, prep time, diet badge
- Add button (or quantity stepper if in cart)
- Press animation on tap
- Expands to show full details on click (description, allergens, nutrition, pairings)
- Disabled state for unavailable items

#### FloatingCartBar

```typescript
// src/components/menu/FloatingCartBar.tsx
// Reads from cartStore
```

Behavior:
- Fixed position at bottom (above bottom nav on mobile)
- Shows total count, total price
- Slide-up animation when cart goes from 0 to 1 item
- Slide-down when cart emptied
- Tapping navigates to /order-summary
- Hidden when cart is empty

#### NutritionChart (Donut Chart)

```typescript
// src/components/ui/DonutChart.tsx
interface DonutChartProps {
  segments: { label: string; value: number; color: string }[];
  centerLabel: string;
  size?: number;
}
```

Renders an SVG donut chart:
- Animated segment drawing on mount
- Center text for total calories
- Accessible via aria-label describing percentages
- Color-coded segments matching legend

## Data Models

### TypeScript Types

```typescript
// src/types/menu.ts
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  available: boolean;
  cuisine: string;
  dish_type: string;
  meal_type: string[];
  diet: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan';
  allergens: string[];
  spice_level: 'None' | 'Mild' | 'Medium' | 'Hot';
  taste_profile: string[];
  flavor_tags: string[];
  ingredients: string[];
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  is_best_seller: boolean;
  rating: number;
  review_count: number;
  prep_time: string;
  portion_size: string;
  serves: string;
  cooking_method: string;
  available_time: string[];
  occasion: string[];
  pairs_well_with: string[];
  combo_items: string[];
}

// src/types/cart.ts
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  subtotal: number; // computed: price * quantity
}

export interface CartState {
  items: CartItem[];
  totalCount: number;   // computed: sum of quantities
  totalPrice: number;   // computed: sum of subtotals
}

// src/types/order.ts
export interface Order {
  id: string;
  userId: string;
  restaurantName: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served';
  createdAt: Date;
  totalPrice: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  status: 'preparing' | 'ready' | 'served';
  prepTime: string;
  addedBy: string;
}

// src/types/user.ts
export interface UserSession {
  id: string;
  name: string;
  phone: string;
  restaurantName: string;
  isAuthenticated: boolean;
}

// src/types/common.ts
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { category: ErrorCategory; message: string } };

export type ErrorCategory =
  | 'network'
  | 'permission'
  | 'not-found'
  | 'timeout'
  | 'validation'
  | 'unknown';

export type ThemePreference = 'light' | 'dark' | 'system';
```

## State Management

### Store Architecture (Zustand)

```typescript
// src/stores/cartStore.ts
interface CartStore {
  // State
  items: CartItem[];

  // Computed (derived via selectors)
  getTotalCount: () => number;
  getTotalPrice: () => number;
  getItemsByCategory: () => Record<string, CartItem[]>;

  // Actions
  addItem: (menuItem: MenuItem) => void;
  removeItem: (menuItemId: string) => void;
  increaseQuantity: (menuItemId: string) => void;
  decreaseQuantity: (menuItemId: string) => void;
  clearCart: () => void;
}

// src/stores/userStore.ts
interface UserStore {
  // State
  session: UserSession | null;
  isLoading: boolean;

  // Actions
  login: (name: string, phone: string, restaurantName: string) => Promise<Result<UserSession>>;
  logout: () => void;
  setRestaurantName: (name: string) => void;
}

// src/stores/uiStore.ts
interface UIStore {
  // State
  theme: ThemePreference;
  resolvedTheme: 'light' | 'dark'; // actual applied theme
  activeNav: string;
  toasts: ToastData[];
  loadingStates: Record<string, boolean>;

  // Actions
  setTheme: (theme: ThemePreference) => void;
  setActiveNav: (nav: string) => void;
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  setLoading: (key: string, value: boolean) => void;
}

// src/stores/menuCacheStore.ts
interface MenuCacheStore {
  // State
  items: MenuItem[];
  lastFetchedAt: number | null;
  isStale: boolean;

  // Actions
  setItems: (items: MenuItem[]) => void;
  invalidate: () => void;
  shouldRefresh: () => boolean; // stale after 5 min, force after 30 min
}
```

### localStorage Persistence

Each store uses Zustand's `persist` middleware:
- Cart: `bite-a-bit-cart`
- User: `bite-a-bit-user`
- UI: `bite-a-bit-ui`
- Menu Cache: `bite-a-bit-menu-cache`

Hydration validation:
- On load, each slice is validated against its TypeScript structure
- Invalid slices are discarded and reset to defaults
- Validation completes within 1000ms

## Service Layer

### Firebase Service

```typescript
// src/services/firebaseService.ts
export interface IFirebaseService {
  getMenuItems(restaurantName: string): Promise<Result<MenuItem[]>>;
  createUser(name: string, phone: string, restaurantName: string): Promise<Result<UserSession>>;
  placeOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Result<{ orderId: string }>>;
  getOrderStatus(orderId: string): Promise<Result<Order>>;
}
```

Implementation details:
- Uses environment variables for config (NEXT_PUBLIC_FIREBASE_*)
- Validates env vars at initialization; throws descriptive error if missing
- 10-second timeout on all Firestore operations
- Request deduplication: caches identical requests for 5 seconds
- Maps Firestore errors to typed ErrorCategory results
- Never exposes internal Firestore error details to callers

### Auth Service

```typescript
// src/services/authService.ts
export interface IAuthService {
  authenticate(name: string, phone: string, restaurantName: string): Promise<Result<UserSession>>;
}
```

Implementation:
- Validates inputs before making network call
- Creates or retrieves user document in Firestore
- Returns typed Result with session data or error

### Logger Service

```typescript
// src/services/logger.ts
export interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  type: string;
  message: string;
  context?: Record<string, unknown>;
}

export function logError(type: string, message: string, context?: Record<string, unknown>): void;
export function logWarn(type: string, message: string, context?: Record<string, unknown>): void;
export function logInfo(type: string, message: string, context?: Record<string, unknown>): void;
```

## Design Tokens

### CSS Custom Properties

```css
/* src/app/globals.css */
:root {
  /* Colors - Light */
  --color-primary: #007AFF;
  --color-primary-hover: #0066D6;
  --color-primary-light: #E5F2FF;
  --color-secondary: #5856D6;
  --color-secondary-hover: #4B49B3;
  --color-secondary-light: #EDEDFA;
  --color-success: #34C759;
  --color-warning: #FF9500;
  --color-error: #FF3B30;

  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F2F2F7;
  --color-bg-tertiary: #E5E5EA;
  --color-surface: #FFFFFF;
  --color-surface-elevated: #FFFFFF;

  --color-text-primary: #1C1C1E;
  --color-text-secondary: #3C3C43;
  --color-text-tertiary: #8E8E93;
  --color-text-inverse: #FFFFFF;

  --color-border: #D1D1D6;
  --color-border-light: #E5E5EA;

  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-display: 34px;
  --font-size-heading: 24px;
  --font-size-title: 20px;
  --font-size-body: 16px;
  --font-size-caption: 12px;
  --font-size-label: 13px;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;

  /* Spacing (4px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-pill: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.12);

  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-normal: 300ms ease-out;
  --transition-slow: 500ms ease-out;

  /* Layout */
  --max-width-mobile: 480px;
  --max-width-tablet: 768px;
  --max-width-desktop: 1280px;
  --sidebar-width: 260px;
  --bottom-nav-height: 60px;
}

/* Dark Theme */
[data-theme="dark"] {
  --color-bg-primary: #000000;
  --color-bg-secondary: #1C1C1E;
  --color-bg-tertiary: #2C2C2E;
  --color-surface: #1C1C1E;
  --color-surface-elevated: #2C2C2E;

  --color-text-primary: #FFFFFF;
  --color-text-secondary: #EBEBF5;
  --color-text-tertiary: #8E8E93;
  --color-text-inverse: #000000;

  --color-border: #38383A;
  --color-border-light: #2C2C2E;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.5);
}
```

## Data Flow

### Authentication Flow

```
User enters name + phone
        │
        ▼
LoginForm validates input (client-side)
        │
        ├── Invalid → Show inline error
        │
        ▼ Valid
LoginForm calls userStore.login()
        │
        ▼
userStore calls authService.authenticate()
        │
        ▼
authService calls firebaseService.createUser()
        │
        ├── Network Error → Return failure Result
        │
        ▼ Success
userStore sets session, persists to localStorage
        │
        ▼
LoginForm detects success → router.push('/menu')
```

### Menu Data Flow (Stale-While-Revalidate)

```
MenuPage mounts
        │
        ▼
useMenuData hook checks menuCacheStore
        │
        ├── Cache exists & fresh (<5 min) → Return cached data immediately
        │
        ├── Cache exists & stale (5–30 min) → Return cached data, fetch in background
        │
        ├── Cache exists & expired (>30 min) → Show skeleton, fetch fresh
        │
        └── No cache → Show skeleton, fetch fresh
                │
                ▼
        firebaseService.getMenuItems(restaurantName)
                │
                ├── Timeout (10s) → Show error state with retry
                ├── Error → Show error state with retry
                │
                ▼ Success
        menuCacheStore.setItems(data)
                │
                ▼
        MenuGrid re-renders with fresh data
```

### Cart Management Flow

```
User taps Add on MenuCard
        │
        ▼
cartStore.addItem(menuItem)
        │
        ├── Check item.available → false → Show error toast, abort
        │
        ▼ Available
        Add CartItem { menuItem, quantity: 1, subtotal: price }
        │
        ▼
Recompute totalCount, totalPrice
        │
        ▼
Persist to localStorage (within 500ms)
        │
        ▼
FloatingCartBar appears (if first item) / updates count
        │
        ▼
MenuCard shows quantity stepper instead of Add button
```

### Order Placement Flow

```
User taps "Place Order" on OrderSummary
        │
        ▼
Validate: userId exists? restaurantName exists?
        │
        ├── Missing → Error toast, redirect to Home
        │
        ▼ Valid
Set loading state, disable button
        │
        ▼
firebaseService.placeOrder({ userId, restaurantName, items, status: 'pending' })
        │
        ├── Timeout (15s) → Error toast with retry
        ├── Error → Error toast with retry (cart preserved)
        │
        ▼ Success
cartStore.clearCart()
        │
        ▼
Store orderId in localStorage
        │
        ▼
router.push('/order-confirmation')
```

## Correctness Properties

### Property 1: Cart Total Integrity
`totalPrice` always equals the sum of all `item.price * item.quantity` for items in cart. Verified after every cart mutation.

**Validates: Requirements 6.2, 6.3, 14.1**

### Property 2: Authentication Gate
Pages `/menu`, `/order-summary`, `/order-confirmation`, `/nutrition-info` require `userStore.session.isAuthenticated === true`. Unauthenticated access redirects to `/`.

**Validates: Requirements 4.5, 7.8**

### Property 3: Theme Consistency
The `resolvedTheme` in uiStore always matches the `data-theme` attribute on `<html>`. No flash of wrong theme on load.

**Validates: Requirements 2.1, 2.6**

### Property 4: Navigation State Sync
The `activeNav` in uiStore always reflects the current route pathname. Navigation highlights are never stale.

**Validates: Requirements 3.3, 3.7**

### Property 5: Request Deduplication
For any given `(functionName, params)` pair, at most one Firestore request is in-flight within a 5-second window.

**Validates: Requirements 16.5**

### Property 6: Validation Before Network
No network auth request is made unless client-side validation passes (name: 1–50 chars; phone: 10 digits).

**Validates: Requirements 4.2, 4.3, 12.3**

### Property 7: Order Idempotency
The Place Order button is disabled after first click until the request resolves, preventing duplicate order submissions.

**Validates: Requirements 7.4**

### Property 8: Cache Freshness
Menu data served from cache always has a `lastFetchedAt` timestamp. Data older than 30 minutes is never served without a background refresh attempt.

**Validates: Requirements 11.3**

## Error Handling

## Error Handling Strategy

### Error Boundary Hierarchy

```
RootLayout
  └── ErrorBoundary (app-level — catches unhandled errors)
        └── NavigationShell
              └── PageTransition
                    └── ErrorBoundary (page-level — per-route recovery)
                          └── Page Content
```

### Error Categories and UI Responses

| Error Type | Detection | UI Response |
|------------|-----------|-------------|
| Network failure | fetch/Firestore rejects | Toast with retry button (5s visible) |
| Validation error | Client-side check | Inline error below field |
| Auth failure | Service returns failure Result | Error toast (5s) |
| Render crash | Error Boundary catches | Fallback UI with "Try Again" |
| Corrupt localStorage | Hydration validation fails | Reset slice, redirect to home |
| Missing env vars | Firebase init fails | Console error + empty state |

### Structured Logging

All errors logged with:
```typescript
{
  timestamp: ISO 8601 string,
  level: 'error' | 'warn' | 'info',
  type: 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'RENDER_ERROR' | ...,
  message: 'Human-readable description',
  context: { component: string, action: string, ...metadata }
}
```

## Performance Strategy

### Code Splitting

- Next.js App Router provides automatic route-based splitting
- Dynamic imports for heavy components:
  - `DonutChart` (SVG rendering)
  - `MenuCardExpanded` (detail overlay)
  - `Modal` (portal + trap focus logic)
- Target: <200KB gzipped per route

### Image Optimization

- All food images use Next.js `<Image>` component
- Automatic WebP/AVIF format selection
- Responsive sizes: `sizes="(max-width: 768px) 100vw, 33vw"`
- Blur placeholder generated from low-res base64
- Lazy loading for images below fold (200px threshold)

### Memoization Strategy

- `React.memo` on: `MenuCard`, `CartItemRow`, `OrderItemCard`
- `useMemo` on: filtered menu list, sorted menu list, cart totals, nutrition calculations
- `useCallback` on: event handlers passed to memoized children

### Caching Strategy

- Menu data: stale after 5 min, force refresh after 30 min
- Request deduplication: 5-second window for identical Firebase calls
- localStorage persistence for cart, user session, theme preference

## Accessibility Design

### Keyboard Navigation Map

| Context | Key | Action |
|---------|-----|--------|
| Navigation | Tab | Move between nav items |
| Navigation | Arrow Up/Down | Move within nav group |
| Navigation | Enter/Space | Activate nav item |
| Menu Card | Enter/Space | Expand card details |
| Menu Card | Escape | Collapse expanded card |
| Modal | Tab | Cycle through modal elements |
| Modal | Escape | Close modal |
| Cart Stepper | +/- buttons | Enter/Space to adjust |
| Theme Toggle | Enter/Space | Cycle theme |

### ARIA Implementation

- `<nav aria-label="Main navigation">` for Navigation_Shell
- `<main aria-label="Page content">` for content area
- `role="alert" aria-live="assertive"` for error toasts
- `aria-live="polite"` for cart count updates
- `role="dialog" aria-modal="true"` for modals
- All icon buttons: `aria-label` describing action
- Heading hierarchy: one h1 per page, no skipped levels

### Color Contrast Targets

- Normal text: minimum 4.5:1 ratio (both themes)
- Large text: minimum 3:1 ratio
- UI components (borders, icons): minimum 3:1
- Focus indicators: minimum 3:1 against adjacent

## Animation Specifications

### Framer Motion Variants

```typescript
// Page transitions
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

// Staggered list items
const containerVariants = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

// Button interactions
const buttonVariants = {
  hover: { scale: 1.02, boxShadow: 'var(--shadow-md)' },
  tap: { scale: 0.98 },
};

// Card press
const cardVariants = {
  tap: { scale: 0.98, transition: { duration: 0.1 } },
};

// Skeleton shimmer (CSS animation)
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### Reduced Motion

When `prefers-reduced-motion: reduce`:
- All Framer Motion animations disabled via `useReducedMotion()`
- CSS transitions set to `0ms`
- Only opacity changes retained for state feedback

## Testing Strategy

### Test Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/stores/**', 'src/services/**', 'src/utils/**'],
      thresholds: { lines: 70 },
    },
  },
});
```

### Test Categories

1. **Store Unit Tests** (cartStore, userStore, uiStore)
   - Cart: add, remove, increase, decrease, clear, computed totals
   - User: login success, login failure, logout, session hydration
   - UI: theme toggle, toast management, loading states

2. **Service Tests** (firebaseService, authService)
   - Mock Firestore SDK
   - Test success paths, error mapping, timeout handling
   - Test request deduplication logic

3. **Component Integration Tests**
   - LoginForm: render, validate, submit, error display
   - MenuGrid: render with data, filter, sort, expand card
   - CartSummary: display totals, quantity changes

4. **Utility Tests**
   - Validation functions (name, phone)
   - Nutrition calculations
   - Formatters (price, time)

## Dependencies

### New Dependencies to Add

| Package | Purpose | Version |
|---------|---------|---------|
| `zustand` | State management | ^5.0 |
| `framer-motion` | Animations | ^12.0 |
| `@next/font` | Font optimization (Inter) | built-in |
| `lucide-react` | Icons (replaces react-icons) | ^0.400 |
| `vitest` | Test runner | ^3.0 |
| `@testing-library/react` | Component testing | ^16.0 |
| `@testing-library/jest-dom` | DOM matchers | ^6.0 |
| `jsdom` | Test environment | ^25.0 |
| `@vitejs/plugin-react` | Vitest React support | ^4.0 |
| `husky` | Git hooks | ^9.0 |
| `lint-staged` | Pre-commit linting | ^15.0 |
| `prettier` | Code formatting | ^3.0 |

### Dependencies to Remove

| Package | Reason |
|---------|--------|
| `@dnd-kit/core` | Not needed for food ordering flow |
| `@dnd-kit/sortable` | Not needed for food ordering flow |
| `@dnd-kit/utilities` | Not needed for food ordering flow |
| `react-icons` | Replaced by lucide-react (tree-shakeable, consistent) |

## Environment Variables

```env
# .env.local (not committed)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Deployment

- **Hosting**: Firebase App Hosting (configured via `apphosting.yaml`)
- **Build**: `next build` produces optimized production bundle
- **CI checks**: lint + format + test must pass before deploy
- **Environment**: Firebase environment variables injected via App Hosting config

## Migration Notes

- Existing `firebase.js` moves to `src/services/firebase.ts` with env var config
- Existing `src/data/foodItem.ts` becomes fallback/mock data for development and tests
- Existing `src/utils/authService.ts` is replaced by typed `src/services/authService.ts`
- Existing components (`BannerCarousel`, `BottomNav`, `SwipeablePanels`) are fully rewritten as new components in the design system
- Route structure preserved (home, menu, order-summary, order-confirmation, nutrition-info)
- `order-arrival` route merged into `order-confirmation` (same functionality)
