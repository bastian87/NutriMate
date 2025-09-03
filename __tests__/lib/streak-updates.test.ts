/**
 * Unit tests for streak update logic with mock DB helpers
 */

// Mock database helpers
interface MockStreak {
  user_id: string;
  current: number;
  best: number;
  updated_at: string;
}

interface MockDayEntry {
  id: string;
  user_id: string;
  date: string;
  total_kcal: number;
  is_success: boolean;
  created_at: string;
}

class MockDatabase {
  private streaks: Map<string, MockStreak> = new Map();
  private dayEntries: Map<string, MockDayEntry[]> = new Map();

  // Streak operations
  async getStreak(userId: string): Promise<MockStreak | null> {
    return this.streaks.get(userId) || null;
  }

  async upsertStreak(userId: string, current: number, best: number): Promise<void> {
    this.streaks.set(userId, {
      user_id: userId,
      current,
      best,
      updated_at: new Date().toISOString()
    });
  }

  // Day entry operations
  async getDayEntry(userId: string, date: string): Promise<MockDayEntry | null> {
    const entries = this.dayEntries.get(userId) || [];
    return entries.find(entry => entry.date === date) || null;
  }

  async getYesterdayEntry(userId: string, date: string): Promise<MockDayEntry | null> {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    return this.getDayEntry(userId, yesterdayStr);
  }

  async addDayEntry(entry: MockDayEntry): Promise<void> {
    const entries = this.dayEntries.get(entry.user_id) || [];
    entries.push(entry);
    this.dayEntries.set(entry.user_id, entries);
  }

  // Test helpers
  clear(): void {
    this.streaks.clear();
    this.dayEntries.clear();
  }

  getStreakData(userId: string): MockStreak | null {
    return this.streaks.get(userId) || null;
  }
}

// Streak update logic (extracted from day-entries endpoint)
class StreakManager {
  constructor(private db: MockDatabase) {}

  async updateStreak(userId: string, date: string, isSuccess: boolean): Promise<{ current: number; best: number }> {
    // Get current streak
    const currentStreak = await this.db.getStreak(userId);
    const current = currentStreak?.current || 0;
    const best = currentStreak?.best || 0;

    // Get yesterday's entry
    const yesterdayEntry = await this.db.getYesterdayEntry(userId, date);

    let newCurrent: number;
    let newBest: number;

    if (isSuccess) {
      // If today is successful and yesterday was successful, increment streak
      if (yesterdayEntry?.is_success) {
        newCurrent = current + 1;
      } else {
        // Start new streak
        newCurrent = 1;
      }
      newBest = Math.max(best, newCurrent);
    } else {
      // Reset streak on failure
      newCurrent = 0;
      newBest = best; // Keep the best streak
    }

    // Update streak in database
    await this.db.upsertStreak(userId, newCurrent, newBest);

    return { current: newCurrent, best: newBest };
  }
}

describe('Streak Updates', () => {
  let db: MockDatabase;
  let streakManager: StreakManager;
  const userId = 'test-user-123';
  const today = '2024-01-15';
  const yesterday = '2024-01-14';

  beforeEach(() => {
    db = new MockDatabase();
    streakManager = new StreakManager(db);
  });

  afterEach(() => {
    db.clear();
  });

  describe('successful day updates', () => {
    it('should start streak at 1 for first successful day', async () => {
      const result = await streakManager.updateStreak(userId, today, true);

      expect(result.current).toBe(1);
      expect(result.best).toBe(1);

      const streakData = db.getStreakData(userId);
      expect(streakData?.current).toBe(1);
      expect(streakData?.best).toBe(1);
    });

    it('should increment streak when yesterday was also successful', async () => {
      // Set up yesterday as successful
      await db.addDayEntry({
        id: 'entry-1',
        user_id: userId,
        date: yesterday,
        total_kcal: 1800,
        is_success: true,
        created_at: new Date().toISOString()
      });

      // Set up existing streak
      await db.upsertStreak(userId, 3, 5);

      const result = await streakManager.updateStreak(userId, today, true);

      expect(result.current).toBe(4);
      expect(result.best).toBe(5); // Should not change if current < best

      const streakData = db.getStreakData(userId);
      expect(streakData?.current).toBe(4);
      expect(streakData?.best).toBe(5);
    });

    it('should update best streak when current exceeds it', async () => {
      // Set up yesterday as successful
      await db.addDayEntry({
        id: 'entry-1',
        user_id: userId,
        date: yesterday,
        total_kcal: 1800,
        is_success: true,
        created_at: new Date().toISOString()
      });

      // Set up existing streak where current will exceed best
      await db.upsertStreak(userId, 4, 4);

      const result = await streakManager.updateStreak(userId, today, true);

      expect(result.current).toBe(5);
      expect(result.best).toBe(5); // Should update to new current

      const streakData = db.getStreakData(userId);
      expect(streakData?.current).toBe(5);
      expect(streakData?.best).toBe(5);
    });

    it('should start new streak when yesterday was not successful', async () => {
      // Set up yesterday as unsuccessful
      await db.addDayEntry({
        id: 'entry-1',
        user_id: userId,
        date: yesterday,
        total_kcal: 2500,
        is_success: false,
        created_at: new Date().toISOString()
      });

      // Set up existing streak
      await db.upsertStreak(userId, 3, 7);

      const result = await streakManager.updateStreak(userId, today, true);

      expect(result.current).toBe(1); // Start new streak
      expect(result.best).toBe(7); // Keep best streak

      const streakData = db.getStreakData(userId);
      expect(streakData?.current).toBe(1);
      expect(streakData?.best).toBe(7);
    });

    it('should start new streak when yesterday has no entry', async () => {
      // No yesterday entry
      await db.upsertStreak(userId, 5, 8);

      const result = await streakManager.updateStreak(userId, today, true);

      expect(result.current).toBe(1); // Start new streak
      expect(result.best).toBe(8); // Keep best streak

      const streakData = db.getStreakData(userId);
      expect(streakData?.current).toBe(1);
      expect(streakData?.best).toBe(8);
    });
  });

  describe('unsuccessful day updates', () => {
    it('should reset streak to 0 on failure', async () => {
      // Set up existing streak
      await db.upsertStreak(userId, 5, 8);

      const result = await streakManager.updateStreak(userId, today, false);

      expect(result.current).toBe(0);
      expect(result.best).toBe(8); // Keep best streak

      const streakData = db.getStreakData(userId);
      expect(streakData?.current).toBe(0);
      expect(streakData?.best).toBe(8);
    });

    it('should reset streak to 0 even when yesterday was successful', async () => {
      // Set up yesterday as successful
      await db.addDayEntry({
        id: 'entry-1',
        user_id: userId,
        date: yesterday,
        total_kcal: 1800,
        is_success: true,
        created_at: new Date().toISOString()
      });

      // Set up existing streak
      await db.upsertStreak(userId, 3, 5);

      const result = await streakManager.updateStreak(userId, today, false);

      expect(result.current).toBe(0);
      expect(result.best).toBe(5); // Keep best streak

      const streakData = db.getStreakData(userId);
      expect(streakData?.current).toBe(0);
      expect(streakData?.best).toBe(5);
    });

    it('should handle failure when no existing streak', async () => {
      const result = await streakManager.updateStreak(userId, today, false);

      expect(result.current).toBe(0);
      expect(result.best).toBe(0);

      const streakData = db.getStreakData(userId);
      expect(streakData?.current).toBe(0);
      expect(streakData?.best).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple consecutive successful days', async () => {
      const dates = [
        '2024-01-10',
        '2024-01-11',
        '2024-01-12',
        '2024-01-13',
        '2024-01-14',
        '2024-01-15'
      ];

      let currentStreak = 0;
      let bestStreak = 0;

      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        
        // Add previous day as successful (except for first day)
        if (i > 0) {
          await db.addDayEntry({
            id: `entry-${i}`,
            user_id: userId,
            date: dates[i - 1],
            total_kcal: 1800,
            is_success: true,
            created_at: new Date().toISOString()
          });
        }

        const result = await streakManager.updateStreak(userId, date, true);
        currentStreak = result.current;
        bestStreak = result.best;

        expect(currentStreak).toBe(i + 1);
        expect(bestStreak).toBe(i + 1);
      }

      const finalStreakData = db.getStreakData(userId);
      expect(finalStreakData?.current).toBe(6);
      expect(finalStreakData?.best).toBe(6);
    });

    it('should handle streak interruption and restart', async () => {
      // Day 1: Success
      await streakManager.updateStreak(userId, '2024-01-10', true);
      expect(db.getStreakData(userId)?.current).toBe(1);

      // Day 2: Success (with previous day)
      await db.addDayEntry({
        id: 'entry-1',
        user_id: userId,
        date: '2024-01-10',
        total_kcal: 1800,
        is_success: true,
        created_at: new Date().toISOString()
      });
      await streakManager.updateStreak(userId, '2024-01-11', true);
      expect(db.getStreakData(userId)?.current).toBe(2);

      // Day 3: Failure
      await db.addDayEntry({
        id: 'entry-2',
        user_id: userId,
        date: '2024-01-11',
        total_kcal: 1800,
        is_success: true,
        created_at: new Date().toISOString()
      });
      await streakManager.updateStreak(userId, '2024-01-12', false);
      expect(db.getStreakData(userId)?.current).toBe(0);
      expect(db.getStreakData(userId)?.best).toBe(2);

      // Day 4: Success (restart streak)
      await db.addDayEntry({
        id: 'entry-3',
        user_id: userId,
        date: '2024-01-12',
        total_kcal: 2500,
        is_success: false,
        created_at: new Date().toISOString()
      });
      await streakManager.updateStreak(userId, '2024-01-13', true);
      expect(db.getStreakData(userId)?.current).toBe(1);
      expect(db.getStreakData(userId)?.best).toBe(2); // Should keep previous best
    });

    it('should handle very long streaks', async () => {
      const longStreak = 100;
      
      // Set up existing long streak
      await db.upsertStreak(userId, longStreak, longStreak);

      // Add yesterday as successful
      await db.addDayEntry({
        id: 'entry-1',
        user_id: userId,
        date: yesterday,
        total_kcal: 1800,
        is_success: true,
        created_at: new Date().toISOString()
      });

      const result = await streakManager.updateStreak(userId, today, true);

      expect(result.current).toBe(101);
      expect(result.best).toBe(101);

      const streakData = db.getStreakData(userId);
      expect(streakData?.current).toBe(101);
      expect(streakData?.best).toBe(101);
    });

    it('should handle date boundary conditions', async () => {
      // Test with month boundary
      const lastDayOfMonth = '2024-01-31';
      const firstDayOfNextMonth = '2024-02-01';

      // Set up last day of month as successful
      await db.addDayEntry({
        id: 'entry-1',
        user_id: userId,
        date: lastDayOfMonth,
        total_kcal: 1800,
        is_success: true,
        created_at: new Date().toISOString()
      });

      await db.upsertStreak(userId, 5, 8);

      const result = await streakManager.updateStreak(userId, firstDayOfNextMonth, true);

      expect(result.current).toBe(6);
      expect(result.best).toBe(8);

      const streakData = db.getStreakData(userId);
      expect(streakData?.current).toBe(6);
      expect(streakData?.best).toBe(8);
    });

    it('should handle concurrent streak updates', async () => {
      // Simulate concurrent updates (though in real scenario this would be handled by DB transactions)
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        const date = `2024-01-${10 + i}`;
        if (i > 0) {
          await db.addDayEntry({
            id: `entry-${i}`,
            user_id: userId,
            date: `2024-01-${9 + i}`,
            total_kcal: 1800,
            is_success: true,
            created_at: new Date().toISOString()
          });
        }
        promises.push(streakManager.updateStreak(userId, date, true));
      }

      const results = await Promise.all(promises);

      // Each should increment the streak
      results.forEach((result, index) => {
        expect(result.current).toBe(index + 1);
        expect(result.best).toBe(index + 1);
      });

      const finalStreakData = db.getStreakData(userId);
      expect(finalStreakData?.current).toBe(5);
      expect(finalStreakData?.best).toBe(5);
    });
  });
});
