import { describe, it, expect } from 'vitest';
import { formatPrice, formatTime } from '../../utils/formatters';

describe('formatPrice', () => {
  it('formats a whole number with two decimals', () => {
    expect(formatPrice(249)).toBe('₹249.00');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('₹0.00');
  });

  it('formats a decimal value', () => {
    expect(formatPrice(99.5)).toBe('₹99.50');
  });

  it('formats a large price', () => {
    expect(formatPrice(1999)).toBe('₹1999.00');
  });

  it('rounds to two decimal places', () => {
    expect(formatPrice(10.999)).toBe('₹11.00');
  });
});

describe('formatTime', () => {
  it('returns string input as-is', () => {
    expect(formatTime('25 mins')).toBe('25 mins');
  });

  it('formats minutes less than 60', () => {
    expect(formatTime(25)).toBe('25 mins');
  });

  it('formats 1 minute (singular)', () => {
    expect(formatTime(1)).toBe('1 min');
  });

  it('formats exactly 60 minutes as 1 hr', () => {
    expect(formatTime(60)).toBe('1 hr');
  });

  it('formats 120 minutes as 2 hrs', () => {
    expect(formatTime(120)).toBe('2 hrs');
  });

  it('formats 90 minutes as 1 hr 30 mins', () => {
    expect(formatTime(90)).toBe('1 hr 30 mins');
  });

  it('formats 61 minutes as 1 hr 1 min', () => {
    expect(formatTime(61)).toBe('1 hr 1 min');
  });
});
