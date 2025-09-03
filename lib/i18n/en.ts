/**
 * English internationalization constants
 * Centralized strings for toasts, labels, and user-facing messages
 */

// Plate Builder Messages
export const PLATE_BUILDER = {
  // Toast Messages
  TOASTS: {
    EMPTY_PLATE: {
      title: "Empty Plate",
      description: "Add at least one ingredient before saving."
    },
    DAY_COMPLETE: {
      title: "Day Complete! 🎉",
      description: "You hit all 4 groups and your calorie goal. +50 XP"
    },
    CALORIE_EXCESS: {
      title: "Calorie Excess",
      description: "You exceeded your calories for today."
    },
    EXTRAS_DETECTED: {
      title: "Extras Detected",
      description: "You added a treat in addition to a full plate. Today doesn't count."
    },
    MISSING_GROUPS: {
      title: "Missing Groups",
      description: "You need at least one ingredient from each group (carb, protein, fat, vegetables)."
    },
    SAVE_ERROR: {
      title: "Save Error",
      description: "Could not save the day. Please try again."
    }
  },
  
  // Labels and UI Text
  LABELS: {
    INGREDIENT_LIBRARY: "Ingredient Library",
    SEARCH_PLACEHOLDER: "Search ingredients...",
    PLATE_BUILDER: "Plate Builder",
    DAILY_GOAL: "Daily Goal",
    CARBOHYDRATES: "Carbohydrates",
    PROTEIN: "Protein",
    FAT: "Fat",
    VEGETABLES_FRUITS: "Vegetables & Fruits",
    EXTRAS_TREATS: "Extras (Treats)",
    SAVE_DAY: "Save Day",
    SAVING: "Saving...",
    INCLUDED: "Included",
    MISSING: "Missing"
  }
} as const;

// Calendar Messages
export const CALENDAR = {
  // Labels and UI Text
  LABELS: {
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    CALENDAR: "Calendar"
  }
} as const;

// Summary Messages
export const SUMMARY = {
  // Toast Messages
  TOASTS: {
    PERFECT_WEEK: {
      title: "Perfect Week! 🎉",
      description: "You've earned {amount} XP for completing all days successfully."
    },
    LEGENDARY_MONTH: {
      title: "Legendary Month! 👑",
      description: "You've earned {amount} XP for completing all weeks successfully."
    }
  },
  
  // Labels and UI Text
  LABELS: {
    WEEKLY_SUMMARY: "Weekly Summary",
    MONTHLY_SUMMARY: "Monthly Summary",
    PERFECT_WEEK: "Perfect Week!",
    INCOMPLETE_WEEK: "Incomplete Week",
    LEGENDARY_MONTH: "Legendary Month!",
    INCOMPLETE_MONTH: "Incomplete Month",
    CALORIES: "Calories",
    SUCCESSFUL_DAYS: "Successful Days",
    SUCCESSFUL_WEEKS: "Successful Weeks",
    SUCCESS_CRITERIA: "Success Criteria:",
    WEEKLY_BREAKDOWN: "Weekly Breakdown:",
    ALL_DAYS_SUCCESSFUL: "All days with data successful",
    CALORIES_WITHIN_WEEKLY_GOAL: "Calories within weekly goal",
    ALL_WEEKS_SUCCESSFUL: "All weeks successful",
    CALORIES_WITHIN_MONTHLY_GOAL: "Calories within monthly goal",
    WEEK_1: "Week 1",
    LOADING_SUMMARY: "Loading summary...",
    RETRY: "Retry"
  }
} as const;

// Gamification Messages
export const GAMIFICATION = {
  // Labels and UI Text
  LABELS: {
    CURRENT_STREAK: "Current Streak",
    BEST_STREAK: "Best Streak",
    DAYS: "days",
    TOTAL_XP: "XP",
    LEVEL: "Level",
    PROGRESS_TO_LEVEL: "Progress to level",
    RECENT_ACTIVITY: "Recent Activity",
    LOADING: "Loading...",
    RETRY: "Retry"
  },
  
  // Streak Messages
  STREAK: {
    START_STREAK: "Start your streak!",
    GOOD_START: "Good start!",
    KEEP_GOING: "Keep going!",
    EXCELLENT_STREAK: "Excellent streak!",
    LEGENDARY_STREAK: "Legendary streak!",
    MAINTAIN_STREAK: "Maintain the streak!",
    PROGRESS: "Progress",
    LEGENDARY: "Legendary!",
    TOWARDS_7_DAYS: "Towards 7 days",
    TOWARDS_4_DAYS: "Towards 4 days",
    TOWARDS_2_DAYS: "Towards 2 days"
  },
  
  // XP Activity Types
  XP_ACTIVITY: {
    SUCCESSFUL_DAY: {
      icon: "📅",
      label: "Successful Day",
      color: "text-green-600"
    },
    STREAK: {
      icon: "🔥",
      label: "Streak",
      color: "text-orange-600"
    },
    PERFECT_WEEK: {
      icon: "📊",
      label: "Perfect Week",
      color: "text-blue-600"
    },
    LEGENDARY_MONTH: {
      icon: "👑",
      label: "Legendary Month",
      color: "text-purple-600"
    },
    DEFAULT: {
      icon: "⭐",
      label: "Achievement",
      color: "text-gray-600"
    }
  },
  
  // Date Formatting
  DATE_FORMATS: {
    YESTERDAY: "Yesterday",
    DAYS_AGO: "days ago",
    DATE_FORMAT: "MMM dd"
  }
} as const;

// Common Messages
export const COMMON = {
  // Error Messages
  ERRORS: {
    UNKNOWN_ERROR: "Unknown error",
    FETCH_ERROR: "Failed to fetch data",
    NETWORK_ERROR: "Network error",
    VALIDATION_ERROR: "Validation error"
  },
  
  // Loading States
  LOADING: {
    LOADING: "Loading...",
    SAVING: "Saving...",
    PROCESSING: "Processing..."
  },
  
  // Actions
  ACTIONS: {
    RETRY: "Retry",
    SAVE: "Save",
    CANCEL: "Cancel",
    CLOSE: "Close",
    REFRESH: "Refresh"
  }
} as const;

// Helper function to format messages with placeholders
export function formatMessage(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
}
