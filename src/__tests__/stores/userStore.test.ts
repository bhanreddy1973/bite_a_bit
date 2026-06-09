import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUserStore } from '@/stores/userStore';

// Mock authService at module level so dynamic import picks up the mock
vi.mock('@/services/authService', () => ({
  authService: {
    authenticate: vi.fn().mockImplementation((name: string, phone: string, restaurantName: string) =>
      Promise.resolve({
        success: true,
        data: {
          id: 'user_mock_123',
          name,
          phone,
          restaurantName,
          isAuthenticated: true,
        },
      })
    ),
  },
}));

describe('userStore', () => {
  beforeEach(async () => {
    // Reset only data state, keep action references intact
    useUserStore.setState({ session: null, isLoading: false });
    localStorage.clear();
    vi.restoreAllMocks();

    // Reset the mock to default successful behavior
    const { authService } = await import('@/services/authService');
    (authService.authenticate as ReturnType<typeof vi.fn>).mockImplementation(
      (name: string, phone: string, restaurantName: string) =>
        Promise.resolve({
          success: true,
          data: {
            id: 'user_mock_123',
            name,
            phone,
            restaurantName,
            isAuthenticated: true,
          },
        })
    );
  });

  describe('initial state', () => {
    it('should have null session and isLoading false by default', () => {
      const state = useUserStore.getState();
      expect(state.session).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('login', () => {
    it('should set session on successful login', async () => {
      const result = await useUserStore.getState().login('John Doe', '1234567890', 'pizza-palace');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
        expect(result.data.phone).toBe('1234567890');
        expect(result.data.restaurantName).toBe('pizza-palace');
        expect(result.data.isAuthenticated).toBe(true);
        expect(result.data.id).toBeDefined();
      }

      const state = useUserStore.getState();
      expect(state.session).not.toBeNull();
      expect(state.session?.name).toBe('John Doe');
      expect(state.session?.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should set isLoading to false after login completes', async () => {
      await useUserStore.getState().login('Jane', '9876543210', 'burger-barn');
      expect(useUserStore.getState().isLoading).toBe(false);
    });

    it('should not set session when authService returns failure', async () => {
      const { authService } = await import('@/services/authService');
      (authService.authenticate as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: { category: 'network', message: 'Network error' },
      });

      const result = await useUserStore.getState().login('John', '1234567890', 'test-restaurant');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe('network');
      }
      expect(useUserStore.getState().session).toBeNull();
      expect(useUserStore.getState().isLoading).toBe(false);
    });

    it('should handle unexpected errors gracefully', async () => {
      const { authService } = await import('@/services/authService');
      (authService.authenticate as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Unexpected'));

      const result = await useUserStore.getState().login('John', '1234567890', 'test');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe('unknown');
        expect(result.error.message).toContain('unexpected');
      }
      expect(useUserStore.getState().session).toBeNull();
      expect(useUserStore.getState().isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should reset session to null', async () => {
      await useUserStore.getState().login('John', '1234567890', 'restaurant');

      expect(useUserStore.getState().session).not.toBeNull();

      useUserStore.getState().logout();

      expect(useUserStore.getState().session).toBeNull();
      expect(useUserStore.getState().isLoading).toBe(false);
    });

    it('should clear localStorage entry', async () => {
      await useUserStore.getState().login('John', '1234567890', 'restaurant');

      useUserStore.getState().logout();

      expect(localStorage.getItem('bite-a-bit-user')).toBeNull();
    });
  });

  describe('setRestaurantName', () => {
    it('should update restaurantName in session', async () => {
      await useUserStore.getState().login('John', '1234567890', 'old-restaurant');

      useUserStore.getState().setRestaurantName('new-restaurant');

      expect(useUserStore.getState().session?.restaurantName).toBe('new-restaurant');
    });

    it('should do nothing if no session exists', () => {
      useUserStore.getState().setRestaurantName('new-restaurant');

      expect(useUserStore.getState().session).toBeNull();
    });
  });

  describe('hydration validation', () => {
    it('should discard invalid session from persisted state', () => {
      const persistOptions = (useUserStore as unknown as {
        persist: { getOptions: () => { merge: (persisted: unknown, current: unknown) => unknown } };
      }).persist.getOptions();

      const result = persistOptions.merge(
        { session: { id: '', name: 'test' } }, // invalid: empty id
        { session: null, isLoading: false }
      );

      expect((result as { session: null }).session).toBeNull();
    });

    it('should accept valid session from persisted state', () => {
      const persistOptions = (useUserStore as unknown as {
        persist: { getOptions: () => { merge: (persisted: unknown, current: unknown) => unknown } };
      }).persist.getOptions();

      const validSession = {
        id: 'user_123',
        name: 'John',
        phone: '1234567890',
        restaurantName: 'test-restaurant',
        isAuthenticated: true,
      };

      const result = persistOptions.merge(
        { session: validSession },
        { session: null, isLoading: false }
      );

      expect((result as { session: typeof validSession }).session).toEqual(validSession);
    });

    it('should handle null persisted state gracefully', () => {
      const persistOptions = (useUserStore as unknown as {
        persist: { getOptions: () => { merge: (persisted: unknown, current: unknown) => unknown } };
      }).persist.getOptions();

      const result = persistOptions.merge(
        null,
        { session: null, isLoading: false }
      );

      expect((result as { session: null }).session).toBeNull();
    });

    it('should reject session with missing required fields', () => {
      const persistOptions = (useUserStore as unknown as {
        persist: { getOptions: () => { merge: (persisted: unknown, current: unknown) => unknown } };
      }).persist.getOptions();

      const result = persistOptions.merge(
        { session: { id: 'user_1', name: 'John' } }, // missing phone, restaurantName, isAuthenticated
        { session: null, isLoading: false }
      );

      expect((result as { session: null }).session).toBeNull();
    });
  });
});
