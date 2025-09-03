/**
 * API endpoint for monthly summary computation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Placeholder auth helper - replace with actual auth implementation
function getCurrentUserId(): string {
  // TODO: Replace with actual auth implementation
  return 'user-placeholder-id';
}

/**
 * Schema for monthly summary query parameters
 */
const MonthlySummaryQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  goalId: z.string().uuid('Invalid goal ID format')
});

/**
 * Monthly summary response interface
 */
interface MonthlySummaryResponse {
  month: string;
  goalId: string;
  totalKcal: number;
  targetKcalMonth: number;
  successWeeksCount: number;
  totalWeeks: number;
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
 * Mock weekly summaries for the month
 */
const mockWeeklySummaries = [
  { week_start_date: '2024-01-01', total_kcal: 13500, success_days_count: 7, is_success: true },
  { week_start_date: '2024-01-08', total_kcal: 14200, success_days_count: 6, is_success: false },
  { week_start_date: '2024-01-15', total_kcal: 13800, success_days_count: 7, is_success: true },
  { week_start_date: '2024-01-22', total_kcal: 13900, success_days_count: 7, is_success: true },
  { week_start_date: '2024-01-29', total_kcal: 14100, success_days_count: 6, is_success: false }
];

/**
 * Mock XP ledger to check if monthly XP was already awarded
 */
const mockXpLedger = [
  { date: '2024-01-01', reason: 'week', amount: 200 },
  { date: '2024-01-15', reason: 'week', amount: 200 },
  { date: '2024-01-22', reason: 'week', amount: 200 }
  // No monthly XP awarded yet
];

/**
 * Helper function to get weeks in month
 */
function getWeeksInMonth(month: string): string[] {
  const [year, monthNum] = month.split('-').map(Number);
  const firstDay = new Date(year, monthNum - 1, 1);
  const lastDay = new Date(year, monthNum, 0);
  
  const weeks: string[] = [];
  let currentDate = new Date(firstDay);
  
  // Find the first Monday of the month
  while (currentDate.getDay() !== 1) {
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  // Generate all weeks that have at least one day in the month
  while (currentDate <= lastDay) {
    weeks.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return weeks;
}

/**
 * Helper function to check if monthly XP was already awarded
 */
function wasMonthlyXpAwarded(userId: string, month: string): boolean {
  // TODO: Replace with actual Supabase query
  // Check if there's an XP ledger entry for this month with reason 'month'
  return mockXpLedger.some(entry => 
    entry.reason === 'month' && 
    entry.date.startsWith(month)
  );
}

/**
 * Helper function to award monthly XP
 */
async function awardMonthlyXp(userId: string, month: string): Promise<boolean> {
  // TODO: Replace with actual Supabase insert
  // Insert XP ledger entry with reason 'month', amount 800
  console.log(`Awarding +800 XP for legendary month ${month} to user ${userId}`);
  return true;
}

/**
 * GET /api/summary/monthly - Get monthly summary
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryParams = {
      month: searchParams.get('month'),
      goalId: searchParams.get('goalId')
    };
    
    const validatedParams = MonthlySummaryQuerySchema.parse(queryParams);
    
    // Get current user ID (placeholder)
    const userId = getCurrentUserId();
    
    const { month, goalId } = validatedParams;
    
    // TODO: Replace with actual Supabase queries
    // 1. Fetch goal data
    const goal = mockGoal;
    
    // 2. Get all weeks in the month
    const weeksInMonth = getWeeksInMonth(month);
    
    // 3. Fetch weekly summaries for the month
    const weeklySummaries = mockWeeklySummaries.filter(summary => 
      weeksInMonth.includes(summary.week_start_date)
    );
    
    // 4. Calculate summary metrics
    const totalKcal = weeklySummaries.reduce((sum, summary) => sum + summary.total_kcal, 0);
    const successWeeksCount = weeklySummaries.filter(summary => summary.is_success).length;
    const totalWeeks = weeklySummaries.length;
    
    // 5. Determine if month is successful (all weeks successful)
    const isSuccess = successWeeksCount === totalWeeks && totalWeeks > 0;
    
    // 6. Check if monthly XP was already awarded
    const xpAlreadyAwarded = wasMonthlyXpAwarded(userId, month);
    
    // 7. Award XP if successful and not already awarded
    let xpAwarded = false;
    let xpAmount = 0;
    
    if (isSuccess && !xpAlreadyAwarded) {
      const awarded = await awardMonthlyXp(userId, month);
      if (awarded) {
        xpAwarded = true;
        xpAmount = 800;
      }
    }
    
    const response: MonthlySummaryResponse = {
      month,
      goalId,
      totalKcal,
      targetKcalMonth: goal.target_kcal_month,
      successWeeksCount,
      totalWeeks,
      isSuccess,
      xpAwarded,
      xpAmount: xpAwarded ? xpAmount : undefined
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    
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
