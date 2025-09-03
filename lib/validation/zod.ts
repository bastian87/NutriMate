/**
 * Zod validation schemas for Nutrimate gamified nutrition tracking
 */

import { z } from 'zod';

/**
 * Schema for creating or updating a goal
 */
export const CreateOrUpdateGoalSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  target_kcal_day: z.number().int().positive('Target daily calories must be positive'),
  target_kcal_week: z.number().int().positive('Target weekly calories must be positive').optional(),
  target_kcal_month: z.number().int().positive('Target monthly calories must be positive').optional(),
  objective: z.enum(['lose', 'maintain', 'gain', 'muscle'], {
    message: 'Objective must be one of: lose, maintain, gain, muscle'
  })
});

/**
 * Schema for day entry item input
 */
export const DayEntryItemInputSchema = z.object({
  ingredient_id: z.string().uuid('Ingredient ID must be a valid UUID'),
  quantity_grams: z.number().int().positive('Quantity must be a positive integer')
});

/**
 * Schema for creating or updating a day entry
 */
export const UpsertDayEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  items: z.array(DayEntryItemInputSchema).min(1, 'At least one item is required'),
  goal_id: z.string().uuid('Goal ID must be a valid UUID')
});

/**
 * Type exports for TypeScript
 */
export type CreateOrUpdateGoalInput = z.infer<typeof CreateOrUpdateGoalSchema>;
export type DayEntryItemInput = z.infer<typeof DayEntryItemInputSchema>;
export type UpsertDayEntryInput = z.infer<typeof UpsertDayEntrySchema>;
