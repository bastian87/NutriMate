/**
 * Pure validation service for Nutrimate gamified nutrition tracking
 */

import type { DayEntryItem, DayEvaluationResult } from '../../types/nutri';

/**
 * Evaluates a day's nutrition entries against target calories and macro requirements
 * 
 * @param items - Array of day entry items consumed
 * @param targetKcal - Target daily calorie intake
 * @returns Evaluation result with totals, flags, and success status
 */
export function evaluateDay(items: DayEntryItem[], targetKcal: number): DayEvaluationResult {
  // Calculate total calories
  const totalsKcal = items.reduce((sum, item) => sum + item.kcal, 0);
  
  // Check for macro group presence
  const hasCarb = items.some(item => item.group === 'carb');
  const hasProtein = items.some(item => item.group === 'protein');
  const hasFat = items.some(item => item.group === 'fat');
  const hasVegFruit = items.some(item => item.group === 'vegfruit');
  
  // Count treats (extras)
  const extrasCount = items.filter(item => item.group === 'treat').length;
  
  // Determine success criteria:
  // 1. Has all four required macro groups (carb, protein, fat, vegfruit)
  // 2. Total calories within target
  // 3. No treats (extras)
  const hasAllMacros = hasCarb && hasProtein && hasFat && hasVegFruit;
  const withinCalorieTarget = totalsKcal <= targetKcal;
  const noExtras = extrasCount === 0;
  
  const isSuccess = hasAllMacros && withinCalorieTarget && noExtras;
  
  return {
    totalsKcal,
    flags: {
      hasCarb,
      hasProtein,
      hasFat,
      hasVegFruit,
      extrasCount
    },
    isSuccess
  };
}
