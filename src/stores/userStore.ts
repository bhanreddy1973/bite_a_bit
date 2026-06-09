import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserSession } from '@/types/user';
import { Result } from '@/types/common';

interface UserStore {
  session: UserSession | null;
  isLoading: boolean;

  login: (name: string, phone: string, restaurantName: string) => Promise<Result<UserSession>>;
  logout: () => void;
  setRestaurantName: (name: string) => void;
}

function isValidSession(session: unknown): session is UserSession {
  if (!session || typeof session !== 'object') return false;
  const s = session as Record<string, unknown>;
  return (
    typeof s.id === 'string' &&
    s.id.length > 0 &&
    typeof s.name === 'string' &&
    s.name.length > 0 &&
    typeof s.phone === 'string' &&
    s.phone.length > 0 &&
    typeof s.restaurantName === 'string' &&
    s.restaurantName.length > 0 &&
    typeof s.isAuthenticated === 'boolean'
  );
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      session: null,
      isLoading: false,

      login: async (
        name: string,
        phone: string,
        restaurantName: string,
      ): Promise<Result<UserSession>> => {
        set({ isLoading: true });

        try {
          const { authService } = await import('@/services/authService');
          const result = await authService.authenticate(name, phone, restaurantName);

          if (result.success) {
            set({ session: result.data, isLoading: false });
          } else {
            set({ isLoading: false });
          }

          return result;
        } catch {
          set({ isLoading: false });
          return {
            success: false,
            error: {
              category: 'unknown',
              message: 'An unexpected error occurred during login',
            },
          };
        }
      },

      logout: () => {
        set({ session: null, isLoading: false });
        // Clear the persisted localStorage entry
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bite-a-bit-user');
        }
      },

      setRestaurantName: (name: string) => {
        set((state) => {
          if (!state.session) return state;
          return {
            session: { ...state.session, restaurantName: name },
          };
        });
      },
    }),
    {
      name: 'bite-a-bit-user',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as { session?: unknown } | null;

        if (!persisted || !isValidSession(persisted.session)) {
          return { ...currentState, session: null };
        }

        return { ...currentState, session: persisted.session };
      },
    },
  ),
);
