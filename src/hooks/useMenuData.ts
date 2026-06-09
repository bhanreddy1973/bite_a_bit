'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useMenuCacheStore } from '@/stores/menuCacheStore';
import { firebaseService } from '@/services/firebaseService';
import type { MenuItem } from '@/types/menu';

const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const FORCE_REFRESH_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

interface UseMenuDataReturn {
  items: MenuItem[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * useMenuData — fetches menu items with stale-while-revalidate caching strategy.
 *
 * Behavior:
 * - Cache fresh (<5 min): return cached immediately, no fetch
 * - Cache stale (5–30 min): return cached immediately, fetch in background
 * - Cache expired (>30 min) or empty: show loading, fetch fresh
 * - Handles errors with retry capability
 *
 * @param restaurantName - The restaurant to fetch menu items for
 * @returns { items, isLoading, error, retry }
 */
export function useMenuData(restaurantName: string): UseMenuDataReturn {
  const { items: cachedItems, lastFetchedAt, setItems } = useMenuCacheStore();

  const [items, setLocalItems] = useState<MenuItem[]>(cachedItems);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const getCacheAge = useCallback((): number | null => {
    if (lastFetchedAt === null) return null;
    return Date.now() - lastFetchedAt;
  }, [lastFetchedAt]);

  const fetchMenuItems = useCallback(
    async (showLoading: boolean) => {
      if (isFetchingRef.current) return;
      if (!restaurantName) return;

      isFetchingRef.current = true;

      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      const result = await firebaseService.getMenuItems(restaurantName);

      if (result.success) {
        setItems(result.data);
        setLocalItems(result.data);
      } else {
        // Only show error if we don't have cached data to display
        if (showLoading) {
          setError(result.error.message);
        }
      }

      setIsLoading(false);
      isFetchingRef.current = false;
    },
    [restaurantName, setItems],
  );

  const retry = useCallback(() => {
    const cacheAge = getCacheAge();
    const showLoading = cacheAge === null || cacheAge >= FORCE_REFRESH_THRESHOLD_MS;
    fetchMenuItems(showLoading);
  }, [fetchMenuItems, getCacheAge]);

  useEffect(() => {
    const cacheAge = getCacheAge();

    if (cacheAge === null) {
      // No cache — show loading and fetch fresh
      fetchMenuItems(true);
    } else if (cacheAge >= FORCE_REFRESH_THRESHOLD_MS) {
      // Cache expired (>30 min) — show loading and fetch fresh
      fetchMenuItems(true);
    } else if (cacheAge >= STALE_THRESHOLD_MS) {
      // Cache stale (5–30 min) — return cached, fetch in background
      setLocalItems(cachedItems);
      fetchMenuItems(false);
    } else {
      // Cache fresh (<5 min) — return cached immediately
      setLocalItems(cachedItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantName]);

  return { items, isLoading, error, retry };
}

export default useMenuData;
