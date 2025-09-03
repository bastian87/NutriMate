/**
 * Unit tests for nutrition validation service
 */

import { evaluateDay } from '../../../lib/nutri/validation';
import type { DayEntryItem } from '../../../types/nutri';

describe('evaluateDay', () => {
  const targetKcal = 2000;
  
  // Helper function to create mock day entry items
  const createItem = (
    group: 'carb' | 'protein' | 'fat' | 'vegfruit' | 'treat',
    kcal: number,
    quantity_grams: number = 100
  ): DayEntryItem => ({
    id: `item-${Math.random()}`,
    day_entry_id: 'day-entry-1',
    ingredient_id: `ingredient-${Math.random()}`,
    quantity_grams,
    kcal,
    group,
    created_at: new Date().toISOString()
  });

  describe('success cases', () => {
    it('should return success when all requirements are met', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 400),      // rice
        createItem('protein', 300),   // chicken breast
        createItem('fat', 200),       // olive oil
        createItem('vegfruit', 100)   // spinach
      ];

      const result = evaluateDay(items, targetKcal);

      expect(result.totalsKcal).toBe(1000);
      expect(result.flags.hasCarb).toBe(true);
      expect(result.flags.hasProtein).toBe(true);
      expect(result.flags.hasFat).toBe(true);
      expect(result.flags.hasVegFruit).toBe(true);
      expect(result.flags.extrasCount).toBe(0);
      expect(result.isSuccess).toBe(true);
    });

    it('should return success when exactly at calorie target', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 500),
        createItem('protein', 500),
        createItem('fat', 500),
        createItem('vegfruit', 500)
      ];

      const result = evaluateDay(items, targetKcal);

      expect(result.totalsKcal).toBe(2000);
      expect(result.isSuccess).toBe(true);
    });
  });

  describe('failure cases', () => {
    it('should fail when calories exceed target', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 600),
        createItem('protein', 600),
        createItem('fat', 600),
        createItem('vegfruit', 600)
      ];

      const result = evaluateDay(items, targetKcal);

      expect(result.totalsKcal).toBe(2400);
      expect(result.flags.hasCarb).toBe(true);
      expect(result.flags.hasProtein).toBe(true);
      expect(result.flags.hasFat).toBe(true);
      expect(result.flags.hasVegFruit).toBe(true);
      expect(result.flags.extrasCount).toBe(0);
      expect(result.isSuccess).toBe(false);
    });

    it('should fail when missing carb group', () => {
      const items: DayEntryItem[] = [
        createItem('protein', 400),
        createItem('fat', 300),
        createItem('vegfruit', 200)
      ];

      const result = evaluateDay(items, targetKcal);

      expect(result.totalsKcal).toBe(900);
      expect(result.flags.hasCarb).toBe(false);
      expect(result.flags.hasProtein).toBe(true);
      expect(result.flags.hasFat).toBe(true);
      expect(result.flags.hasVegFruit).toBe(true);
      expect(result.flags.extrasCount).toBe(0);
      expect(result.isSuccess).toBe(false);
    });

    it('should fail when missing protein group', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 400),
        createItem('fat', 300),
        createItem('vegfruit', 200)
      ];

      const result = evaluateDay(items, targetKcal);

      expect(result.totalsKcal).toBe(900);
      expect(result.flags.hasCarb).toBe(true);
      expect(result.flags.hasProtein).toBe(false);
      expect(result.flags.hasFat).toBe(true);
      expect(result.flags.hasVegFruit).toBe(true);
      expect(result.flags.extrasCount).toBe(0);
      expect(result.isSuccess).toBe(false);
    });

    it('should fail when missing fat group', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 400),
        createItem('protein', 300),
        createItem('vegfruit', 200)
      ];

      const result = evaluateDay(items, targetKcal);

      expect(result.totalsKcal).toBe(900);
      expect(result.flags.hasCarb).toBe(true);
      expect(result.flags.hasProtein).toBe(true);
      expect(result.flags.hasFat).toBe(false);
      expect(result.flags.hasVegFruit).toBe(true);
      expect(result.flags.extrasCount).toBe(0);
      expect(result.isSuccess).toBe(false);
    });

    it('should fail when missing vegfruit group', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 400),
        createItem('protein', 300),
        createItem('fat', 200)
      ];

      const result = evaluateDay(items, targetKcal);

      expect(result.totalsKcal).toBe(900);
      expect(result.flags.hasCarb).toBe(true);
      expect(result.flags.hasProtein).toBe(true);
      expect(result.flags.hasFat).toBe(true);
      expect(result.flags.hasVegFruit).toBe(false);
      expect(result.flags.extrasCount).toBe(0);
      expect(result.isSuccess).toBe(false);
    });

    it('should fail when has treats (extras)', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 400),
        createItem('protein', 300),
        createItem('fat', 200),
        createItem('vegfruit', 100),
        createItem('treat', 150) // ice cream
      ];

      const result = evaluateDay(items, targetKcal);

      expect(result.totalsKcal).toBe(1150);
      expect(result.flags.hasCarb).toBe(true);
      expect(result.flags.hasProtein).toBe(true);
      expect(result.flags.hasFat).toBe(true);
      expect(result.flags.hasVegFruit).toBe(true);
      expect(result.flags.extrasCount).toBe(1);
      expect(result.isSuccess).toBe(false);
    });

    it('should fail when has multiple treats', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 400),
        createItem('protein', 300),
        createItem('fat', 200),
        createItem('vegfruit', 100),
        createItem('treat', 150), // ice cream
        createItem('treat', 200)  // chocolate bar
      ];

      const result = evaluateDay(items, targetKcal);

      expect(result.totalsKcal).toBe(1350);
      expect(result.flags.extrasCount).toBe(2);
      expect(result.isSuccess).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty items array', () => {
      const items: DayEntryItem[] = [];

      const result = evaluateDay(items, targetKcal);

      expect(result.totalsKcal).toBe(0);
      expect(result.flags.hasCarb).toBe(false);
      expect(result.flags.hasProtein).toBe(false);
      expect(result.flags.hasFat).toBe(false);
      expect(result.flags.hasVegFruit).toBe(false);
      expect(result.flags.extrasCount).toBe(0);
      expect(result.isSuccess).toBe(false);
    });

    it('should handle zero calorie target', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 1)
      ];

      const result = evaluateDay(items, 0);

      expect(result.totalsKcal).toBe(1);
      expect(result.isSuccess).toBe(false);
    });

    it('should handle items with zero calories', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 0),
        createItem('protein', 0),
        createItem('fat', 0),
        createItem('vegfruit', 0)
      ];

      const result = evaluateDay(items, targetKcal);

      expect(result.totalsKcal).toBe(0);
      expect(result.flags.hasCarb).toBe(true);
      expect(result.flags.hasProtein).toBe(true);
      expect(result.flags.hasFat).toBe(true);
      expect(result.flags.hasVegFruit).toBe(true);
      expect(result.flags.extrasCount).toBe(0);
      expect(result.isSuccess).toBe(true);
    });

    it('should handle negative calorie target', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 100)
      ];

      const result = evaluateDay(items, -100);

      expect(result.totalsKcal).toBe(100);
      expect(result.isSuccess).toBe(false);
    });

    it('should handle very large calorie values', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 1000000),
        createItem('protein', 1000000),
        createItem('fat', 1000000),
        createItem('vegfruit', 1000000)
      ];

      const result = evaluateDay(items, 2000);

      expect(result.totalsKcal).toBe(4000000);
      expect(result.flags.hasCarb).toBe(true);
      expect(result.flags.hasProtein).toBe(true);
      expect(result.flags.hasFat).toBe(true);
      expect(result.flags.hasVegFruit).toBe(true);
      expect(result.flags.extrasCount).toBe(0);
      expect(result.isSuccess).toBe(false);
    });

    it('should handle decimal calorie values', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 499.5),
        createItem('protein', 499.5),
        createItem('fat', 499.5),
        createItem('vegfruit', 499.5)
      ];

      const result = evaluateDay(items, 2000);

      expect(result.totalsKcal).toBe(1998);
      expect(result.flags.hasCarb).toBe(true);
      expect(result.flags.hasProtein).toBe(true);
      expect(result.flags.hasFat).toBe(true);
      expect(result.flags.hasVegFruit).toBe(true);
      expect(result.flags.extrasCount).toBe(0);
      expect(result.isSuccess).toBe(true);
    });

    it('should handle multiple items of same group', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 200), // rice
        createItem('carb', 200), // bread
        createItem('protein', 300), // chicken
        createItem('fat', 200), // olive oil
        createItem('vegfruit', 100) // spinach
      ];

      const result = evaluateDay(items, targetKcal);

      expect(result.totalsKcal).toBe(1000);
      expect(result.flags.hasCarb).toBe(true);
      expect(result.flags.hasProtein).toBe(true);
      expect(result.flags.hasFat).toBe(true);
      expect(result.flags.hasVegFruit).toBe(true);
      expect(result.flags.extrasCount).toBe(0);
      expect(result.isSuccess).toBe(true);
    });

    it('should handle only treats (no valid groups)', () => {
      const items: DayEntryItem[] = [
        createItem('treat', 100),
        createItem('treat', 200),
        createItem('treat', 300)
      ];

      const result = evaluateDay(items, targetKcal);

      expect(result.totalsKcal).toBe(600);
      expect(result.flags.hasCarb).toBe(false);
      expect(result.flags.hasProtein).toBe(false);
      expect(result.flags.hasFat).toBe(false);
      expect(result.flags.hasVegFruit).toBe(false);
      expect(result.flags.extrasCount).toBe(3);
      expect(result.isSuccess).toBe(false);
    });

    it('should handle mixed treats and valid groups', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 400),
        createItem('protein', 300),
        createItem('fat', 200),
        createItem('vegfruit', 100),
        createItem('treat', 150), // ice cream
        createItem('treat', 100)  // soda
      ];

      const result = evaluateDay(items, targetKcal);

      expect(result.totalsKcal).toBe(1250);
      expect(result.flags.hasCarb).toBe(true);
      expect(result.flags.hasProtein).toBe(true);
      expect(result.flags.hasFat).toBe(true);
      expect(result.flags.hasVegFruit).toBe(true);
      expect(result.flags.extrasCount).toBe(2);
      expect(result.isSuccess).toBe(false);
    });

    it('should handle boundary calorie values (exactly at limit)', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 500),
        createItem('protein', 500),
        createItem('fat', 500),
        createItem('vegfruit', 500)
      ];

      const result = evaluateDay(items, 2000);

      expect(result.totalsKcal).toBe(2000);
      expect(result.isSuccess).toBe(true);
    });

    it('should handle boundary calorie values (just over limit)', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 500),
        createItem('protein', 500),
        createItem('fat', 500),
        createItem('vegfruit', 501) // 1 calorie over
      ];

      const result = evaluateDay(items, 2000);

      expect(result.totalsKcal).toBe(2001);
      expect(result.isSuccess).toBe(false);
    });

    it('should handle items with very small quantities', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 0.1, 1), // 1 gram of rice
        createItem('protein', 0.1, 1), // 1 gram of chicken
        createItem('fat', 0.1, 1), // 1 gram of oil
        createItem('vegfruit', 0.1, 1) // 1 gram of spinach
      ];

      const result = evaluateDay(items, targetKcal);

      expect(result.totalsKcal).toBe(0.4);
      expect(result.flags.hasCarb).toBe(true);
      expect(result.flags.hasProtein).toBe(true);
      expect(result.flags.hasFat).toBe(true);
      expect(result.flags.hasVegFruit).toBe(true);
      expect(result.flags.extrasCount).toBe(0);
      expect(result.isSuccess).toBe(true);
    });

    it('should handle items with very large quantities', () => {
      const items: DayEntryItem[] = [
        createItem('carb', 1000, 10000), // 10kg of rice
        createItem('protein', 1000, 10000), // 10kg of chicken
        createItem('fat', 1000, 10000), // 10kg of oil
        createItem('vegfruit', 1000, 10000) // 10kg of spinach
      ];

      const result = evaluateDay(items, targetKcal);

      expect(result.totalsKcal).toBe(4000);
      expect(result.flags.hasCarb).toBe(true);
      expect(result.flags.hasProtein).toBe(true);
      expect(result.flags.hasFat).toBe(true);
      expect(result.flags.hasVegFruit).toBe(true);
      expect(result.flags.extrasCount).toBe(0);
      expect(result.isSuccess).toBe(false);
    });
  });
});
