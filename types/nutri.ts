/**
 * Core types for Nutrimate gamified nutrition tracking system
 */

/**
 * Macro group types for nutritional categorization
 */
export type MacroGroup = 'carb' | 'protein' | 'fat' | 'vegfruit' | 'treat';

/**
 * Ingredient type representing food items with nutritional data
 */
export interface Ingredient {
  id: string;
  name: string;
  locale: string;
  group: MacroGroup;
  kcal_per_100g: number;
  created_at: string;
}

/**
 * Day entry item representing a single food item consumed
 */
export interface DayEntryItem {
  id: string;
  day_entry_id: string;
  ingredient_id: string;
  quantity_grams: number;
  kcal: number;
  group: MacroGroup; // denormalized for fast validation
  created_at: string;
}

/**
 * Day entry representing a complete day's nutrition tracking
 */
export interface DayEntry {
  id: string;
  user_id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  goal_id: string;
  total_kcal: number;
  has_carb: boolean;
  has_protein: boolean;
  has_fat: boolean;
  has_vegfruit: boolean;
  extras_count: number;
  is_success: boolean;
  created_at: string;
}

/**
 * Goal type representing user nutrition objectives
 */
export interface Goal {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  target_kcal_day: number;
  target_kcal_week: number;
  target_kcal_month: number;
  objective: 'lose' | 'maintain' | 'gain' | 'muscle';
  created_at: string;
}

/**
 * Validation result for day evaluation
 */
export interface DayEvaluationResult {
  totalsKcal: number;
  flags: {
    hasCarb: boolean;
    hasProtein: boolean;
    hasFat: boolean;
    hasVegFruit: boolean;
    extrasCount: number;
  };
  isSuccess: boolean;
}
