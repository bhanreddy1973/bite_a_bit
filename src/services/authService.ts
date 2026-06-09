import { validateName, validatePhone } from '@/utils/validation';
import { firebaseService } from './firebaseService';
import { Result } from '@/types/common';
import { UserSession } from '@/types/user';

export interface IAuthService {
  authenticate(name: string, phone: string, restaurantName: string): Promise<Result<UserSession>>;
}

/**
 * Authentication service.
 * Validates inputs before making any network call, then delegates to
 * firebaseService.createUser for user creation/retrieval.
 */
export const authService: IAuthService = {
  async authenticate(
    name: string,
    phone: string,
    restaurantName: string,
  ): Promise<Result<UserSession>> {
    // Validate name before network call
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return {
        success: false,
        error: {
          category: 'validation',
          message: nameValidation.error || 'Invalid name',
        },
      };
    }

    // Validate phone before network call
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      return {
        success: false,
        error: {
          category: 'validation',
          message: phoneValidation.error || 'Invalid phone number',
        },
      };
    }

    // Both validations passed — make network call
    return firebaseService.createUser(name, phone, restaurantName);
  },
};
