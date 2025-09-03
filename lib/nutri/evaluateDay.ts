import type { DayEntryItem } from '@/types/nutri';

export function evaluateDay(items: DayEntryItem[], targetKcal: number) {
  const totalsKcal = items.reduce((a, i) => a + (i.kcal ?? 0), 0);
  const hasCarb = items.some(i => i.group === 'carb');
  const hasProtein = items.some(i => i.group === 'protein');
  const hasFat = items.some(i => i.group === 'fat');
  const hasVegFruit = items.some(i => i.group === 'vegfruit');
  const extrasCount = items.filter(i => i.group === 'treat').length;

  const groupsOk = hasCarb && hasProtein && hasFat && hasVegFruit;
  const kcalOk = totalsKcal <= targetKcal;
  const noExtras = extrasCount === 0;

  const isSuccess = groupsOk && kcalOk && noExtras;

  return {
    totalsKcal,
    flags: { hasCarb, hasProtein, hasFat, hasVegFruit, extrasCount },
    isSuccess,
  };
}
