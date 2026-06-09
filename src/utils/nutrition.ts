export interface NutritionItem {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  quantity: number;
}

export interface NutritionTotals {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export interface MacroPercentages {
  carbs: number;
  protein: number;
  fat: number;
}

/**
 * Calculates total nutritional values from an array of items with quantities.
 * Each item's nutritional values are multiplied by its quantity before summing.
 */
export function calculateTotals(items: NutritionItem[]): NutritionTotals {
  return items.reduce(
    (totals, item) => ({
      calories: totals.calories + item.calories * item.quantity,
      carbs: totals.carbs + item.carbs * item.quantity,
      protein: totals.protein + item.protein * item.quantity,
      fat: totals.fat + item.fat * item.quantity,
    }),
    { calories: 0, carbs: 0, protein: 0, fat: 0 },
  );
}

/**
 * Calculates macro percentages from grams of carbs, protein, and fat.
 * Returns percentages rounded to the nearest whole number.
 * If all values are zero, returns { carbs: 0, protein: 0, fat: 0 }.
 */
export function calculateMacroPercentages(
  carbs: number,
  protein: number,
  fat: number,
): MacroPercentages {
  const total = carbs + protein + fat;

  if (total === 0) {
    return { carbs: 0, protein: 0, fat: 0 };
  }

  return {
    carbs: Math.round((carbs / total) * 100),
    protein: Math.round((protein / total) * 100),
    fat: Math.round((fat / total) * 100),
  };
}

/**
 * Calculates the protein ratio: protein / (carbs + protein + fat).
 * Returns a value between 0 and 1.
 * If all values are zero, returns 0.
 */
export function getProteinRatio(carbs: number, protein: number, fat: number): number {
  const total = carbs + protein + fat;

  if (total === 0) {
    return 0;
  }

  return protein / total;
}
