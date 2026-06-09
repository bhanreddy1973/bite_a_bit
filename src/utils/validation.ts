export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a user name.
 * Rules: 1–50 characters, letters and spaces only.
 */
export function validateName(name: string): ValidationResult {
  if (!name || name.length === 0) {
    return { valid: false, error: 'Name is required' };
  }

  if (name.length > 50) {
    return { valid: false, error: 'Name must be 50 characters or less' };
  }

  if (!/^[A-Za-z\s]+$/.test(name)) {
    return { valid: false, error: 'Name must contain only letters and spaces' };
  }

  return { valid: true };
}

/**
 * Validates a phone number.
 * Rules: exactly 10 digits (Indian numbers).
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.length === 0) {
    return { valid: false, error: 'Phone number is required' };
  }

  if (!/^\d{10}$/.test(phone)) {
    return { valid: false, error: 'Phone number must be exactly 10 digits' };
  }

  return { valid: true };
}
