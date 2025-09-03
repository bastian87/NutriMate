/**
 * API endpoint for gamification data (streak and XP)
 */

import { NextRequest, NextResponse } from 'next/server';

// Placeholder auth helper - replace with actual auth implementation
function getCurrentUserId(): string {
  // TODO: Replace with actual auth implementation
  return 'user-placeholder-id';
}

/**
 * Gamification response interface
 */
interface GamificationResponse {
  streak: {
    current: number;
    best: number;
  };
  totalXp: number;
  lastReasons: Array<{
    reason: string;
    amount: number;
    date: string;
  }>;
}

/**
 * Mock streak data
 */
const mockStreak = {
  user_id: 'user-placeholder-id',
  current: 5,
  best: 12,
  updated_at: new Date().toISOString()
};

/**
 * Mock XP ledger data
 */
const mockXpLedger = [
  { date: '2024-01-15', reason: 'day', amount: 50 },
  { date: '2024-01-14', reason: 'day', amount: 50 },
  { date: '2024-01-13', reason: 'day', amount: 50 },
  { date: '2024-01-12', reason: 'day', amount: 50 },
  { date: '2024-01-11', reason: 'day', amount: 50 },
  { date: '2024-01-10', reason: 'streak', amount: 25 },
  { date: '2024-01-08', reason: 'week', amount: 200 },
  { date: '2024-01-01', reason: 'month', amount: 800 }
];

/**
 * Helper function to calculate total XP
 */
function calculateTotalXp(xpLedger: typeof mockXpLedger): number {
  return xpLedger.reduce((total, entry) => total + entry.amount, 0);
}

/**
 * Helper function to get last reasons (last 5 entries)
 */
function getLastReasons(xpLedger: typeof mockXpLedger) {
  return xpLedger
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(entry => ({
      reason: entry.reason,
      amount: entry.amount,
      date: entry.date
    }));
}

/**
 * GET /api/gamification - Get gamification data
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user ID (placeholder)
    const userId = getCurrentUserId();
    
    // TODO: Replace with actual Supabase queries
    // 1. Fetch user streak data
    const streak = mockStreak;
    
    // 2. Fetch user XP ledger
    const xpLedger = mockXpLedger;
    
    // 3. Calculate metrics
    const totalXp = calculateTotalXp(xpLedger);
    const lastReasons = getLastReasons(xpLedger);
    
    const response: GamificationResponse = {
      streak: {
        current: streak.current,
        best: streak.best
      },
      totalXp,
      lastReasons
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching gamification data:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
