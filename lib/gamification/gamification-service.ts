/**
 * Gamification Service
 * 
 * Centralized module for handling all gamification logic:
 * - XP calculation and awarding
 * - Streak calculation and updates
 * - Level calculations
 * - Achievement checking
 * 
 * This service ensures consistent gamification behavior across:
 * - Meal logging (food-entries API)
 * - Day completion (day-entries API)
 * - Home screen (dashboard)
 * - Achievements page
 * - Profile page
 */

import { XP_REWARDS, calculateLevelProgress, ACHIEVEMENTS, type AchievementCheckData } from './xp-system';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface XpAwardResult {
  totalXpAwarded: number;
  reasons: string[];
  ledgerEntryId?: string;
}

export interface StreakUpdateResult {
  current: number;
  best: number;
  wasUpdated: boolean;
}

export interface GamificationData {
  totalXp: number;
  level: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  progressPercent: number;
  currentStreak: number;
  bestStreak: number;
  todayXp: number;
  weeklyXp: number;
  monthlyXp: number;
  totalMeals: number;
  hasLoggedToday: boolean;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    xpReward: number;
    unlocked: boolean;
    unlockedAt?: string;
  }>;
}

/**
 * Award XP for logging a meal
 * 
 * This function:
 * - Awards base XP for logging a meal
 * - Checks for first log bonus
 * - Checks for meal count milestones (30, 100)
 * - Checks for streak bonuses
 * - Records XP in the ledger
 * 
 * @param supa - Supabase client
 * @param userId - User ID
 * @param mealId - ID of the meal entry (for related_id)
 * @param date - Date of the meal (defaults to today)
 * @returns XP award result with total XP and reasons
 */
export async function awardXpForMealLog(
  supa: SupabaseClient<any>,
  userId: string,
  mealId: string,
  date?: string
): Promise<XpAwardResult> {
  const today = date || new Date().toISOString().split('T')[0];
  let totalXpAwarded = XP_REWARDS.LOG_MEAL;
  const reasons: string[] = ['meal_logged'];

  // Check meal count BEFORE this insert (to check if this is first log)
  const { count: totalMealsBefore } = await supa
    .from('food_diary_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  const mealCount = totalMealsBefore ?? 0;
  const isFirstLog = mealCount === 0;

  // First log bonus
  if (isFirstLog) {
    totalXpAwarded += XP_REWARDS.FIRST_LOG;
    reasons.push('first_log');
  }

  // Check for milestone achievements (after this insert, so +1)
  const totalMealsAfter = mealCount + 1;
  if (totalMealsAfter === 30) {
    totalXpAwarded += XP_REWARDS.LOG_30_MEALS;
    reasons.push('milestone_30_meals');
  } else if (totalMealsAfter === 100) {
    totalXpAwarded += XP_REWARDS.LOG_100_MEALS;
    reasons.push('milestone_100_meals');
  }

  // Check streak bonuses (get current streak)
  const { data: streakData } = await supa
    .from('streaks')
    .select('current')
    .eq('user_id', userId)
    .maybeSingle();

  const currentStreak = streakData?.current ?? 0;
  if (currentStreak === 3) {
    totalXpAwarded += XP_REWARDS.STREAK_3_DAYS;
    reasons.push('streak_3_days');
  } else if (currentStreak === 7) {
    totalXpAwarded += XP_REWARDS.STREAK_7_DAYS;
    reasons.push('streak_7_days');
  } else if (currentStreak === 30) {
    totalXpAwarded += XP_REWARDS.STREAK_30_DAYS;
    reasons.push('streak_30_days');
  }

  // Insert XP ledger entry
  let ledgerEntryId: string | undefined;
  if (totalXpAwarded > 0) {
    const { data: ledgerEntry, error } = await supa
      .from('xp_ledger')
      .insert({
        user_id: userId,
        date: today,
        reason: reasons.join(','),
        amount: totalXpAwarded,
        related_id: mealId
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting XP ledger entry:', error);
    } else {
      ledgerEntryId = ledgerEntry?.id;
    }
  }

  return {
    totalXpAwarded,
    reasons,
    ledgerEntryId
  };
}

/**
 * Update streak based on meal logging
 * 
 * Streaks are based on consecutive days with at least one meal logged.
 * This function:
 * - Checks if user logged a meal today
 * - Checks if user logged a meal yesterday
 * - Updates streak accordingly (increment if yesterday had meals, reset to 1 if not)
 * 
 * @param supa - Supabase client
 * @param userId - User ID
 * @param date - Date to check (defaults to today)
 * @returns Streak update result
 */
export async function updateStreakForMealLog(
  supa: SupabaseClient<any>,
  userId: string,
  date?: string
): Promise<StreakUpdateResult> {
  const today = date || new Date().toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Check if user logged meals yesterday
  const { count: yesterdayMealsCount } = await supa
    .from('food_diary_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('date', yesterdayStr);

  const hadMealsYesterday = (yesterdayMealsCount ?? 0) > 0;

  // Get current streak
  const { data: streakData, error: streakError } = await supa
    .from('streaks')
    .select('id,current,best')
    .eq('user_id', userId)
    .maybeSingle();

  if (streakError && streakError.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching streak:', streakError);
    return { current: 0, best: 0, wasUpdated: false };
  }

  const currentStreak = streakData?.current ?? 0;
  const bestStreak = streakData?.best ?? 0;

  // Calculate new streak
  const newCurrent = hadMealsYesterday ? currentStreak + 1 : 1;
  const newBest = Math.max(bestStreak, newCurrent);

  // Update or insert streak
  if (streakData?.id) {
    const { error: updateError } = await supa
      .from('streaks')
      .update({ 
        current: newCurrent, 
        best: newBest,
        updated_at: new Date().toISOString()
      })
      .eq('id', streakData.id);

    if (updateError) {
      console.error('Error updating streak:', updateError);
      return { current: currentStreak, best: bestStreak, wasUpdated: false };
    }
  } else {
    const { error: insertError } = await supa
      .from('streaks')
      .insert({ 
        user_id: userId, 
        current: newCurrent, 
        best: newBest 
      });

    if (insertError) {
      console.error('Error inserting streak:', insertError);
      return { current: 0, best: 0, wasUpdated: false };
    }
  }

  return {
    current: newCurrent,
    best: newBest,
    wasUpdated: true
  };
}

/**
 * Award XP for completing a day
 * 
 * This function awards XP when a day is marked as successful (meets goals).
 * It also checks for streak bonuses.
 * 
 * @param supa - Supabase client
 * @param userId - User ID
 * @param dayEntryId - ID of the day entry (for related_id)
 * @param date - Date of the day
 * @param currentStreak - Current streak count (for bonus checks)
 * @returns XP award result
 */
export async function awardXpForDayCompletion(
  supa: SupabaseClient<any>,
  userId: string,
  dayEntryId: string,
  date: string,
  currentStreak: number
): Promise<XpAwardResult> {
  let totalXpAwarded = XP_REWARDS.COMPLETE_DAY;
  const reasons: string[] = ['day_completed'];

  // Award streak bonuses if applicable
  if (currentStreak === 3) {
    totalXpAwarded += XP_REWARDS.STREAK_3_DAYS;
    reasons.push('streak_3_days');
  } else if (currentStreak === 7) {
    totalXpAwarded += XP_REWARDS.STREAK_7_DAYS;
    reasons.push('streak_7_days');
  } else if (currentStreak === 30) {
    totalXpAwarded += XP_REWARDS.STREAK_30_DAYS;
    reasons.push('streak_30_days');
  }

  // Insert XP ledger entry
  let ledgerEntryId: string | undefined;
  if (totalXpAwarded > 0) {
    const { data: ledgerEntry, error } = await supa
      .from('xp_ledger')
      .insert({
        user_id: userId,
        date,
        reason: reasons.join(','),
        amount: totalXpAwarded,
        related_id: dayEntryId
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting XP ledger entry:', error);
    } else {
      ledgerEntryId = ledgerEntry?.id;
    }
  }

  return {
    totalXpAwarded,
    reasons,
    ledgerEntryId
  };
}

/**
 * Update streak for day completion
 * 
 * This function updates the streak when a day is marked as successful.
 * It checks if yesterday was also successful to determine if streak continues.
 * 
 * @param supa - Supabase client
 * @param userId - User ID
 * @param date - Date of the day
 * @returns Streak update result
 */
export async function updateStreakForDayCompletion(
  supa: SupabaseClient<any>,
  userId: string,
  date: string
): Promise<StreakUpdateResult> {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Check if yesterday was successful
  const { data: yesterdayEntry } = await supa
    .from('day_entries')
    .select('is_success')
    .eq('user_id', userId)
    .eq('date', yesterdayStr)
    .maybeSingle();

  const yesterdayWasSuccessful = yesterdayEntry?.is_success ?? false;

  // Get current streak
  const { data: streakData, error: streakError } = await supa
    .from('streaks')
    .select('id,current,best')
    .eq('user_id', userId)
    .maybeSingle();

  if (streakError && streakError.code !== 'PGRST116') {
    console.error('Error fetching streak:', streakError);
    return { current: 0, best: 0, wasUpdated: false };
  }

  const currentStreak = streakData?.current ?? 0;
  const bestStreak = streakData?.best ?? 0;

  // Calculate new streak
  const newCurrent = yesterdayWasSuccessful ? currentStreak + 1 : 1;
  const newBest = Math.max(bestStreak, newCurrent);

  // Update or insert streak
  if (streakData?.id) {
    const { error: updateError } = await supa
      .from('streaks')
      .update({ 
        current: newCurrent, 
        best: newBest,
        updated_at: new Date().toISOString()
      })
      .eq('id', streakData.id);

    if (updateError) {
      console.error('Error updating streak:', updateError);
      return { current: currentStreak, best: bestStreak, wasUpdated: false };
    }
  } else {
    const { error: insertError } = await supa
      .from('streaks')
      .insert({ 
        user_id: userId, 
        current: newCurrent, 
        best: newBest 
      });

    if (insertError) {
      console.error('Error inserting streak:', insertError);
      return { current: 0, best: 0, wasUpdated: false };
    }
  }

  return {
    current: newCurrent,
    best: newBest,
    wasUpdated: true
  };
}

/**
 * Get comprehensive gamification data for a user
 * 
 * This function fetches and calculates all gamification metrics:
 * - Total XP and level progress
 * - Current and best streaks
 * - Today, weekly, and monthly XP
 * - Total meals logged
 * - Achievement status
 * 
 * @param supa - Supabase client
 * @param userId - User ID
 * @returns Complete gamification data
 */
export async function getGamificationData(
  supa: SupabaseClient<any>,
  userId: string
): Promise<GamificationData> {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Fetch all data in parallel
  const [
    { data: streakData, error: sErr },
    { data: xpRows, error: xErr },
    { count: mealCount, error: mErr },
    { data: todayMeals }
  ] = await Promise.all([
    supa.from('streaks').select('current,best').eq('user_id', userId).maybeSingle(),
    supa.from('xp_ledger').select('amount,reason,date').eq('user_id', userId).order('created_at', { ascending: false }),
    supa.from('food_diary_entries').select('id', { count: 'exact', head: false }).eq('user_id', userId),
    supa.from('food_diary_entries').select('id').eq('user_id', userId).eq('date', today).limit(1)
  ]);

  if (sErr) throw sErr;
  if (xErr) throw xErr;
  if (mErr) throw mErr;

  // Calculate XP totals
  const totalXp = (xpRows ?? []).reduce((a, r) => a + (r.amount ?? 0), 0);
  const levelProgress = calculateLevelProgress(totalXp);

  // Calculate time-based XP
  const weeklyXp = (xpRows ?? [])
    .filter(r => new Date(r.date) >= weekAgo)
    .reduce((a, r) => a + (r.amount ?? 0), 0);

  const monthlyXp = (xpRows ?? [])
    .filter(r => new Date(r.date) >= monthAgo)
    .reduce((a, r) => a + (r.amount ?? 0), 0);

  const todayXp = (xpRows ?? [])
    .filter(r => r.date === today)
    .reduce((a, r) => a + (r.amount ?? 0), 0);

  // Calculate user stats
  const totalMeals = mealCount ?? 0;
  const hasLoggedToday = (todayMeals?.length ?? 0) > 0;
  const isFirstLog = totalMeals >= 1;
  const currentStreak = streakData?.current ?? 0;
  const bestStreak = streakData?.best ?? 0;

  // Check achievements
  const achievementCheckData: AchievementCheckData = {
    totalMeals,
    currentStreak,
    bestStreak,
    totalXp,
    hasLoggedToday,
    isFirstLog
  };

  const achievements = ACHIEVEMENTS.map(achievement => ({
    id: achievement.id,
    name: achievement.name,
    description: achievement.description,
    xpReward: achievement.xpReward,
    unlocked: achievement.check(achievementCheckData),
    unlockedAt: achievement.check(achievementCheckData) ? new Date().toISOString() : undefined
  }));

  return {
    totalXp,
    level: levelProgress.currentLevel,
    xpInCurrentLevel: levelProgress.xpInCurrentLevel,
    xpToNextLevel: levelProgress.xpToNextLevel,
    progressPercent: levelProgress.progressPercent,
    currentStreak,
    bestStreak,
    todayXp,
    weeklyXp,
    monthlyXp,
    totalMeals,
    hasLoggedToday,
    achievements
  };
}

