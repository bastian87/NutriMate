/**
 * API endpoint for managing daily nutrition entries
 */

import { NextRequest, NextResponse } from 'next/server';
import { UpsertDayEntrySchema, type UpsertDayEntryInput } from '../../../lib/validation/zod';
import { evaluateDay } from '../../../lib/nutri/validation';
import type { DayEntry, DayEntryItem, Ingredient } from '../../../types/nutri';

// Placeholder auth helper - replace with actual auth implementation
function getCurrentUserId(): string {
  // TODO: Replace with actual auth implementation
  return 'user-placeholder-id';
}

/**
 * Helper function to fetch ingredients by IDs
 * TODO: Replace with actual Supabase implementation
 */
async function fetchIngredients(ingredientIds: string[]): Promise<Ingredient[]> {
  // Mock implementation - replace with actual Supabase query
  const mockIngredients: Ingredient[] = [
    {
      id: 'ingredient-1',
      name: 'rice',
      locale: 'en',
      group: 'carb',
      kcal_per_100g: 130,
      created_at: new Date().toISOString()
    },
    {
      id: 'ingredient-2',
      name: 'chicken breast',
      locale: 'en',
      group: 'protein',
      kcal_per_100g: 165,
      created_at: new Date().toISOString()
    },
    {
      id: 'ingredient-3',
      name: 'olive oil',
      locale: 'en',
      group: 'fat',
      kcal_per_100g: 884,
      created_at: new Date().toISOString()
    },
    {
      id: 'ingredient-4',
      name: 'spinach',
      locale: 'en',
      group: 'vegfruit',
      kcal_per_100g: 23,
      created_at: new Date().toISOString()
    }
  ];
  
  return mockIngredients.filter(ing => ingredientIds.includes(ing.id));
}

/**
 * Helper function to get yesterday's date
 */
function getYesterdayDate(date: string): string {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Helper function to update user streaks
 * TODO: Replace with actual Supabase implementation
 */
async function updateStreaks(userId: string, isTodaySuccess: boolean, isYesterdaySuccess: boolean): Promise<void> {
  // Mock implementation - replace with actual Supabase query
  console.log(`Updating streaks for user ${userId}: today=${isTodaySuccess}, yesterday=${isYesterdaySuccess}`);
  
  // TODO: Implement actual streak logic:
  // 1. Fetch current streak record
  // 2. If today success and yesterday success => current++, else current=1
  // 3. best = max(best, current)
  // 4. Update streaks table
}

/**
 * Helper function to insert XP record
 * TODO: Replace with actual Supabase implementation
 */
async function insertXPRecord(userId: string, date: string, reason: 'day' | 'streak', amount: number, relatedId?: string): Promise<void> {
  // Mock implementation - replace with actual Supabase query
  console.log(`Inserting XP record: user=${userId}, date=${date}, reason=${reason}, amount=${amount}, relatedId=${relatedId}`);
  
  // TODO: Implement actual XP insertion:
  // await supabase
  //   .from('xp_ledger')
  //   .insert({
  //     user_id: userId,
  //     date,
  //     reason,
  //     amount,
  //     related_id: relatedId
  //   });
}

/**
 * POST /api/day-entries - Create or update a daily nutrition entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedInput = UpsertDayEntrySchema.parse(body);
    
    // Get current user ID (placeholder)
    const userId = getCurrentUserId();
    
    // Fetch ingredients to compute kcal per item
    const ingredientIds = validatedInput.items.map(item => item.ingredient_id);
    const ingredients = await fetchIngredients(ingredientIds);
    
    if (ingredients.length !== ingredientIds.length) {
      return NextResponse.json(
        { error: 'Some ingredients not found' },
        { status: 404 }
      );
    }
    
    // Build DayEntryItem list with denormalized "group"
    const dayEntryItems: DayEntryItem[] = validatedInput.items.map(item => {
      const ingredient = ingredients.find(ing => ing.id === item.ingredient_id);
      if (!ingredient) {
        throw new Error(`Ingredient not found: ${item.ingredient_id}`);
      }
      
      const kcal = Math.round(ingredient.kcal_per_100g * item.quantity_grams / 100);
      
      return {
        id: `item-${Date.now()}-${Math.random()}`,
        day_entry_id: `day-entry-${Date.now()}`,
        ingredient_id: item.ingredient_id,
        quantity_grams: item.quantity_grams,
        kcal,
        group: ingredient.group, // denormalized for fast validation
        created_at: new Date().toISOString()
      };
    });
    
    // TODO: Fetch goal to get target_kcal_day
    // For now, use a mock target
    const targetKcal = 2000;
    
    // Call evaluateDay to get validation result
    const evaluation = evaluateDay(dayEntryItems, targetKcal);
    
    // Create DayEntry with computed flags and isSuccess
    const dayEntry: DayEntry = {
      id: `day-entry-${Date.now()}`,
      user_id: userId,
      date: validatedInput.date,
      goal_id: validatedInput.goal_id,
      total_kcal: evaluation.totalsKcal,
      has_carb: evaluation.flags.hasCarb,
      has_protein: evaluation.flags.hasProtein,
      has_fat: evaluation.flags.hasFat,
      has_vegfruit: evaluation.flags.hasVegFruit,
      extras_count: evaluation.flags.extrasCount,
      is_success: evaluation.isSuccess,
      created_at: new Date().toISOString()
    };
    
    // TODO: Implement actual database transaction
    // await supabase.rpc('upsert_day_entry_with_items', {
    //   day_entry: dayEntry,
    //   day_entry_items: dayEntryItems
    // });
    
    // Update streaks
    const yesterdayDate = getYesterdayDate(validatedInput.date);
    // TODO: Check if yesterday was successful
    const isYesterdaySuccess = false; // Placeholder
    
    await updateStreaks(userId, evaluation.isSuccess, isYesterdaySuccess);
    
    // Insert XP records
    if (evaluation.isSuccess) {
      await insertXPRecord(userId, validatedInput.date, 'day', 50, dayEntry.id);
      
      // TODO: Check if streak >= 4 for bonus XP
      const currentStreak = 1; // Placeholder
      if (currentStreak >= 4) {
        await insertXPRecord(userId, validatedInput.date, 'streak', 25, dayEntry.id);
      }
    }
    
    return NextResponse.json(dayEntry, { status: 201 });
    
  } catch (error) {
    console.error('Error creating/updating day entry:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
