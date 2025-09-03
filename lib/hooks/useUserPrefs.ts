/**
 * User preferences hook with in-memory mock
 */

import { useState, useEffect } from 'react';

/**
 * User preferences interface
 */
interface UserPrefs {
  hasSeenPlateCoachmark: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    dailyReminder: boolean;
    weeklySummary: boolean;
    streakMilestone: boolean;
  };
}

/**
 * Default user preferences
 */
const defaultPrefs: UserPrefs = {
  hasSeenPlateCoachmark: false,
  theme: 'system',
  language: 'es',
  notifications: {
    dailyReminder: true,
    weeklySummary: true,
    streakMilestone: true
  }
};

/**
 * In-memory storage for user preferences
 * TODO: Replace with actual persistence (localStorage, Supabase, etc.)
 */
let userPrefsCache: UserPrefs = { ...defaultPrefs };

/**
 * Hook for managing user preferences
 */
export function useUserPrefs() {
  const [prefs, setPrefs] = useState<UserPrefs>(userPrefsCache);
  const [loading, setLoading] = useState(false);

  /**
   * Load preferences from storage
   * TODO: Replace with actual API call
   */
  const loadPrefs = async () => {
    setLoading(true);
    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 100));
      setPrefs(userPrefsCache);
    } catch (error) {
      console.error('Error loading user preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save preferences to storage
   * TODO: Replace with actual API call
   */
  const savePrefs = async (newPrefs: Partial<UserPrefs>) => {
    setLoading(true);
    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const updatedPrefs = { ...userPrefsCache, ...newPrefs };
      userPrefsCache = updatedPrefs;
      setPrefs(updatedPrefs);
      
      return true;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update a specific preference
   */
  const updatePref = async <K extends keyof UserPrefs>(
    key: K,
    value: UserPrefs[K]
  ) => {
    return await savePrefs({ [key]: value });
  };

  /**
   * Mark plate coachmark as seen
   */
  const markPlateCoachmarkSeen = async () => {
    return await updatePref('hasSeenPlateCoachmark', true);
  };

  /**
   * Reset preferences to default
   */
  const resetPrefs = async () => {
    return await savePrefs(defaultPrefs);
  };

  // Load preferences on mount
  useEffect(() => {
    loadPrefs();
  }, []);

  return {
    prefs,
    loading,
    updatePref,
    markPlateCoachmarkSeen,
    resetPrefs,
    savePrefs
  };
}
