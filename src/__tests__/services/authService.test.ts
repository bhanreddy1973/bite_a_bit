import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@/services/authService';
import { firebaseService } from '@/services/firebaseService';
import { UserSession } from '@/types/user';
import { Result } from '@/types/common';

vi.mock('@/services/firebaseService', () => ({
  firebaseService: {
    createUser: vi.fn(),
  },
}));

const mockCreateUser = vi.mocked(firebaseService.createUser);

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticate - validation', () => {
    it('returns validation error for empty name', async () => {
      const result = await authService.authenticate('', '9876543210', 'bbq_in');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe('validation');
        expect(result.error.message).toBe('Name is required');
      }
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it('returns validation error for name exceeding 50 characters', async () => {
      const longName = 'A'.repeat(51);
      const result = await authService.authenticate(longName, '9876543210', 'bbq_in');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe('validation');
        expect(result.error.message).toBe('Name must be 50 characters or less');
      }
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it('returns validation error for name with invalid characters', async () => {
      const result = await authService.authenticate('John123', '9876543210', 'bbq_in');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe('validation');
        expect(result.error.message).toBe('Name must contain only letters and spaces');
      }
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it('returns validation error for empty phone', async () => {
      const result = await authService.authenticate('John', '', 'bbq_in');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe('validation');
        expect(result.error.message).toBe('Phone number is required');
      }
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it('returns validation error for phone not exactly 10 digits', async () => {
      const result = await authService.authenticate('John', '12345', 'bbq_in');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe('validation');
        expect(result.error.message).toBe('Phone number must be exactly 10 digits');
      }
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it('returns validation error for phone with non-digit characters', async () => {
      const result = await authService.authenticate('John', '98765abcde', 'bbq_in');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe('validation');
        expect(result.error.message).toBe('Phone number must be exactly 10 digits');
      }
      expect(mockCreateUser).not.toHaveBeenCalled();
    });
  });

  describe('authenticate - successful flow', () => {
    it('calls firebaseService.createUser with valid inputs and returns result', async () => {
      const mockSession: UserSession = {
        id: 'user_123',
        name: 'John Doe',
        phone: '9876543210',
        restaurantName: 'bbq_in',
        isAuthenticated: true,
      };
      const mockResult: Result<UserSession> = { success: true, data: mockSession };
      mockCreateUser.mockResolvedValue(mockResult);

      const result = await authService.authenticate('John Doe', '9876543210', 'bbq_in');

      expect(mockCreateUser).toHaveBeenCalledWith('John Doe', '9876543210', 'bbq_in');
      expect(mockCreateUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('passes through failure result from firebaseService', async () => {
      const mockResult: Result<UserSession> = {
        success: false,
        error: { category: 'network', message: 'Unable to connect' },
      };
      mockCreateUser.mockResolvedValue(mockResult);

      const result = await authService.authenticate('Jane', '1234567890', 'pizza_place');

      expect(mockCreateUser).toHaveBeenCalledWith('Jane', '1234567890', 'pizza_place');
      expect(result).toEqual(mockResult);
    });

    it('accepts a name with spaces (valid)', async () => {
      const mockResult: Result<UserSession> = {
        success: true,
        data: {
          id: 'user_456',
          name: 'Mary Jane Watson',
          phone: '5551234567',
          restaurantName: 'bbq_in',
          isAuthenticated: true,
        },
      };
      mockCreateUser.mockResolvedValue(mockResult);

      const result = await authService.authenticate('Mary Jane Watson', '5551234567', 'bbq_in');

      expect(result.success).toBe(true);
      expect(mockCreateUser).toHaveBeenCalledTimes(1);
    });

    it('accepts a single character name (valid)', async () => {
      const mockResult: Result<UserSession> = {
        success: true,
        data: {
          id: 'user_789',
          name: 'A',
          phone: '0000000000',
          restaurantName: 'test',
          isAuthenticated: true,
        },
      };
      mockCreateUser.mockResolvedValue(mockResult);

      const result = await authService.authenticate('A', '0000000000', 'test');

      expect(result.success).toBe(true);
      expect(mockCreateUser).toHaveBeenCalledTimes(1);
    });

    it('accepts a 50 character name (boundary valid)', async () => {
      const name50 = 'A'.repeat(50);
      const mockResult: Result<UserSession> = {
        success: true,
        data: {
          id: 'user_boundary',
          name: name50,
          phone: '1111111111',
          restaurantName: 'test',
          isAuthenticated: true,
        },
      };
      mockCreateUser.mockResolvedValue(mockResult);

      const result = await authService.authenticate(name50, '1111111111', 'test');

      expect(result.success).toBe(true);
      expect(mockCreateUser).toHaveBeenCalledTimes(1);
    });
  });
});
