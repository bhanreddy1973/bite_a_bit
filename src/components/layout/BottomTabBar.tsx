'use client';

import { Home, UtensilsCrossed, ShoppingCart, User } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';
import { useRouter } from 'next/navigation';

/**
 * BottomTabBar component — renders a fixed bottom tab bar for viewports below 768px.
 * Displays icons + labels for Home, Menu, Cart, Profile.
 * Highlights active item, shows cart badge.
 *
 * Requirements: 3.1, 3.3, 3.4, 3.5, 3.6, 13.1, 13.4, 13.5
 */

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', path: '/', icon: Home },
  { id: 'menu', label: 'Menu', path: '/menu', icon: UtensilsCrossed },
  { id: 'cart', label: 'Cart', path: '/order-summary', icon: ShoppingCart },
  { id: 'profile', label: 'Profile', path: '/profile', icon: User },
];

export function BottomTabBar() {
  const activeNav = useUIStore((state) => state.activeNav);
  const setActiveNav = useUIStore((state) => state.setActiveNav);
  const cartCount = useCartStore((state) => state.getTotalCount());
  const router = useRouter();

  const handleNavigation = (item: NavItem) => {
    setActiveNav(item.path);
    router.push(item.path);
  };

  const handleKeyDown = (event: React.KeyboardEvent, item: NavItem, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigation(item);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = (index - 1 + navItems.length) % navItems.length;
      const prevElement = document.querySelector(`[data-nav-index="${prevIndex}"]`) as HTMLElement;
      prevElement?.focus();
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (index + 1) % navItems.length;
      const nextElement = document.querySelector(`[data-nav-index="${nextIndex}"]`) as HTMLElement;
      nextElement?.focus();
    }
  };

  const formatBadge = (count: number): string => {
    if (count > 99) return '99+';
    return String(count);
  };

  return (
    <nav aria-label="Main navigation" className="bottom-tab-bar" role="navigation">
      <ul className="bottom-tab-bar__list" role="tablist">
        {navItems.map((item, index) => {
          const isActive = activeNav === item.path;
          const Icon = item.icon;

          return (
            <li key={item.id} role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={item.label}
                data-nav-index={index}
                className={`bottom-tab-bar__item ${isActive ? 'bottom-tab-bar__item--active' : ''}`}
                onClick={() => handleNavigation(item)}
                onKeyDown={(e) => handleKeyDown(e, item, index)}
                tabIndex={isActive ? 0 : -1}
              >
                <span className="bottom-tab-bar__icon-wrapper">
                  <Icon size={24} aria-hidden="true" fill={isActive ? 'currentColor' : 'none'} />
                  {item.id === 'cart' && cartCount > 0 && (
                    <span className="bottom-tab-bar__badge" aria-live="polite">
                      {formatBadge(cartCount)}
                    </span>
                  )}
                </span>
                <span className="bottom-tab-bar__label">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomTabBar;
