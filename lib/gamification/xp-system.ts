/**
 * XP and Level System
 * - 0-100 XP per level
 * - Level starts at 1
 */

export const XP_PER_LEVEL = 100;

/**
 * Calculate level from total XP
 */
export function calculateLevel(totalXp: number): number {
  if (totalXp <= 0) return 1;
  return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

/**
 * Calculate XP progress within current level
 */
export function calculateLevelProgress(totalXp: number): {
  currentLevel: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  progressPercent: number;
} {
  const currentLevel = calculateLevel(totalXp);
  const xpForPreviousLevels = (currentLevel - 1) * XP_PER_LEVEL;
  const xpInCurrentLevel = totalXp - xpForPreviousLevels;
  const xpToNextLevel = XP_PER_LEVEL - xpInCurrentLevel;
  const progressPercent = (xpInCurrentLevel / XP_PER_LEVEL) * 100;

  return {
    currentLevel,
    xpInCurrentLevel,
    xpToNextLevel,
    progressPercent: Math.max(0, Math.min(100, progressPercent))
  };
}

/**
 * XP Rewards for different actions
 */
export const XP_REWARDS = {
  LOG_MEAL: 10,           // Log a meal
  COMPLETE_DAY: 20,       // Complete a day (meet goals)
  STREAK_3_DAYS: 15,      // 3-day streak bonus
  STREAK_7_DAYS: 25,      // 7-day streak bonus
  STREAK_30_DAYS: 50,     // 30-day streak bonus
  FIRST_LOG: 20,          // First meal logged
  LOG_30_MEALS: 30,       // Log 30 meals total
  LOG_100_MEALS: 50,      // Log 100 meals total
} as const;

/**
 * Daily XP Goal
 */
export const DAILY_XP_GOAL = 30; // Target XP per day

/**
 * Achievement definitions
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  check: (data: AchievementCheckData) => boolean;
}

export interface AchievementCheckData {
  totalMeals: number;
  currentStreak: number;
  bestStreak: number;
  totalXp: number;
  hasLoggedToday: boolean;
  isFirstLog: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_log',
    name: 'First Steps',
    description: 'Log your first meal',
    xpReward: XP_REWARDS.FIRST_LOG,
    check: (data) => data.isFirstLog
  },
  {
    id: 'streak_3',
    name: '3-Day Streak',
    description: 'Maintain a 3-day logging streak',
    xpReward: XP_REWARDS.STREAK_3_DAYS,
    check: (data) => data.currentStreak >= 3
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day logging streak',
    xpReward: XP_REWARDS.STREAK_7_DAYS,
    check: (data) => data.currentStreak >= 7
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day logging streak',
    xpReward: XP_REWARDS.STREAK_30_DAYS,
    check: (data) => data.currentStreak >= 30
  },
  {
    id: 'log_30',
    name: 'Consistent Logger',
    description: 'Log 30 meals total',
    xpReward: XP_REWARDS.LOG_30_MEALS,
    check: (data) => data.totalMeals >= 30
  },
  {
    id: 'log_100',
    name: 'Century Club',
    description: 'Log 100 meals total',
    xpReward: XP_REWARDS.LOG_100_MEALS,
    check: (data) => data.totalMeals >= 100
  }
];

