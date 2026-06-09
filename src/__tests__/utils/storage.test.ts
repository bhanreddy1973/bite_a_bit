/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { safeGetItem, safeSetItem } from '../../utils/storage';

describe('safeGetItem', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null for non-existent key', () => {
    expect(safeGetItem('nonexistent')).toBeNull();
  });

  it('parses and returns stored JSON object', () => {
    localStorage.setItem('test', JSON.stringify({ name: 'test' }));
    expect(safeGetItem('test')).toEqual({ name: 'test' });
  });

  it('parses and returns stored JSON array', () => {
    localStorage.setItem('arr', JSON.stringify([1, 2, 3]));
    expect(safeGetItem('arr')).toEqual([1, 2, 3]);
  });

  it('returns null for invalid JSON', () => {
    localStorage.setItem('bad', 'not valid json{');
    expect(safeGetItem('bad')).toBeNull();
  });

  it('returns null when localStorage throws', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('Access denied');
    });
    expect(safeGetItem('key')).toBeNull();
    vi.restoreAllMocks();
  });
});

describe('safeSetItem', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores a value and returns true', () => {
    const result = safeSetItem('key', { value: 42 });
    expect(result).toBe(true);
    expect(localStorage.getItem('key')).toBe(JSON.stringify({ value: 42 }));
  });

  it('stores an array and returns true', () => {
    const result = safeSetItem('arr', [1, 2, 3]);
    expect(result).toBe(true);
    expect(localStorage.getItem('arr')).toBe('[1,2,3]');
  });

  it('returns false when localStorage throws', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const result = safeSetItem('key', { data: 'test' });
    expect(result).toBe(false);
    vi.restoreAllMocks();
  });
});
