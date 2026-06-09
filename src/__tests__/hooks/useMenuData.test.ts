import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMenuData } from '@/hooks/useMenuData';
import { useMenuCacheStore } from '@/stores/menuCacheStore';
import { firebaseService } from '@/services/firebaseService';
import type { MenuItem } from '@/types/menu';

vi.mock('@/services/firebaseService', () => ({
  firebaseService: {
    getMenuItems: vi.fn(),
  },
}));

const mockMenuItem: MenuItem = {
  id: '1',
  name: 'Butter Chicken',
  description: 'Creamy tomato-based curry',
  price: 350,
  image_url: '/images/butter-chicken.jpg',
  available: true,
  cuisine: 'Indian',
  dish_type: 'Main Course',
  meal_type: ['Lunch', 'Dinner'],
  diet: 'Non-Vegetarian',
  allergens: ['Dairy'],
  spice_level: 'Medium',
  taste_profile: ['Creamy', 'Rich'],
  flavor_tags: ['Butter', 'Tomato'],
  ingredients: ['Chicken', 'Butter', 'Cream', 'Tomato'],
  calories: 450,
  carbs: 20,
  protein: 35,
  fat: 25,
  is_best_seller: true,
  rating: 4.5,
  review_count: 120,
  prep_time: '25 min',
  portion_size: 'Regular',
  serves: '1',
  cooking_method: 'Tandoor + Gravy',
  available_time: ['Lunch', 'Dinner'],
  occasion: ['Casual'],
  pairs_well_with: ['Naan', 'Rice'],
  combo_items: [],
};

const mockedGetMenuItems = vi.mocked(firebaseService.getMenuItems);

describe('useMenuData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the menu cache store
    useMenuCacheStore.setState({
      items: [],
      lastFetchedAt: null,
      isStale: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state and fetches when no cache exists', async () => {
    mockedGetMenuItems.mockResolvedValue({
      success: true,
      data: [mockMenuItem],
    });

    const { result } = renderHook(() => useMenuData('test-restaurant'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toEqual([mockMenuItem]);
    expect(result.current.error).toBeNull();
  });

  it('returns cached items immediately when cache is fresh (<5 min)', () => {
    // Set fresh cache (1 minute old)
    useMenuCacheStore.setState({
      items: [mockMenuItem],
      lastFetchedAt: Date.now() - 1 * 60 * 1000,
      isStale: false,
    });

    const { result } = renderHook(() => useMenuData('test-restaurant'));

    expect(result.current.items).toEqual([mockMenuItem]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockedGetMenuItems).not.toHaveBeenCalled();
  });

  it('returns cached items and fetches in background when cache is stale (5-30 min)', async () => {
    // Set stale cache (10 minutes old)
    useMenuCacheStore.setState({
      items: [mockMenuItem],
      lastFetchedAt: Date.now() - 10 * 60 * 1000,
      isStale: true,
    });

    const updatedItem = { ...mockMenuItem, price: 400 };
    mockedGetMenuItems.mockResolvedValue({
      success: true,
      data: [updatedItem],
    });

    const { result } = renderHook(() => useMenuData('test-restaurant'));

    // Immediately returns cached data without loading state
    expect(result.current.items).toEqual([mockMenuItem]);
    expect(result.current.isLoading).toBe(false);

    // Fetches in background
    await waitFor(() => {
      expect(result.current.items).toEqual([updatedItem]);
    });
  });

  it('shows loading and fetches fresh when cache is expired (>30 min)', async () => {
    // Set expired cache (35 minutes old)
    useMenuCacheStore.setState({
      items: [mockMenuItem],
      lastFetchedAt: Date.now() - 35 * 60 * 1000,
      isStale: true,
    });

    mockedGetMenuItems.mockResolvedValue({
      success: true,
      data: [mockMenuItem],
    });

    const { result } = renderHook(() => useMenuData('test-restaurant'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toEqual([mockMenuItem]);
  });

  it('shows error state when fetch fails and no cache', async () => {
    mockedGetMenuItems.mockResolvedValue({
      success: false,
      error: {
        category: 'network',
        message: 'Unable to load menu. Please check your connection.',
      },
    });

    const { result } = renderHook(() => useMenuData('test-restaurant'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(
      'Unable to load menu. Please check your connection.'
    );
    expect(result.current.items).toEqual([]);
  });

  it('retry re-fetches menu items', async () => {
    mockedGetMenuItems
      .mockResolvedValueOnce({
        success: false,
        error: { category: 'network', message: 'Network error' },
      })
      .mockResolvedValueOnce({
        success: true,
        data: [mockMenuItem],
      });

    const { result } = renderHook(() => useMenuData('test-restaurant'));

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.items).toEqual([mockMenuItem]);
      expect(result.current.error).toBeNull();
    });
  });
});
