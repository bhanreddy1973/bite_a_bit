import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useMenuCacheStore } from '@/stores/menuCacheStore';
import type { MenuItem } from '@/types/menu';

const createMockMenuItem = (overrides: Partial<MenuItem> = {}): MenuItem => ({
  id: '1',
  name: 'Test Item',
  description: 'A test item',
  price: 10,
  image_url: 'https://example.com/image.jpg',
  available: true,
  cuisine: 'Indian',
  dish_type: 'Main Course',
  meal_type: ['Lunch'],
  diet: 'Vegetarian',
  allergens: [],
  spice_level: 'Mild',
  taste_profile: ['Savory'],
  flavor_tags: ['Spicy'],
  ingredients: ['Rice', 'Lentils'],
  calories: 300,
  carbs: 40,
  protein: 12,
  fat: 8,
  is_best_seller: false,
  rating: 4.2,
  review_count: 50,
  prep_time: '15 min',
  portion_size: 'Regular',
  serves: '1',
  cooking_method: 'Boiled',
  available_time: ['Lunch', 'Dinner'],
  occasion: ['Casual'],
  pairs_well_with: [],
  combo_items: [],
  ...overrides,
});

describe('menuCacheStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    // Reset store state before each test
    useMenuCacheStore.setState({
      items: [],
      lastFetchedAt: null,
      isStale: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should have empty items, null lastFetchedAt, and isStale false', () => {
      const state = useMenuCacheStore.getState();
      expect(state.items).toEqual([]);
      expect(state.lastFetchedAt).toBeNull();
      expect(state.isStale).toBe(false);
    });
  });

  describe('setItems', () => {
    it('should set items and update lastFetchedAt', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const items = [createMockMenuItem({ id: '1' }), createMockMenuItem({ id: '2' })];
      useMenuCacheStore.getState().setItems(items);

      const state = useMenuCacheStore.getState();
      expect(state.items).toHaveLength(2);
      expect(state.items[0].id).toBe('1');
      expect(state.items[1].id).toBe('2');
      expect(state.lastFetchedAt).toBe(now);
      expect(state.isStale).toBe(false);
    });

    it('should reset isStale to false when setting new items', () => {
      useMenuCacheStore.setState({ isStale: true });

      useMenuCacheStore.getState().setItems([createMockMenuItem()]);

      expect(useMenuCacheStore.getState().isStale).toBe(false);
    });
  });

  describe('invalidate', () => {
    it('should set isStale to true', () => {
      useMenuCacheStore.getState().invalidate();
      expect(useMenuCacheStore.getState().isStale).toBe(true);
    });
  });

  describe('shouldRefresh', () => {
    it('should return true when lastFetchedAt is null (no cache)', () => {
      expect(useMenuCacheStore.getState().shouldRefresh()).toBe(true);
    });

    it('should return false when cache is fresh (less than 5 minutes old)', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      useMenuCacheStore.getState().setItems([createMockMenuItem()]);

      // Advance 2 minutes
      vi.setSystemTime(now + 2 * 60 * 1000);

      expect(useMenuCacheStore.getState().shouldRefresh()).toBe(false);
    });

    it('should return true and set isStale when cache is between 5 and 30 minutes old', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      useMenuCacheStore.getState().setItems([createMockMenuItem()]);

      // Advance 6 minutes
      vi.setSystemTime(now + 6 * 60 * 1000);

      expect(useMenuCacheStore.getState().shouldRefresh()).toBe(true);
      expect(useMenuCacheStore.getState().isStale).toBe(true);
    });

    it('should return true when cache exceeds 30 minutes', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      useMenuCacheStore.getState().setItems([createMockMenuItem()]);

      // Advance 31 minutes
      vi.setSystemTime(now + 31 * 60 * 1000);

      expect(useMenuCacheStore.getState().shouldRefresh()).toBe(true);
    });

    it('should return false at exactly 4 minutes 59 seconds', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      useMenuCacheStore.getState().setItems([createMockMenuItem()]);

      // 4 minutes 59 seconds
      vi.setSystemTime(now + 4 * 60 * 1000 + 59 * 1000);

      expect(useMenuCacheStore.getState().shouldRefresh()).toBe(false);
    });

    it('should return true at exactly 5 minutes', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      useMenuCacheStore.getState().setItems([createMockMenuItem()]);

      // Exactly 5 minutes
      vi.setSystemTime(now + 5 * 60 * 1000);

      expect(useMenuCacheStore.getState().shouldRefresh()).toBe(true);
    });
  });
});
