import { describe, it, expect } from 'vitest';
import {
  calculateTotals,
  calculateMacroPercentages,
  getProteinRatio,
} from '../../utils/nutrition';

describe('calculateTotals', () => {
  it('returns zeros for an empty array', () => {
    expect(calculateTotals([])).toEqual({
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
    });
  });

  it('calculates totals for a single item with quantity 1', () => {
    const items = [{ calories: 200, carbs: 30, protein: 20, fat: 10, quantity: 1 }];
    expect(calculateTotals(items)).toEqual({
      calories: 200,
      carbs: 30,
      protein: 20,
      fat: 10,
    });
  });

  it('multiplies by quantity', () => {
    const items = [{ calories: 100, carbs: 10, protein: 5, fat: 3, quantity: 3 }];
    expect(calculateTotals(items)).toEqual({
      calories: 300,
      carbs: 30,
      protein: 15,
      fat: 9,
    });
  });

  it('sums multiple items', () => {
    const items = [
      { calories: 200, carbs: 30, protein: 20, fat: 10, quantity: 2 },
      { calories: 150, carbs: 20, protein: 15, fat: 8, quantity: 1 },
    ];
    expect(calculateTotals(items)).toEqual({
      calories: 550,
      carbs: 80,
      protein: 55,
      fat: 28,
    });
  });
});

describe('calculateMacroPercentages', () => {
  it('returns zeros when all inputs are zero', () => {
    expect(calculateMacroPercentages(0, 0, 0)).toEqual({
      carbs: 0,
      protein: 0,
      fat: 0,
    });
  });

  it('calculates correct percentages', () => {
    // 50g carbs, 30g protein, 20g fat = total 100g
    expect(calculateMacroPercentages(50, 30, 20)).toEqual({
      carbs: 50,
      protein: 30,
      fat: 20,
    });
  });

  it('rounds to nearest whole number', () => {
    // 33g carbs, 33g protein, 34g fat = total 100g
    expect(calculateMacroPercentages(33, 33, 34)).toEqual({
      carbs: 33,
      protein: 33,
      fat: 34,
    });
  });

  it('handles uneven distribution', () => {
    // 10g carbs, 10g protein, 10g fat = total 30g → each 33%
    const result = calculateMacroPercentages(10, 10, 10);
    expect(result.carbs).toBe(33);
    expect(result.protein).toBe(33);
    expect(result.fat).toBe(33);
  });
});

describe('getProteinRatio', () => {
  it('returns 0 when all inputs are zero', () => {
    expect(getProteinRatio(0, 0, 0)).toBe(0);
  });

  it('returns correct ratio', () => {
    // protein=30, total=100 → 0.3
    expect(getProteinRatio(50, 30, 20)).toBe(0.3);
  });

  it('returns 1 when only protein is present', () => {
    expect(getProteinRatio(0, 50, 0)).toBe(1);
  });

  it('returns 0 when protein is zero', () => {
    expect(getProteinRatio(50, 0, 50)).toBe(0);
  });

  it('calculates ratio for typical meal', () => {
    // carbs=40, protein=25, fat=15 → total=80, ratio=25/80=0.3125
    const ratio = getProteinRatio(40, 25, 15);
    expect(ratio).toBeCloseTo(0.3125);
  });
});
