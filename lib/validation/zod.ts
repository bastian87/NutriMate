import { z } from 'zod';

export const ObjectiveEnum = z.enum(['lose','maintain','gain','muscle']);
export const MacroGroupEnum = z.enum(['carb','protein','fat','vegfruit','treat']);

export const GoalUpsertSchema = z.object({
  targetKcalDay: z.number().int().min(800).max(6000),
  targetKcalWeek: z.number().int().optional(),
  targetKcalMonth: z.number().int().optional(),
  objective: ObjectiveEnum,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export const DayEntryItemSchema = z.object({
  ingredientId: z.string().uuid(),
  quantityGrams: z.number().int().min(1).max(2000),
});

export const DayEntryUpsertSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  goalId: z.string().uuid(),
  items: z.array(DayEntryItemSchema).min(1).max(50),
});

export const CalendarQuerySchema = z.object({
  range: z.enum(['week','month']),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const WeeklySummaryQuerySchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  goalId: z.string().uuid().optional(),
});

export const MonthlySummaryQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  goalId: z.string().uuid().optional(),
});