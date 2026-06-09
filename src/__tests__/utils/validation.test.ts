import { describe, it, expect } from 'vitest';
import { validateName, validatePhone } from '../../utils/validation';

describe('validateName', () => {
  it('returns valid for a normal name', () => {
    expect(validateName('John Doe')).toEqual({ valid: true });
  });

  it('returns valid for a single character name', () => {
    expect(validateName('A')).toEqual({ valid: true });
  });

  it('returns valid for a 50 character name', () => {
    const name = 'A'.repeat(50);
    expect(validateName(name)).toEqual({ valid: true });
  });

  it('returns error for empty string', () => {
    const result = validateName('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error for name exceeding 50 characters', () => {
    const name = 'A'.repeat(51);
    const result = validateName(name);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('50');
  });

  it('returns error for name with numbers', () => {
    const result = validateName('John123');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('letters and spaces');
  });

  it('returns error for name with special characters', () => {
    const result = validateName('John@Doe');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('letters and spaces');
  });

  it('allows names with spaces', () => {
    expect(validateName('Mary Jane Watson')).toEqual({ valid: true });
  });
});

describe('validatePhone', () => {
  it('returns valid for exactly 10 digits', () => {
    expect(validatePhone('9876543210')).toEqual({ valid: true });
  });

  it('returns error for empty string', () => {
    const result = validatePhone('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error for fewer than 10 digits', () => {
    const result = validatePhone('12345');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('10 digits');
  });

  it('returns error for more than 10 digits', () => {
    const result = validatePhone('12345678901');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('10 digits');
  });

  it('returns error for non-numeric input', () => {
    const result = validatePhone('abcdefghij');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('10 digits');
  });

  it('returns error for phone with special characters', () => {
    const result = validatePhone('+919876543');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('10 digits');
  });
});
