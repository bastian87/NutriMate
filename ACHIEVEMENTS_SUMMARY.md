# Achievements System Summary

## Overview

The Achievements screen has been simplified to focus on core gamification elements:
- Current level, total XP, and streak (prominent display)
- A curated set of 4 basic achievements with clear status indicators

## Final Achievement List

The system displays 4 core achievements:

### 1. First Steps
- **ID**: `first_log`
- **Description**: "Log your first meal"
- **XP Reward**: 20 XP
- **Status Computation**: 
  - **Unlocked**: `totalMeals >= 1`
  - **Progress**: `(totalMeals > 0) ? 100 : 0`

### 2. 3-Day Streak
- **ID**: `streak_3`
- **Description**: "Maintain a 3-day logging streak"
- **XP Reward**: 15 XP
- **Status Computation**:
  - **Unlocked**: `currentStreak >= 3`
  - **Progress**: `(currentStreak / 3) * 100` (capped at 100%)

### 3. Week Warrior
- **ID**: `streak_7`
- **Description**: "Maintain a 7-day logging streak"
- **XP Reward**: 25 XP
- **Status Computation**:
  - **Unlocked**: `currentStreak >= 7`
  - **Progress**: `(currentStreak / 7) * 100` (capped at 100%)

### 4. Consistent Logger
- **ID**: `log_30`
- **Description**: "Log 30 meals total"
- **XP Reward**: 30 XP
- **Status Computation**:
  - **Unlocked**: `totalMeals >= 30`
  - **Progress**: `(totalMeals / 30) * 100` (capped at 100%)

## Status Indicators

Each achievement displays one of three statuses:

### 1. **Locked** (Gray)
- Achievement not yet started
- Shows lock icon
- No progress bar
- Border: Gray
- Background: Light gray

### 2. **In Progress** (Orange)
- Achievement started but not completed
- Shows lock icon
- Progress bar showing completion percentage
- Border: Orange
- Background: Light orange

### 3. **Unlocked** (Green)
- Achievement completed
- Shows checkmark icon
- Progress bar at 100% (if applicable)
- Border: Green
- Background: Light green
- Shows unlock date if available

## Data Source

All achievement data comes from the centralized gamification service:
- **API Endpoint**: `/api/gamification`
- **Service Function**: `getGamificationData()` in `lib/gamification/gamification-service.ts`
- **Achievement Definitions**: `lib/gamification/xp-system.ts` (ACHIEVEMENTS array)

## Achievement Status Computation

The status is computed in the gamification service using the `AchievementCheckData`:

```typescript
interface AchievementCheckData {
  totalMeals: number;        // Total meals logged
  currentStreak: number;     // Current consecutive days with meals
  bestStreak: number;        // Best streak ever achieved
  totalXp: number;           // Total XP earned
  hasLoggedToday: boolean;   // Whether user logged today
  isFirstLog: boolean;       // Whether user has logged at least one meal
}
```

Each achievement has a `check()` function that evaluates the data:
- `first_log`: `data.isFirstLog`
- `streak_3`: `data.currentStreak >= 3`
- `streak_7`: `data.currentStreak >= 7`
- `log_30`: `data.totalMeals >= 30`

## UI Components

### Prominent Stats (Top Section)
- **Level Card**: Orange gradient, shows current level and progress
- **Total XP Card**: Blue gradient, shows total XP and XP to next level
- **Streak Card**: Red gradient, shows current streak count

### Daily XP Goal
- Progress bar showing today's XP vs daily goal (30 XP)
- Badge showing current progress

### Achievements List
- Each achievement in its own card
- Visual status indicators (icon, color, badge)
- Progress bars for in-progress achievements
- XP reward badge
- Unlock date for completed achievements

## Removed Features

The following were removed to simplify the screen:
- Weekly and Monthly XP sections (not core to daily logging focus)
- Additional achievements (streak_30, log_100) - kept in system but not displayed
- Complex achievement categories
- Achievement filtering/sorting

## Integration Points

- **Home Screen** (`/dashboard`): Shows XP today and streak
- **Achievements Screen** (`/gamification`): Full achievement display
- **Profile Screen** (`/account`): Shows level and streak summary

All screens use the same centralized gamification service for consistency.

