'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { useMenuData } from '@/hooks/useMenuData';
import { CategoryFilter } from '@/components/menu/CategoryFilter';
import { SearchBar } from '@/components/menu/SearchBar';
import { SortDropdown } from '@/components/menu/SortDropdown';
import { MenuGrid } from '@/components/menu/MenuGrid';
import { FloatingCartBar } from '@/components/menu/FloatingCartBar';
import type { MenuItem } from '@/types/menu';

/**
 * Parses a prep_time string (e.g., "18 mins", "1 hr 30 mins") to minutes.
 */
function parsePrepTimeToMinutes(prepTime: string): number {
  const hourMatch = prepTime.match(/(\d+)\s*hr/i);
  const minMatch = prepTime.match(/(\d+)\s*min/i);
  let total = 0;
  if (hourMatch) total += parseInt(hourMatch[1], 10) * 60;
  if (minMatch) total += parseInt(minMatch[1], 10);
  // If neither matched, try parsing as plain number
  if (!hourMatch && !minMatch) {
    const num = parseInt(prepTime, 10);
    if (!isNaN(num)) total = num;
  }
  return total;
}

export default function MenuPage() {
  const router = useRouter();
  const session = useUserStore((state) => state.session);

  // Auth guard: redirect to / if not authenticated
  useEffect(() => {
    if (!session || !session.isAuthenticated) {
      router.push('/');
    }
  }, [session, router]);

  // Local filter/sort state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<string>('rating');

  // Get restaurant name from session
  const restaurantName = session?.restaurantName ?? '';

  // Fetch menu data using the custom hook
  const { items, isLoading, error, retry } = useMenuData(restaurantName);

  // Extract unique categories from menu items
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    items.forEach((item) => {
      if (item.dish_type) {
        categorySet.add(item.dish_type);
      }
    });
    return Array.from(categorySet).sort();
  }, [items]);

  // Derive filtered and sorted items using useMemo
  const filteredAndSortedItems = useMemo(() => {
    let result: MenuItem[] = [...items];

    // Filter by category
    if (selectedCategory) {
      result = result.filter((item) => item.dish_type === selectedCategory);
    }

    // Filter by search query (case-insensitive name match)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((item) =>
        item.name.toLowerCase().includes(query)
      );
    }

    // Sort by selected option
    switch (sortOption) {
      case 'price-low-high':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'prep-time':
        result.sort(
          (a, b) => parsePrepTimeToMinutes(a.prep_time) - parsePrepTimeToMinutes(b.prep_time)
        );
        break;
      default:
        break;
    }

    return result;
  }, [items, selectedCategory, searchQuery, sortOption]);

  // Don't render content if not authenticated (redirect pending)
  if (!session || !session.isAuthenticated) {
    return null;
  }

  return (
    <div className="menu-page">
      <header className="menu-page__header">
        <h1 className="menu-page__title">Menu</h1>
      </header>

      <div className="menu-page__controls">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <div className="menu-page__filters-row">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
          <SortDropdown sortOption={sortOption} onSortChange={setSortOption} />
        </div>
      </div>

      <main className="menu-page__content">
        <h2 className="sr-only">Menu Items</h2>
        <MenuGrid
          items={filteredAndSortedItems}
          isLoading={isLoading}
          error={error}
          onRetry={retry}
        />
      </main>

      <FloatingCartBar />
    </div>
  );
}
