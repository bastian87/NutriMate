/**
 * API endpoint for weekly summary computation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Placeholder auth helper - replace with actual auth implementation
function getCurrentUserId(): string {
  // TODO: Replace with actual auth implementation
  return 'user-placeholder-id';
}

/**
 * Schema for weekly summary query parameters
 */
const WeeklySummaryQuerySchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  goalId: z.string().uuid('Invalid goal ID format')
});

/**
 * Weekly summary response interface
 */
interface WeeklySummaryResponse {
  weekStart: string;
  goalId: string;
  totalKcal: number;
  targetKcalWeek: number;
  successDaysCount: number;
  daysWithData: number;
  isSuccess: boolean;
  xpAwarded: boolean;
  xpAmount?: number;
}

/**
 * Mock goal data
 */
const mockGoal = {
  id: 'goal-123',
  user_id: 'user-placeholder-id',
  target_kcal_day: 2000,
  target_kcal_week: 14000, // 7 days * 2000 kcal
  target_kcal_month: 60000, // 30 days * 2000 kcal
  objective: 'maintain' as const
};

/**
 * Mock day entries for the week
 */
const mockDayEntries = [
  { date: '2024-01-01', total_kcal: 1950, is_success: true },
  { date: '2024-01-02', total_kcal: 2100, is_success: false },
  { date: '2024-01-03', total_kcal: 1850, is_success: true },
  { date: '2024-01-04', total_kcal: 2000, is_success: true },
  { date: '2024-01-05', total_kcal: 1950, is_success: true },
  { date: '2024-01-06', total_kcal: 2200, is_success: false },
  { date: '2024-01-07', total_kcal: 1900, is_success: true }
];

/**
 * Mock XP ledger to check if weekly XP was already awarded
 */
const mockXpLedger = [
  { date: '2024-01-01', reason: 'day', amount: 50 },
  { date: '2024-01-03', reason: 'day', amount: 50 },
  { date: '2024-01-04', reason: 'day', amount: 50 },
  { date: '2024-01-05', reason: 'day', amount: 50 },
  { date: '2024-01-07', reason: 'day', amount: 50 }
  // No weekly XP awarded yet
];

/**
 * Helper function to get week start date
 */
function getWeekStart(date: string): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(d.setDate(diff));
  return weekStart.toISOString().split('T')[0];
}

/**
 * Helper function to generate dates in week
 */
function getWeekDates(weekStart: string): string[] {
  const dates: string[] = [];
  const startDate = new Date(weekStart);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

/**
 * Helper function to check if weekly XP was already awarded
 */
function wasWeeklyXpAwarded(userId: string, weekStart: string): boolean {
  // TODO: Replace with actual Supabase query
  // Check if there's an XP ledger entry for this week with reason 'week'
  return mockXpLedger.some(entry => 
    entry.reason === 'week' && 
    entry.date >= weekStart && 
    entry.date < new Date(new Date(weekStart).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
}

/**
 * Helper function to award weekly XP
 */
async function awardWeeklyXp(userId: string, weekStart: string): Promise<boolean> {
  // TODO: Replace with actual Supabase insert
  // Insert XP ledger entry with reason 'week', amount 200
  console.log(`Awarding +200 XP for perfect week ${weekStart} to user ${userId}`);
  return true;
}

/**
 * GET /api/summary/weekly - Get weekly summary
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryParams = {
      weekStart: searchParams.get('weekStart'),
      goalId: searchParams.get('goalId')
    };
    
    const validatedParams = WeeklySummaryQuerySchema.parse(queryParams);
    
    // Get current user ID (placeholder)
    const userId = getCurrentUserId();
    
    const { weekStart, goalId } = validatedParams;
    
    // TODO: Replace with actual Supabase queries
    // 1. Fetch goal data
    const goal = mockGoal;
    
    // 2. Fetch day entries for the week
    const weekDates = getWeekDates(weekStart);
    const dayEntries = mockDayEntries.filter(entry => 
      weekDates.includes(entry.date)
    );
    
    // 3. Calculate summary metrics
    const totalKcal = dayEntries.reduce((sum, entry) => sum + entry.total_kcal, 0);
    const successDaysCount = dayEntries.filter(entry => entry.is_success).length;
    const daysWithData = dayEntries.length;
    
    // 4. Determine if week is successful
    const isSuccess = (successDaysCount === daysWithData) && (totalKcal <= goal.target_kcal_week);
    
    // 5. Check if weekly XP was already awarded
    const xpAlreadyAwarded = wasWeeklyXpAwarded(userId, weekStart);
    
    // 6. Award XP if successful and not already awarded
    let xpAwarded = false;
    let xpAmount = 0;
    
    if (isSuccess && !xpAlreadyAwarded) {
      const awarded = await awardWeeklyXp(userId, weekStart);
      if (awarded) {
        xpAwarded = true;
        xpAmount = 200;
      }
    }
    
    const response: WeeklySummaryResponse = {
      weekStart,
      goalId,
      totalKcal,
      targetKcalWeek: goal.target_kcal_week,
      successDaysCount,
      daysWithData,
      isSuccess,
      xpAwarded,
      xpAmount: xpAwarded ? xpAmount : undefined
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
