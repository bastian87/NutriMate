/**
 * API endpoint for managing nutrition goals
 */

import { NextRequest, NextResponse } from 'next/server';
import { CreateOrUpdateGoalSchema, type CreateOrUpdateGoalInput } from '../../../lib/validation/zod';
import type { Goal } from '../../../types/nutri';

// Placeholder auth helper - replace with actual auth implementation
function getCurrentUserId(): string {
  // TODO: Replace with actual auth implementation
  return 'user-placeholder-id';
}

/**
 * POST /api/goals - Create or update a nutrition goal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedInput = CreateOrUpdateGoalSchema.parse(body);
    
    // Get current user ID (placeholder)
    const userId = getCurrentUserId();
    
    // Compute week/month targets if omitted
    const goalData: CreateOrUpdateGoalInput & {
      target_kcal_week: number;
      target_kcal_month: number;
    } = {
      ...validatedInput,
      target_kcal_week: validatedInput.target_kcal_week ?? validatedInput.target_kcal_day * 7,
      target_kcal_month: validatedInput.target_kcal_month ?? validatedInput.target_kcal_day * 30
    };
    
    // TODO: Replace with actual Supabase implementation
    // For now, return a mock response
    const goal: Goal = {
      id: 'goal-' + Date.now(),
      user_id: userId,
      start_date: goalData.start_date,
      end_date: goalData.end_date || null,
      target_kcal_day: goalData.target_kcal_day,
      target_kcal_week: goalData.target_kcal_week,
      target_kcal_month: goalData.target_kcal_month,
      objective: goalData.objective,
      created_at: new Date().toISOString()
    };
    
    // TODO: Implement actual database upsert
    // await supabase
    //   .from('goals')
    //   .upsert({
    //     user_id: userId,
    //     ...goalData,
    //     updated_at: new Date().toISOString()
    //   }, {
    //     onConflict: 'user_id,start_date'
    //   });
    
    return NextResponse.json(goal, { status: 201 });
    
  } catch (error) {
    console.error('Error creating/updating goal:', error);
    
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
