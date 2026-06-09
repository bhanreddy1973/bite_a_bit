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
const mockSession = vi.fn().mockReturnValue(null);

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

vi.mock('@/stores/userStore', () => ({
  useUserStore: (selector: (state: unknown) => unknown) => {
    const state = {
      session: mockSession(),
    };
    return selector(state);
  },
}));

// Mock ThemeToggle
vi.mock('@/components/layout/ThemeToggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme Toggle</button>,
}));

import { Sidebar } from '@/components/layout/Sidebar';

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveNav.mockReturnValue('/');
    mockGetTotalCount.mockReturnValue(0);
    mockSession.mockReturnValue(null);
  });

  it('renders aside with correct ARIA label', () => {
    render(<Sidebar />);
    const aside = screen.getByRole('complementary', { name: 'Sidebar navigation' });
    expect(aside).toBeInTheDocument();
  });

  it('renders navigation with correct ARIA landmark', () => {
    render(<Sidebar />);
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
  });

  it('renders all four nav items: Home, Menu, Cart, Profile', () => {
    render(<Sidebar />);
    expect(screen.getByRole('menuitem', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Menu' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Cart' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument();
  });

  it('highlights active nav item with aria-current="page"', () => {
    mockActiveNav.mockReturnValue('/menu');
    render(<Sidebar />);
    const menuItem = screen.getByRole('menuitem', { name: 'Menu' });
    expect(menuItem).toHaveAttribute('aria-current', 'page');
    const homeItem = screen.getByRole('menuitem', { name: 'Home' });
    expect(homeItem).not.toHaveAttribute('aria-current');
  });

  it('navigates and sets active nav on click', () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Menu' }));
    expect(mockSetActiveNav).toHaveBeenCalledWith('/menu');
    expect(mockPush).toHaveBeenCalledWith('/menu');
  });

  it('navigates on Enter key press', () => {
    render(<Sidebar />);
    const cartItem = screen.getByRole('menuitem', { name: 'Cart' });
    fireEvent.keyDown(cartItem, { key: 'Enter' });
    expect(mockSetActiveNav).toHaveBeenCalledWith('/order-summary');
    expect(mockPush).toHaveBeenCalledWith('/order-summary');
  });

  it('navigates on Space key press', () => {
    render(<Sidebar />);
    const homeItem = screen.getByRole('menuitem', { name: 'Home' });
    fireEvent.keyDown(homeItem, { key: ' ' });
    expect(mockSetActiveNav).toHaveBeenCalledWith('/');
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('does not show cart badge when count is 0', () => {
    mockGetTotalCount.mockReturnValue(0);
    render(<Sidebar />);
    // No badge element at all
    const badges = document.querySelectorAll('.sidebar__badge');
    expect(badges.length).toBe(0);
  });

  it('shows cart badge with count between 1 and 99', () => {
    mockGetTotalCount.mockReturnValue(12);
    render(<Sidebar />);
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('shows "99+" for cart count exceeding 99', () => {
    mockGetTotalCount.mockReturnValue(150);
    render(<Sidebar />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('applies active class to current nav item', () => {
    mockActiveNav.mockReturnValue('/order-summary');
    render(<Sidebar />);
    const cartItem = screen.getByRole('menuitem', { name: 'Cart' });
    expect(cartItem.className).toContain('sidebar__item--active');
  });

  it('does not display user info when session is null', () => {
    mockSession.mockReturnValue(null);
    render(<Sidebar />);
    expect(screen.queryByText(/bbq_in/)).not.toBeInTheDocument();
  });

  it('displays user info when session exists', () => {
    mockSession.mockReturnValue({
      id: 'user1',
      name: 'John Doe',
      phone: '1234567890',
      restaurantName: 'Pizza Palace',
      isAuthenticated: true,
    });
    render(<Sidebar />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
  });

  it('renders ThemeToggle in footer', () => {
    render(<Sidebar />);
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('renders app title "Bite a Bit"', () => {
    render(<Sidebar />);
    expect(screen.getByText('Bite a Bit')).toBeInTheDocument();
  });

  it('supports arrow key navigation between items', () => {
    render(<Sidebar />);
    const homeItem = screen.getByRole('menuitem', { name: 'Home' });

    const mockFocus = vi.fn();
    const mockElement = { focus: mockFocus } as unknown as HTMLElement;
    vi.spyOn(document, 'querySelector').mockReturnValue(mockElement);

    fireEvent.keyDown(homeItem, { key: 'ArrowDown' });
    expect(document.querySelector).toHaveBeenCalledWith('[data-sidebar-nav-index="1"]');
  });

  it('wraps arrow navigation from last to first item', () => {
    render(<Sidebar />);
    const profileItem = screen.getByRole('menuitem', { name: 'Profile' });

    const mockFocus = vi.fn();
    const mockElement = { focus: mockFocus } as unknown as HTMLElement;
    vi.spyOn(document, 'querySelector').mockReturnValue(mockElement);

    fireEvent.keyDown(profileItem, { key: 'ArrowDown' });
    expect(document.querySelector).toHaveBeenCalledWith('[data-sidebar-nav-index="0"]');
  });
});
