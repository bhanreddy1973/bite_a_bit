# Requirements Document

## Introduction

Complete modernization of the "Bite a Bit" food ordering application — transforming it from a basic prototype into a production-ready, premium-quality app with an Apple-inspired design language. The modernization encompasses a redesigned UI/UX with dark/light mode, proper state management, performance optimization, comprehensive error handling, testing infrastructure, and production-grade architecture while preserving the existing Firebase backend integration.

## Glossary

- **App**: The Bite a Bit Next.js food ordering web application
- **Design_System**: The collection of reusable UI primitives, tokens, and patterns implementing the Apple-inspired aesthetic
- **Theme_Engine**: The subsystem responsible for managing dark/light mode preferences, system detection, and seamless transitions
- **State_Store**: The centralized client-side state management layer (Zustand) managing cart, user session, UI state, and cached data
- **Menu_Browser**: The page and associated components allowing users to browse, filter, search, and sort food items
- **Cart_Manager**: The subsystem handling item addition, removal, quantity changes, and order total calculation
- **Order_Pipeline**: The flow from cart review through order placement to order confirmation and arrival tracking
- **Auth_Flow**: The user authentication and session management subsystem
- **Firebase_Service**: The abstraction layer encapsulating all Firebase SDK interactions (Firestore, Auth)
- **Animation_Engine**: The motion library integration (Framer Motion) providing micro-interactions and transitions
- **Performance_Layer**: The collection of optimizations including code splitting, lazy loading, image optimization, and caching
- **Test_Suite**: The combined unit and integration test infrastructure (Vitest + React Testing Library)
- **Navigation_Shell**: The persistent layout shell containing the responsive sidebar/bottom navigation

## Requirements

### Requirement 1: Design System Foundation

**User Story:** As a developer, I want a cohesive design system with tokens, primitives, and reusable components, so that the entire app maintains visual consistency and can be themed efficiently.

#### Acceptance Criteria

1. THE Design_System SHALL define design tokens using CSS custom properties covering: a color palette (primary, secondary, neutral, success, warning, error, each with at least 3 shades), a spacing scale of at least 8 steps (4px base increment), border radii (small: 4px, medium: 8px, large: 12px, pill: 9999px), at least 3 shadow elevations, and a typography scale of at least 5 sizes
2. THE Design_System SHALL use Inter as the primary font family with a type hierarchy defining explicit sizes: display (32–36px), heading (22–26px), body (14–16px), caption (11–12px), and label (12–13px), each specifying font-weight and line-height values
3. THE Design_System SHALL provide primitive components including Button, Card, Input, Badge, Skeleton, Toast, Modal, and IconButton, where each component applies design tokens for color, spacing, border-radius, and typography rather than hard-coded values
4. WHEN a primitive component is rendered, THE Design_System SHALL apply border-radius of at least 12px for Card components, 8px for Input components, and 9999px for pill-shaped elements; box-shadow with a maximum blur radius of 16px and opacity no greater than 0.12; and minimum padding of 12px for interactive elements and 16px for container elements
5. THE Design_System SHALL enforce a maximum content width of 480px for viewports below 768px, expand to fill available width (up to 768px) for viewports between 768px and 1279px, and center content with a maximum width of 1280px for viewports at or above 1280px, with no horizontal overflow or content clipping at any breakpoint
6. WHEN the user's system color scheme preference changes, THE Design_System SHALL switch between light and dark token sets (background, foreground, and surface colors) without requiring a page reload

### Requirement 2: Theme Engine with Dark and Light Mode

**User Story:** As a user, I want the app to support dark and light modes with automatic system preference detection, so that I have a comfortable viewing experience in any lighting condition.

#### Acceptance Criteria

1. WHEN the App loads and no user theme preference exists in localStorage, THE Theme_Engine SHALL detect the operating system color scheme preference and apply the matching theme within 500ms of page render
2. WHEN the App loads and a user theme preference exists in localStorage, THE Theme_Engine SHALL apply the stored preference, overriding the operating system color scheme
3. WHEN the user manually toggles the theme, THE Theme_Engine SHALL persist the preference in localStorage and apply the selected theme within 200ms of the toggle interaction
4. WHILE the dark theme is active, THE Theme_Engine SHALL render all surfaces, text, and interactive elements using the dark palette with contrast ratios meeting WCAG AA standards (minimum 4.5:1 for normal text, minimum 3:1 for large text and UI components)
5. WHILE the light theme is active, THE Theme_Engine SHALL render all surfaces, text, and interactive elements using the light palette with contrast ratios meeting WCAG AA standards (minimum 4.5:1 for normal text, minimum 3:1 for large text and UI components)
6. WHEN the theme changes, THE Theme_Engine SHALL apply the transition using a crossfade animation lasting no more than 300ms with no visible flash of unstyled content
7. THE Theme_Engine SHALL expose a theme toggle control within the Navigation_Shell that is keyboard-operable, has a minimum tap target of 44×44 pixels, and includes an accessible label indicating the current theme state
8. WHEN the operating system color scheme preference changes while the App is running and no user preference is stored in localStorage, THE Theme_Engine SHALL detect the change and apply the updated system theme within 500ms

### Requirement 3: Navigation Shell and Responsive Layout

**User Story:** As a user, I want intuitive navigation that adapts to my device, so that I can move between sections effortlessly on mobile, tablet, or desktop.

#### Acceptance Criteria

1. WHILE the viewport width is below 768px, THE Navigation_Shell SHALL display a fixed bottom tab bar with icons and labels for Home, Menu, Cart, and Profile sections, where the tab bar height is between 56px and 64px and each icon is paired with a text label below it
2. WHILE the viewport width is 768px or above, THE Navigation_Shell SHALL display a persistent left sidebar with a fixed width between 240px and 280px containing navigation links, user info, and the theme toggle
3. WHEN the current route matches a navigation item's target path, THE Navigation_Shell SHALL highlight that item with a filled icon variant and a visually distinct accent-colored background or border indicator distinguishing it from inactive items
4. THE Navigation_Shell SHALL support keyboard navigation using Tab key to move between navigation items and Arrow keys to move within the navigation group, with focus indicators rendered as a minimum 2px outline meeting a 3:1 contrast ratio against adjacent colors
5. THE Navigation_Shell SHALL include ARIA landmarks (nav, main, complementary) for screen reader accessibility and each navigation item SHALL have an accessible name matching its visible label
6. WHILE the Cart contains one or more items, THE Navigation_Shell SHALL display a badge on the Cart navigation item showing the total item count as a numeric value between 1 and 99, displaying "99+" for counts exceeding 99
7. WHEN the viewport width crosses the 768px breakpoint due to resize or orientation change, THE Navigation_Shell SHALL switch between bottom tab bar and sidebar layouts within 150ms without losing the current active navigation state

### Requirement 4: Home Page and Onboarding

**User Story:** As a new user, I want a welcoming home page with streamlined onboarding, so that I can start ordering food quickly with minimal friction.

#### Acceptance Criteria

1. WHEN the Home page loads, THE App SHALL display a hero section with the restaurant name, a promotional banner carousel that auto-advances every 5 seconds, and a login form containing fields for name and phone number
2. WHEN the user submits the login form, THE Auth_Flow SHALL validate that the name field contains between 1 and 50 characters and the phone number is exactly 10 digits (numeric only, for Indian numbers)
3. IF the name field is empty or exceeds 50 characters, or the phone number is not exactly 10 numeric digits, THEN THE Auth_Flow SHALL display an inline validation error message indicating the specific invalid field and retain the user's current form input
4. IF the authentication request to the backend fails due to a network or server error, THEN THE Auth_Flow SHALL display an error toast visible for 5 seconds indicating the failure reason without clearing the user's form input
5. WHEN authentication succeeds, THE Auth_Flow SHALL store the user session (user ID, name, and phone) in the State_Store and redirect to the Menu_Browser within 500ms
6. THE Home page SHALL render a promotional carousel with crossfade transitions completing within 700ms, dot indicators reflecting the active banner, and swipe gesture support on touch devices
7. WHEN no restaurant name is detected from URL parameters, THE App SHALL display "bbq_in" as the default restaurant name and display a visible prompt instructing the user to scan a QR code for their restaurant
8. IF the promotional carousel contains fewer than 2 banners, THEN THE App SHALL display the single banner statically without auto-advance or transition animations

### Requirement 5: Menu Browsing and Discovery

**User Story:** As a user, I want to browse a beautifully presented menu with filtering, sorting, and search capabilities, so that I can quickly find dishes that match my preferences.

#### Acceptance Criteria

1. WHEN the Menu_Browser loads, THE App SHALL fetch menu items from the Firebase_Service and display skeleton loading placeholders during the fetch, with a maximum fetch timeout of 10 seconds
2. WHEN the menu fetch completes successfully, THE Menu_Browser SHALL display each food item as a card showing image (or a default placeholder if unavailable), name, price, rating (numeric with star icon), prep time, diet badge, and an Add button
3. WHEN the user selects a category filter, THE Menu_Browser SHALL display only items matching that category within 300ms using an animated transition
4. WHEN the user types in the search field, THE Menu_Browser SHALL filter items by name with debounced input (300ms delay) and highlight matching text in the item name
5. IF the search or filter returns zero matching items, THEN THE Menu_Browser SHALL display an empty state message indicating no items match the current criteria
6. WHEN the user selects a sort option (price low-high, price high-low, rating, prep time), THE Menu_Browser SHALL reorder the displayed items accordingly within 300ms using a layout animation
7. WHEN the user taps a menu item card, THE Menu_Browser SHALL expand the card to show full details including description, ingredients, allergens, nutritional info (calories, carbs, protein, fat), and pairing suggestions
8. IF the menu fetch fails or exceeds the 10-second timeout, THEN THE Menu_Browser SHALL display an error state with a retry button and a message indicating the menu could not be loaded

### Requirement 6: Cart Management

**User Story:** As a user, I want to add, remove, and modify items in my cart with real-time feedback, so that I can curate my order confidently.

#### Acceptance Criteria

1. WHEN the user taps the Add button on a menu item, THE Cart_Manager SHALL add the item to the cart with a count of 1, display a confirmation animation for 2 seconds, and disable the Add button for that item during the animation duration
2. WHEN the user increases an item quantity, THE Cart_Manager SHALL increment the count by 1 (up to a maximum of 50 per item) and recalculate the item total as unit price multiplied by the new quantity
3. WHEN the user decreases an item quantity and the resulting count is greater than zero, THE Cart_Manager SHALL decrement the count by 1 and recalculate the item total as unit price multiplied by the new quantity
4. WHEN the item quantity reaches zero, THE Cart_Manager SHALL remove the item from the cart and remove it from the floating cart summary bar
5. THE Cart_Manager SHALL persist the cart state to localStorage within 500 milliseconds of any cart modification and restore the cart from localStorage on page load for session recovery
6. WHILE the cart contains at least one item, THE Cart_Manager SHALL display a floating cart summary bar showing total item count, total price, and a breakdown of totals by dish category, visible on the Menu_Browser page
7. WHEN the cart is empty, THE Cart_Manager SHALL display an empty state illustration with a prompt to browse the menu and hide the floating cart summary bar
8. IF the user taps Add on an item that has an "available" field set to false, THEN THE Cart_Manager SHALL prevent the item from being added and display an error message indicating the item is unavailable

### Requirement 7: Order Summary and Placement

**User Story:** As a user, I want to review my complete order with itemized details before placing it, so that I can confirm everything is correct.

#### Acceptance Criteria

1. WHEN the Order Summary page loads, THE Order_Pipeline SHALL display all cart items grouped by category (dish_type), showing each item's name, unit price, quantity, and line subtotal (price × quantity)
2. THE Order_Pipeline SHALL display the order total at the bottom of the item list with a font size at least 1.5x the body text size, along with a breakdown showing each category's subtotal
3. WHEN the user taps "Place Order", THE Order_Pipeline SHALL submit the order to the Firebase_Service with the user ID, restaurant name, grouped items, order status set to "pending", and a server timestamp
4. WHILE the order is being submitted, THE Order_Pipeline SHALL display a loading indicator on the submit button, disable the submit button, and prevent duplicate submissions until the request completes or times out after 15 seconds
5. IF the order submission fails, THEN THE Order_Pipeline SHALL display an error toast indicating the failure reason and provide a retry button that re-attempts submission without clearing the cart contents from the State_Store or localStorage
6. WHEN the order is placed successfully, THE Order_Pipeline SHALL clear the cart from the State_Store and localStorage, store the returned order ID in localStorage, and navigate to the Order Confirmation page
7. IF the Order Summary page loads and the cart contains zero items, THEN THE Order_Pipeline SHALL display an empty state message and a navigation action to return to the Menu_Browser
8. IF the user ID or restaurant name is unavailable when "Place Order" is tapped, THEN THE Order_Pipeline SHALL display an error message indicating the missing context and redirect the user to the Home page

### Requirement 8: Order Confirmation and Tracking

**User Story:** As a user, I want to see my order confirmation with estimated arrival time and item status, so that I know my food is being prepared.

#### Acceptance Criteria

1. WHEN the Order Confirmation page loads, THE Order_Pipeline SHALL display the order status heading, the estimated preparation time in minutes for the first item in the order, and a list of all ordered items with their individual statuses shown as one of: "preparing", "ready", or "served"
2. THE Order_Pipeline SHALL display a "Check Nutrition Balance" button on the Order Confirmation page
3. WHEN the user taps "Check Nutrition Balance", THE Order_Pipeline SHALL navigate to the Nutrition Info page
4. WHEN the user taps "Add More", THE Order_Pipeline SHALL navigate back to the Menu_Browser while retaining the confirmed order items in localStorage so that they remain visible on the Order Confirmation page upon return
5. THE Order_Pipeline SHALL display each item with its name, the name of the user who added it, current status (one of: "preparing", "ready", or "served"), and prep time in minutes
6. IF the Order Confirmation page loads with no order data available in localStorage, THEN THE Order_Pipeline SHALL display an empty state message indicating no active order and provide a navigation option to the Menu_Browser

### Requirement 9: Nutrition Information Display

**User Story:** As a health-conscious user, I want to see the nutritional breakdown of my order, so that I can make informed dietary decisions.

#### Acceptance Criteria

1. WHEN the Nutrition Info page loads with one or more items in the current order, THE App SHALL calculate the total calories, total carbohydrates (grams), total protein (grams), and total fat (grams) by summing each item's nutritional values multiplied by its quantity
2. WHEN the Nutrition Info page loads with one or more items in the current order, THE App SHALL render a donut chart visualization showing macronutrient distribution as percentage segments for carbohydrates, protein, and fat, with the total calorie count displayed in the center of the chart
3. IF the protein ratio (protein grams divided by the sum of carbohydrates, protein, and fat grams) is greater than or equal to 30%, THEN THE App SHALL display a message encouraging the user about their protein balance
4. IF the protein ratio (protein grams divided by the sum of carbohydrates, protein, and fat grams) is below 30%, THEN THE App SHALL display a message suggesting the user consider increasing protein intake
5. WHEN the Nutrition Info page loads with one or more items in the current order, THE App SHALL display a legend listing each macronutrient (carbohydrates, protein, fat) with a distinct color indicator and its percentage value rounded to the nearest whole number
6. IF the current order contains no items when the Nutrition Info page loads, THEN THE App SHALL not render the donut chart, legend, or contextual message

### Requirement 10: Animations and Micro-Interactions

**User Story:** As a user, I want smooth, delightful animations throughout the app, so that interactions feel responsive and premium.

#### Acceptance Criteria

1. WHEN a page transition occurs, THE Animation_Engine SHALL apply a fade-and-slide animation where the outgoing page fades out while sliding 20px in the direction of navigation and the incoming page fades in from the opposite side, with a total duration between 200ms and 400ms and an ease-out timing function
2. WHEN a button is hovered, THE Animation_Engine SHALL apply a scale transform to 1.02x and increase the box-shadow spread by 2px within a transition duration of 150ms to 250ms
3. WHEN a card is tapped or clicked, THE Animation_Engine SHALL apply a press-down animation scaling to 0.98x within 100ms, followed by a spring return to 1.0x scale completing within 200ms to 300ms
4. WHEN items are added or removed from a list, THE Animation_Engine SHALL animate each item's entry or exit with a fade and vertical slide of 10px, applying a stagger delay of 50ms to 80ms between consecutive items and an individual item animation duration of 150ms to 250ms
5. WHEN a loading state is active, THE Animation_Engine SHALL display skeleton placeholders matching the expected content dimensions and animate a horizontal shimmer gradient moving left-to-right with a cycle duration of 1000ms to 1500ms repeating until content loads
6. IF the user has enabled a reduced-motion preference in their operating system settings, THEN THE Animation_Engine SHALL disable all transition and keyframe animations and apply state changes instantaneously

### Requirement 11: Performance Optimization

**User Story:** As a user, I want the app to load fast and remain responsive, so that I do not experience delays while ordering food.

#### Acceptance Criteria

1. THE Performance_Layer SHALL implement route-based code splitting so that each page loads only the code required for that route, with each route's initial JavaScript bundle not exceeding 200KB gzipped
2. THE Performance_Layer SHALL lazy-load images that are more than 200px below the viewport edge using the Next.js Image component with blur placeholder effects for automatic format, size, and quality optimization
3. THE Performance_Layer SHALL cache Firebase menu data in the State_Store with a stale-while-revalidate strategy: serve cached data immediately while fetching fresh data in background, treat cached data as stale after 5 minutes, and force a full refresh if cache age exceeds 30 minutes
4. WHEN the App is first loaded, THE Performance_Layer SHALL achieve a Largest Contentful Paint (LCP) of under 2.5 seconds measured using Lighthouse simulated throttling (9 Mbps download, 1.5 Mbps upload, 170ms RTT, 4x CPU slowdown)
5. THE Performance_Layer SHALL apply React.memo to components rendering lists of more than 20 items and useMemo for cart total calculations and filtered menu list derivations to prevent unnecessary re-computation on unrelated state changes
6. WHILE the user is interacting with the App, THE Performance_Layer SHALL maintain an Interaction to Next Paint (INP) of 200ms or less so that taps, scrolls, and input responses remain visually fluid

### Requirement 12: Error Handling and Resilience

**User Story:** As a user, I want the app to handle errors gracefully with clear feedback, so that I am never left confused by a broken screen.

#### Acceptance Criteria

1. IF a network request fails, THEN THE App SHALL display a toast notification indicating the nature of the failure (e.g., "Unable to load menu" or "Order submission failed"), with a "Retry" button that re-attempts the failed request, and the toast SHALL remain visible for at least 5 seconds or until dismissed by the user
2. IF an unexpected JavaScript error occurs, THEN THE App SHALL catch the error in a React Error Boundary and display a fallback UI containing an error indication message and a "Try Again" button that reloads the current page component
3. WHEN the user submits the login form, THE App SHALL validate the name field (1 to 50 characters, letters and spaces only) and the phone field (exactly 10 digits) on the client side, displaying an inline error message below the invalid field before allowing submission
4. IF the localStorage data is corrupted or missing, THEN THE App SHALL reset the affected state to default values and redirect the user to the home page (landing/login screen)
5. THE App SHALL log all errors to the browser console with structured metadata including timestamp, error type, and component context

### Requirement 13: Accessibility Compliance

**User Story:** As a user with accessibility needs, I want the app to be navigable and understandable using assistive technologies, so that I can order food independently.

#### Acceptance Criteria

1. THE App SHALL ensure all interactive elements are focusable via keyboard with a visible focus indicator of at least 2px solid outline that maintains a minimum 3:1 contrast ratio against adjacent colors
2. THE App SHALL provide ARIA labels for all icon-only buttons and non-text interactive elements
3. THE App SHALL maintain a minimum color contrast ratio of 4.5:1 for normal text (below 18pt regular or 14pt bold) and 3:1 for large text (18pt regular or 14pt bold and above) in both light and dark themes
4. THE App SHALL support screen reader navigation with a heading hierarchy from h1 through h4 where no heading level is skipped and each page contains exactly one h1
5. WHEN a dynamic content change occurs (toast, modal, cart update), THE App SHALL announce the change to assistive technologies using ARIA live regions with aria-polite for non-urgent updates and aria-assertive for error notifications
6. WHEN a modal or dialog opens, THE App SHALL move focus to the first focusable element within the dialog and trap focus within it until the dialog is closed, at which point focus SHALL return to the triggering element
7. WHEN the user has enabled the prefers-reduced-motion system setting, THE App SHALL disable all non-essential animations and transitions, limiting motion to opacity changes only
8. THE App SHALL ensure all interactive touch targets have a minimum size of 44×44 CSS pixels

### Requirement 14: State Management Architecture

**User Story:** As a developer, I want centralized, predictable state management, so that the app state is consistent and debuggable across all components.

#### Acceptance Criteria

1. THE State_Store SHALL manage cart state including items, quantities, and computed totals (per-item subtotal as price multiplied by quantity, total item count, and grand total as sum of all item subtotals) using Zustand with TypeScript-typed slices
2. THE State_Store SHALL manage user session state including authentication status (authenticated or unauthenticated), user profile (name, phone number), and restaurant context (restaurant name derived from URL parameters)
3. THE State_Store SHALL manage UI state including theme preference (light, dark, or system), active navigation item identifier, and per-operation loading states for authentication, menu fetching, and order submission
4. WHEN the App initializes, THE State_Store SHALL hydrate from localStorage within 1000ms, validate that each stored slice conforms to its expected TypeScript type structure and contains no undefined required fields, and only then make state available to components
5. IF hydration validation fails for a state slice, THEN THE State_Store SHALL discard the corrupted slice, initialize it with default values, and make the remaining valid state available to components without blocking app startup
6. THE State_Store SHALL expose typed selector hooks that return only the selected slice fields, ensuring that a component subscribed to a single slice does not re-render when an unrelated slice is updated
7. WHEN the user logs out, THE State_Store SHALL reset cart state and user session state to their default values, clear the corresponding localStorage entries, and retain UI state preferences

### Requirement 15: Testing Infrastructure

**User Story:** As a developer, I want comprehensive unit and integration tests, so that I can refactor and extend the app with confidence.

#### Acceptance Criteria

1. THE Test_Suite SHALL use Vitest as the test runner with React Testing Library for component tests, configured with a test script in package.json that executes all tests in a single run
2. THE Test_Suite SHALL include unit tests for the State_Store with at least one test per cart operation (add, remove, increase, decrease, clear) and at least one test per computed value (order total, individual item subtotal, total item count), each asserting the expected state after the operation
3. THE Test_Suite SHALL include integration tests for the Auth_Flow with at least one test per scenario: successful login resulting in session storage, validation rejection for invalid name or phone input, and network failure (simulated via a rejected service call) resulting in an error message while preserving form input
4. THE Test_Suite SHALL include component tests for the Menu_Browser verifying: initial render displays the expected number of item cards from mock data, selecting a category filter reduces visible items to only that category, applying a sort option reorders items correctly, and tapping an item card expands it to show description and allergens
5. THE Test_Suite SHALL achieve a minimum of 70% line coverage for all files within the stores/, services/, and utils/ directories, enforced by a coverage threshold in the Vitest configuration
6. THE Test_Suite SHALL mock all Firebase_Service calls in unit and integration tests so that tests execute without network access and produce deterministic results

### Requirement 16: Firebase Service Abstraction

**User Story:** As a developer, I want Firebase interactions encapsulated in a service layer, so that components remain decoupled from the data source and the app is testable.

#### Acceptance Criteria

1. THE Firebase_Service SHALL expose typed functions for fetching menu items, creating users, placing orders, and querying order status, where each function defines explicit input parameter types and a return type using a Result discriminated union (success with typed data or failure with error category and message)
2. IF a Firestore operation fails due to network unavailability, permission denial, document-not-found, or request timeout (exceeding 10 seconds), THEN THE Firebase_Service SHALL return a failure Result containing the error category and an error message indicating the nature of the failure without exposing internal Firestore details
3. THE Firebase_Service SHALL use environment variables for Firebase configuration (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId) instead of hardcoded values
4. IF any required Firebase configuration environment variable is missing or contains an empty string at startup, THEN THE Firebase_Service SHALL throw an initialization error that identifies which specific variable is missing or empty
5. THE Firebase_Service SHALL implement request deduplication such that multiple calls to the same function with identical parameters within a 5-second window return the cached result from the first call instead of making additional Firestore requests
6. THE Firebase_Service SHALL be implemented behind an interface (or type-defined contract) that allows components to depend on the abstraction, enabling substitution with a mock implementation during testing without requiring a Firestore connection

### Requirement 17: Code Quality and Developer Experience

**User Story:** As a developer, I want a clean, well-organized codebase with enforced standards, so that the project is maintainable and onboarding new developers is straightforward.

#### Acceptance Criteria

1. THE App SHALL organize source code into a folder structure containing: components/, hooks/, stores/, services/, types/, utils/, and app/ (routes) directories under the src/ directory
2. THE App SHALL enforce code quality with ESLint (extending typescript-eslint/recommended), Prettier (with explicit config for printWidth, tabWidth, singleQuote, and trailingComma), and a pre-commit hook (via husky + lint-staged) that blocks commits containing lint or format violations
3. THE App SHALL define shared TypeScript types and interfaces in a centralized types/ directory for menu items, cart items, orders, and user models, with no duplicate type definitions across files
4. THE App SHALL use path aliases (@/components, @/hooks, @/stores, @/services, @/types, @/utils) for clean imports configured in tsconfig.json
5. THE App SHALL include a README.md documenting: project setup steps, folder structure overview, available npm scripts, required environment variables with example values, and deployment instructions for Firebase Hosting
