'use client';

import { Home, UtensilsCrossed, ShoppingCart, User } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

/**
 * Sidebar component — renders a persistent left sidebar for viewports 768px+.
 * Fixed left, 240–280px width, nav links, user info, theme toggle.
 * Highlights active item with filled icon + accent background, shows cart badge.
 * Keyboard navigation: Tab between items, Arrow keys within group.
 *
 * Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 13.1, 13.4, 13.5
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

export function Sidebar() {
  const activeNav = useUIStore((state) => state.activeNav);
  const setActiveNav = useUIStore((state) => state.setActiveNav);
  const cartCount = useCartStore((state) => state.getTotalCount());
  const session = useUserStore((state) => state.session);
  const router = useRouter();

  const handleNavigation = (item: NavItem) => {
    setActiveNav(item.path);
    router.push(item.path);
  };

  const handleKeyDown = (event: React.KeyboardEvent, item: NavItem, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigation(item);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = (index - 1 + navItems.length) % navItems.length;
      const prevElement = document.querySelector(
        `[data-sidebar-nav-index="${prevIndex}"]`,
      ) as HTMLElement;
      prevElement?.focus();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (index + 1) % navItems.length;
      const nextElement = document.querySelector(
        `[data-sidebar-nav-index="${nextIndex}"]`,
      ) as HTMLElement;
      nextElement?.focus();
    }
  };

  const formatBadge = (count: number): string => {
    if (count > 99) return '99+';
    return String(count);
  };

  return (
    <aside className="sidebar" aria-label="Sidebar navigation">
      <div className="sidebar__header">
        <h2 className="sidebar__title">Bite a Bit</h2>
      </div>

      {session && (
        <div className="sidebar__user-info">
          <div className="sidebar__user-avatar" aria-hidden="true">
            <User size={20} />
          </div>
          <div className="sidebar__user-details">
            <span className="sidebar__user-name">{session.name}</span>
            <span className="sidebar__user-restaurant">{session.restaurantName}</span>
          </div>
        </div>
      )}

      <nav aria-label="Main navigation" className="sidebar__nav">
        <ul className="sidebar__list" role="menubar" aria-orientation="vertical">
          {navItems.map((item, index) => {
            const isActive = activeNav === item.path;
            const Icon = item.icon;

            return (
              <li key={item.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                  data-sidebar-nav-index={index}
                  className={`sidebar__item ${isActive ? 'sidebar__item--active' : ''}`}
                  onClick={() => handleNavigation(item)}
                  onKeyDown={(e) => handleKeyDown(e, item, index)}
                  tabIndex={isActive ? 0 : -1}
                >
                  <Icon size={20} aria-hidden="true" fill={isActive ? 'currentColor' : 'none'} />
                  <span className="sidebar__label">{item.label}</span>
                  {item.id === 'cart' && cartCount > 0 && (
                    <span className="sidebar__badge" aria-live="polite">
                      {formatBadge(cartCount)}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <ThemeToggle />
      </div>
    </aside>
  );
}

export default Sidebar;
