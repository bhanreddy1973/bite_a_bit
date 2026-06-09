import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock stores
const mockActiveNav = vi.fn().mockReturnValue('/');
const mockSetActiveNav = vi.fn();
const mockGetTotalCount = vi.fn().mockReturnValue(0);

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (state: unknown) => unknown) => {
    const state = {
      activeNav: mockActiveNav(),
      setActiveNav: mockSetActiveNav,
    };
    return selector(state);
  },
}));

vi.mock('@/stores/cartStore', () => ({
  useCartStore: (selector: (state: unknown) => unknown) => {
    const state = {
      getTotalCount: mockGetTotalCount,
    };
    return selector(state);
  },
}));

import { BottomTabBar } from '@/components/layout/BottomTabBar';

describe('BottomTabBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveNav.mockReturnValue('/');
    mockGetTotalCount.mockReturnValue(0);
  });

  it('renders navigation with correct ARIA landmark', () => {
    render(<BottomTabBar />);
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
  });

  it('renders all four nav items: Home, Menu, Cart, Profile', () => {
    render(<BottomTabBar />);
    expect(screen.getByRole('tab', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Menu' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Cart' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Profile' })).toBeInTheDocument();
  });

  it('highlights active nav item with aria-selected', () => {
    mockActiveNav.mockReturnValue('/menu');
    render(<BottomTabBar />);
    const menuTab = screen.getByRole('tab', { name: 'Menu' });
    expect(menuTab).toHaveAttribute('aria-selected', 'true');
    const homeTab = screen.getByRole('tab', { name: 'Home' });
    expect(homeTab).toHaveAttribute('aria-selected', 'false');
  });

  it('navigates and sets active nav on click', () => {
    render(<BottomTabBar />);
    fireEvent.click(screen.getByRole('tab', { name: 'Menu' }));
    expect(mockSetActiveNav).toHaveBeenCalledWith('/menu');
    expect(mockPush).toHaveBeenCalledWith('/menu');
  });

  it('navigates on Enter key press', () => {
    render(<BottomTabBar />);
    const cartTab = screen.getByRole('tab', { name: 'Cart' });
    fireEvent.keyDown(cartTab, { key: 'Enter' });
    expect(mockSetActiveNav).toHaveBeenCalledWith('/order-summary');
    expect(mockPush).toHaveBeenCalledWith('/order-summary');
  });

  it('navigates on Space key press', () => {
    render(<BottomTabBar />);
    const homeTab = screen.getByRole('tab', { name: 'Home' });
    fireEvent.keyDown(homeTab, { key: ' ' });
    expect(mockSetActiveNav).toHaveBeenCalledWith('/');
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('does not show cart badge when count is 0', () => {
    mockGetTotalCount.mockReturnValue(0);
    render(<BottomTabBar />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows cart badge with count between 1 and 99', () => {
    mockGetTotalCount.mockReturnValue(5);
    render(<BottomTabBar />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows "99+" for cart count exceeding 99', () => {
    mockGetTotalCount.mockReturnValue(100);
    render(<BottomTabBar />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('applies active class to current nav item', () => {
    mockActiveNav.mockReturnValue('/order-summary');
    render(<BottomTabBar />);
    const cartTab = screen.getByRole('tab', { name: 'Cart' });
    expect(cartTab.className).toContain('bottom-tab-bar__item--active');
  });

  it('supports arrow key navigation between items', () => {
    render(<BottomTabBar />);
    const homeTab = screen.getByRole('tab', { name: 'Home' });

    // Mock querySelector to verify focus logic
    const mockFocus = vi.fn();
    const mockElement = { focus: mockFocus } as unknown as HTMLElement;
    vi.spyOn(document, 'querySelector').mockReturnValue(mockElement);

    fireEvent.keyDown(homeTab, { key: 'ArrowRight' });
    expect(document.querySelector).toHaveBeenCalledWith('[data-nav-index="1"]');
  });
});
