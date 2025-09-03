/**
 * API endpoint for calendar data
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Placeholder auth helper - replace with actual auth implementation
function getCurrentUserId(): string {
  // TODO: Replace with actual auth implementation
  return 'user-placeholder-id';
}

/**
 * Schema for calendar query parameters
 */
const CalendarQuerySchema = z.object({
  range: z.enum(['week', 'month']),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
});

/**
 * Calendar day entry type
 */
interface CalendarDayEntry {
  date: string;
  total_kcal: number;
  target_kcal: number;
  is_success: boolean | null; // null means no entry
  has_entry: boolean;
}

/**
 * Helper function to generate date range
 */
function generateDateRange(range: 'week' | 'month', fromDate: string): string[] {
  const dates: string[] = [];
  const startDate = new Date(fromDate);
  
  if (range === 'week') {
    // Generate 7 days starting from the given date
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
  } else {
    // Generate 30 days starting from the given date
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
  }
  
  return dates;
}

/**
 * Helper function to fetch day entries for date range
 * TODO: Replace with actual Supabase implementation
 */
async function fetchDayEntriesForRange(userId: string, dates: string[]): Promise<CalendarDayEntry[]> {
  // Mock implementation - replace with actual Supabase query
  const mockEntries: CalendarDayEntry[] = dates.map((date, index) => {
    // Simulate some days with entries, some without
    const hasEntry = index % 3 !== 0; // Every 3rd day has no entry
    const totalKcal = hasEntry ? Math.floor(Math.random() * 2000) + 500 : 0;
    const targetKcal = 2000; // Mock target
    const isSuccess = hasEntry ? totalKcal <= targetKcal && Math.random() > 0.3 : null;
    
    return {
      date,
      total_kcal: totalKcal,
      target_kcal: targetKcal,
      is_success: isSuccess,
      has_entry: hasEntry
    };
  });
  
  return mockEntries;
}

/**
 * GET /api/calendar - Get calendar data for a date range
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryParams = {
      range: searchParams.get('range'),
      from: searchParams.get('from')
    };
    
    const validatedParams = CalendarQuerySchema.parse(queryParams);
    
    // Get current user ID (placeholder)
    const userId = getCurrentUserId();
    
    // Generate date range
    const dates = generateDateRange(validatedParams.range, validatedParams.from);
    
    // Fetch day entries for the date range
    const dayEntries = await fetchDayEntriesForRange(userId, dates);
    
    return NextResponse.json({
      range: validatedParams.range,
      from: validatedParams.from,
      days: dayEntries
    });
    
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    
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
