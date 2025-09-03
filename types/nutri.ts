export type MacroGroup = 'carb' | 'protein' | 'fat' | 'vegfruit' | 'treat';

export interface Ingredient {
  id: string;
  name: string;
  group: MacroGroup;
  kcalPer100g: number;
  locale?: 'en';
}

export interface DayEntryItem {
  ingredientId: string;
  quantityGrams: number;
  kcal?: number;
  group?: MacroGroup;
}

export interface DayEntryResult {
  id: string;
  date: string;
  totalsKcal: number;
  flags: {
    hasCarb: boolean;
    hasProtein: boolean;
    hasFat: boolean;
    hasVegFruit: boolean;
    extrasCount: number;
  };
  isSuccess: boolean;
  goalId: string;
}