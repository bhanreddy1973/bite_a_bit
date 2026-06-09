import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { authService } from '@/services/authService';
import { firebaseService } from '@/services/firebaseService';
import { UserSession } from '@/types/user';
import { Result } from '@/types/common';

/**
 * **Validates: Requirements 4.2, 4.3, 12.3**
 *
 * Property 6: Validation Before Network
 * No network auth request (firebaseService.createUser) is made unless
 * client-side validation passes (name: 1–50 chars, letters+spaces only; phone: exactly 10 digits).
 */

vi.mock('@/services/firebaseService', () => ({
  firebaseService: {
    createUser: vi.fn(),
  },
}));

const mockCreateUser = vi.mocked(firebaseService.createUser);

describe('Property 6: Validation Before Network', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Arbitrary for invalid names: empty, >50 chars, or containing non-letter/space characters
  const invalidNameArb = fc.oneof(
    // Empty string
    fc.constant(''),
    // Name longer than 50 characters (letters only, but too long)
    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), {
      minLength: 51,
      maxLength: 100,
    }),
    // Name with digits
    fc.tuple(
      fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), {
        minLength: 0,
        maxLength: 10,
      }),
      fc.stringOf(fc.constantFrom(...'0123456789'.split('')), {
        minLength: 1,
        maxLength: 5,
      }),
      fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), {
        minLength: 0,
        maxLength: 10,
      })
    ).map(([a, b, c]) => a + b + c),
    // Name with special characters
    fc.tuple(
      fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), {
        minLength: 1,
        maxLength: 5,
      }),
      fc.constantFrom('!', '@', '#', '$', '%', '&', '*', '-', '_', '.', ',', '/')
    ).map(([name, special]) => name + special)
  );

  // Arbitrary for invalid phones: not exactly 10 digits
  const invalidPhoneArb = fc.oneof(
    // Empty string
    fc.constant(''),
    // Less than 10 digits
    fc.stringOf(fc.constantFrom(...'0123456789'.split('')), {
      minLength: 1,
      maxLength: 9,
    }),
    // More than 10 digits
    fc.stringOf(fc.constantFrom(...'0123456789'.split('')), {
      minLength: 11,
      maxLength: 20,
    }),
    // 10 characters but with non-digit characters
    fc.tuple(
      fc.stringOf(fc.constantFrom(...'0123456789'.split('')), {
        minLength: 5,
        maxLength: 9,
      }),
      fc.stringOf(fc.constantFrom(...'abcdefghij!@#$%'.split('')), {
        minLength: 1,
        maxLength: 5,
      })
    ).map(([digits, nonDigits]) => (digits + nonDigits).slice(0, 10))
  );

  // Arbitrary for valid names: 1-50 chars, letters and spaces only, starts with letter
  const validNameArb = fc
    .stringOf(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz '.split('')), {
      minLength: 1,
      maxLength: 50,
    })
    .filter((s) => /^[A-Za-z\s]+$/.test(s) && s.length >= 1 && s.length <= 50);

  // Arbitrary for valid phones: exactly 10 digits
  const validPhoneArb = fc.stringOf(fc.constantFrom(...'0123456789'.split('')), {
    minLength: 10,
    maxLength: 10,
  });

  // Arbitrary for restaurant name (any non-empty string)
  const restaurantNameArb = fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz_'.split('')), {
    minLength: 1,
    maxLength: 20,
  });

  it('should never call firebaseService.createUser when name is invalid', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidNameArb,
        validPhoneArb,
        restaurantNameArb,
        async (name, phone, restaurant) => {
          vi.clearAllMocks();

          const result = await authService.authenticate(name, phone, restaurant);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.category).toBe('validation');
          }
          expect(mockCreateUser).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never call firebaseService.createUser when phone is invalid', async () => {
    await fc.assert(
      fc.asyncProperty(
        validNameArb,
        invalidPhoneArb,
        restaurantNameArb,
        async (name, phone, restaurant) => {
          vi.clearAllMocks();

          const result = await authService.authenticate(name, phone, restaurant);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.category).toBe('validation');
          }
          expect(mockCreateUser).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never call firebaseService.createUser when both name and phone are invalid', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidNameArb,
        invalidPhoneArb,
        restaurantNameArb,
        async (name, phone, restaurant) => {
          vi.clearAllMocks();

          const result = await authService.authenticate(name, phone, restaurant);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.category).toBe('validation');
          }
          expect(mockCreateUser).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should call firebaseService.createUser when both name and phone are valid', async () => {
    const mockSession: UserSession = {
      id: 'user_prop_test',
      name: 'Test',
      phone: '1234567890',
      restaurantName: 'test_restaurant',
      isAuthenticated: true,
    };
    const mockResult: Result<UserSession> = { success: true, data: mockSession };
    mockCreateUser.mockResolvedValue(mockResult);

    await fc.assert(
      fc.asyncProperty(
        validNameArb,
        validPhoneArb,
        restaurantNameArb,
        async (name, phone, restaurant) => {
          vi.clearAllMocks();
          mockCreateUser.mockResolvedValue(mockResult);

          await authService.authenticate(name, phone, restaurant);

          expect(mockCreateUser).toHaveBeenCalledTimes(1);
          expect(mockCreateUser).toHaveBeenCalledWith(name, phone, restaurant);
        }
      ),
      { numRuns: 100 }
    );
  });
});
