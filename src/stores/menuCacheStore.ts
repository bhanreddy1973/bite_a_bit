import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MenuItem } from '@/types/menu';

const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const FORCE_REFRESH_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

export interface MenuCacheStore {
  // State
  items: MenuItem[];
  lastFetchedAt: number | null;
  isStale: boolean;

  // Actions
  setItems: (items: MenuItem[]) => void;
  invalidate: () => void;
  shouldRefresh: () => boolean;
}

export const useMenuCacheStore = create<MenuCacheStore>()(
  persist(
    (set, get) => ({
      items: [],
      lastFetchedAt: null,
      isStale: false,

      setItems: (items: MenuItem[]) => {
        set({
          items,
          lastFetchedAt: Date.now(),
          isStale: false,
        });
      },

      invalidate: () => {
        set({ isStale: true });
      },

      shouldRefresh: () => {
        const { lastFetchedAt } = get();

        // No cache exists — must fetch
        if (lastFetchedAt === null) {
          return true;
        }

        const age = Date.now() - lastFetchedAt;

        // Force refresh if cache exceeds 30 minutes
        if (age >= FORCE_REFRESH_THRESHOLD_MS) {
          return true;
        }

        // Stale after 5 minutes — background refresh recommended
        if (age >= STALE_THRESHOLD_MS) {
          set({ isStale: true });
          return true;
        }

        return false;
      },
    }),
    {
      name: 'bite-a-bit-menu-cache',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        lastFetchedAt: state.lastFetchedAt,
        isStale: state.isStale,
      }),
    },
  ),
);
