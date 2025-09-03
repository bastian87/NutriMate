import { evaluateDay } from '@/lib/nutri/evaluateDay';

describe('evaluateDay', () => {
  it('success (4 groups, <= kcal, no extras)', () => {
    const items = [
      { ingredientId: 'a', quantityGrams: 100, kcal: 130, group: 'carb' },
      { ingredientId: 'b', quantityGrams: 100, kcal: 165, group: 'protein' },
      { ingredientId: 'c', quantityGrams: 10,  kcal: 88,  group: 'fat' },
      { ingredientId: 'd', quantityGrams: 150, kcal: 34,  group: 'vegfruit' },
    ];
    const res = evaluateDay(items, 600);
    expect(res.isSuccess).toBe(true);
  });

  it('fail by kcal', () => {
    const items = [
      { ingredientId: 'a', quantityGrams: 100, kcal: 500, group: 'carb' },
      { ingredientId: 'b', quantityGrams: 100, kcal: 500, group: 'protein' },
      { ingredientId: 'c', quantityGrams: 10,  kcal: 200, group: 'fat' },
      { ingredientId: 'd', quantityGrams: 150, kcal: 200, group: 'vegfruit' },
    ];
    const res = evaluateDay(items, 1000);
    expect(res.isSuccess).toBe(false);
  });

  it('fail by missing group', () => {
    const items = [
      { ingredientId: 'a', quantityGrams: 100, kcal: 130, group: 'carb' },
      { ingredientId: 'b', quantityGrams: 100, kcal: 165, group: 'protein' },
      { ingredientId: 'c', quantityGrams: 10,  kcal: 88,  group: 'fat' },
    ];
    const res = evaluateDay(items, 600);
    expect(res.isSuccess).toBe(false);
  });

  it('fail by extra present', () => {
    const items = [
      { ingredientId: 'a', quantityGrams: 100, kcal: 130, group: 'carb' },
      { ingredientId: 'b', quantityGrams: 100, kcal: 165, group: 'protein' },
      { ingredientId: 'c', quantityGrams: 10,  kcal: 88,  group: 'fat' },
      { ingredientId: 'd', quantityGrams: 150, kcal: 34,  group: 'vegfruit' },
      { ingredientId: 'e', quantityGrams: 50,  kcal: 200, group: 'treat' },
    ];
    const res = evaluateDay(items, 900);
    expect(res.isSuccess).toBe(false);
  });
});
