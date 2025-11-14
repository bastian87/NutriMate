# Gamification Service

Centralized module for handling all gamification logic in NutriMate.

## Overview

The gamification service provides a single source of truth for:
- XP calculation and awarding
- Streak calculation and updates
- Level calculations
- Achievement checking

This ensures consistent gamification behavior across the entire application.

## Public API

### Core Functions

#### `awardXpForMealLog(supa, userId, mealId, date?)`
Awards XP when a meal is logged.

**Parameters:**
- `supa`: Supabase client
- `userId`: User ID
- `mealId`: ID of the meal entry (for related_id)
- `date`: Optional date (defaults to today)

**Returns:** `XpAwardResult`
- `totalXpAwarded`: Total XP awarded
- `reasons`: Array of reason strings
- `ledgerEntryId`: ID of the XP ledger entry

**XP Awards:**
- Base: 10 XP for logging a meal
- First log bonus: +20 XP
- Milestone bonuses: +30 XP (30 meals), +50 XP (100 meals)
- Streak bonuses: +15 XP (3 days), +25 XP (7 days), +50 XP (30 days)

**Used in:**
- `app/api/food-entries/route.ts` - POST handler (meal logging)

---

#### `updateStreakForMealLog(supa, userId, date?)`
Updates streak based on meal logging. Streaks are based on consecutive days with at least one meal logged.

**Parameters:**
- `supa`: Supabase client
- `userId`: User ID
- `date`: Optional date (defaults to today)

**Returns:** `StreakUpdateResult`
- `current`: Current streak count
- `best`: Best streak count
- `wasUpdated`: Whether the streak was successfully updated

**Logic:**
- If user logged meals yesterday: increment streak
- If user did not log meals yesterday: reset streak to 1
- Updates best streak if current exceeds it

**Used in:**
- `app/api/food-entries/route.ts` - POST handler (meal logging)

---

#### `awardXpForDayCompletion(supa, userId, dayEntryId, date, currentStreak)`
Awards XP when a day is marked as successful (meets goals).

**Parameters:**
- `supa`: Supabase client
- `userId`: User ID
- `dayEntryId`: ID of the day entry (for related_id)
- `date`: Date of the day
- `currentStreak`: Current streak count (for bonus checks)

**Returns:** `XpAwardResult`

**XP Awards:**
- Base: 20 XP for completing a day
- Streak bonuses: +15 XP (3 days), +25 XP (7 days), +50 XP (30 days)

**Used in:**
- `app/api/day-entries/route.ts` - POST handler (day completion)

---

#### `updateStreakForDayCompletion(supa, userId, date)`
Updates streak when a day is marked as successful.

**Parameters:**
- `supa`: Supabase client
- `userId`: User ID
- `date`: Date of the day

**Returns:** `StreakUpdateResult`

**Logic:**
- If yesterday was successful: increment streak
- If yesterday was not successful: reset streak to 1
- Updates best streak if current exceeds it

**Used in:**
- `app/api/day-entries/route.ts` - POST handler (day completion)

---

#### `getGamificationData(supa, userId)`
Fetches and calculates all gamification metrics for a user.

**Parameters:**
- `supa`: Supabase client
- `userId`: User ID

**Returns:** `GamificationData`
- `totalXp`: Total XP earned
- `level`: Current level
- `xpInCurrentLevel`: XP in current level
- `xpToNextLevel`: XP needed for next level
- `progressPercent`: Progress percentage to next level
- `currentStreak`: Current streak count
- `bestStreak`: Best streak count
- `todayXp`: XP earned today
- `weeklyXp`: XP earned this week
- `monthlyXp`: XP earned this month
- `totalMeals`: Total meals logged
- `hasLoggedToday`: Whether user logged today
- `achievements`: Array of achievement statuses

**Used in:**
- `app/api/gamification/route.ts` - GET handler (gamification data endpoint)
- `app/dashboard/page.tsx` - Home screen (via API)
- `app/gamification/page.tsx` - Achievements page (via API)
- `app/account/page.tsx` - Profile page (via API)

---

## Integration Points

### Meal Logging Flow
1. User logs a meal → `POST /api/food-entries`
2. Meal entry is created
3. `awardXpForMealLog()` is called → Awards XP and records in ledger
4. `updateStreakForMealLog()` is called → Updates streak based on consecutive days
5. Response includes `xpAwarded` and `streak`

### Day Completion Flow
1. User completes a day → `POST /api/day-entries`
2. Day entry is created and evaluated
3. If successful:
   - `updateStreakForDayCompletion()` is called → Updates streak
   - `awardXpForDayCompletion()` is called → Awards XP with streak bonuses
4. Response includes `streakCurrent`

### Data Retrieval Flow
1. Client requests gamification data → `GET /api/gamification`
2. `getGamificationData()` is called → Fetches and calculates all metrics
3. Response includes complete gamification state

---

## Supporting Modules

### `lib/gamification/xp-system.ts`
Contains:
- `XP_REWARDS`: Constants for XP amounts
- `XP_PER_LEVEL`: XP required per level (100)
- `DAILY_XP_GOAL`: Target XP per day (30)
- `calculateLevelProgress()`: Calculates level from total XP
- `ACHIEVEMENTS`: Achievement definitions and check functions

---

## Database Tables

### `xp_ledger`
Stores all XP transactions:
- `user_id`: User ID
- `date`: Date of XP award
- `reason`: Comma-separated reasons for XP
- `amount`: XP amount
- `related_id`: Related entity ID (meal or day entry)

### `streaks`
Stores user streak data:
- `user_id`: User ID (unique)
- `current`: Current streak count
- `best`: Best streak count
- `updated_at`: Last update timestamp

---

## Notes

- Streaks are based on consecutive days with at least one meal logged
- XP is awarded immediately when actions occur
- Level calculations are based on total XP (100 XP per level)
- Achievements are checked dynamically based on current state
- All gamification logic is centralized in this service for consistency

