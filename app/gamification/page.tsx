"use client";

/**
 * Achievements Screen - Simplified Gamification View
 * 
 * This screen displays:
 * - Current level, total XP, and streak (prominent display)
 * - A curated set of basic achievements with clear statuses
 * 
 * Achievements shown:
 * 1. First Steps - Log your first meal
 * 2. 3-Day Streak - Maintain a 3-day logging streak
 * 3. Week Warrior - Maintain a 7-day logging streak
 * 4. Consistent Logger - Log 30 meals total
 */

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { useLanguage } from "@/lib/i18n/context";
import { Flame, Zap, Trophy, Lock, CheckCircle } from "lucide-react";

interface GamificationData {
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  progressPercent: number;
  todayXp: number;
  dailyXpGoal: number;
  totalMeals: number;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    xpReward: number;
    unlocked: boolean;
    unlockedAt?: string;
  }>;
}

// Curated list of core achievements to display
const CORE_ACHIEVEMENT_IDS = [
  'first_log',
  'streak_3',
  'streak_7',
  'log_30'
];

export default function GamificationPage() {
  const { user } = useAuthContext();
  const { t } = useLanguage();
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch gamification data
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
    try {
        const response = await fetch('/api/gamification');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

    fetchData();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Access Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to view your achievements
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Could not load gamification data
          </p>
        </div>
      </div>
    );
  }

  // Filter to show only core achievements
  const coreAchievements = data.achievements.filter(a => 
    CORE_ACHIEVEMENT_IDS.includes(a.id)
  );

  // Calculate progress for achievements
  const getAchievementProgress = (achievementId: string) => {
    switch (achievementId) {
      case 'first_log':
        return data.totalMeals > 0 ? 100 : 0;
      case 'streak_3':
        return Math.min((data.currentStreak / 3) * 100, 100);
      case 'streak_7':
        return Math.min((data.currentStreak / 7) * 100, 100);
      case 'log_30':
        return Math.min((data.totalMeals / 30) * 100, 100);
      default:
        return 0;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Achievements</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your progress and unlock achievements
        </p>
      </div>

      {/* Level, XP, and Streak - Prominent Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Level */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6" />
              <span className="text-sm font-medium text-orange-100">Level</span>
        </div>
            <div className="text-4xl font-bold mb-2">{data.level}</div>
            <div className="text-sm text-orange-100">
              {data.xpInCurrentLevel} / {data.xpInCurrentLevel + data.xpToNextLevel} XP
                  </div>
            <Progress 
              value={data.progressPercent} 
              className="h-2 mt-3 bg-orange-400/30"
            />
          </CardContent>
        </Card>

        {/* Total XP */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-6 h-6" />
              <span className="text-sm font-medium text-blue-100">Total XP</span>
                  </div>
            <div className="text-4xl font-bold">{data.totalXp.toLocaleString()}</div>
            <div className="text-sm text-blue-100 mt-2">
              {data.xpToNextLevel} XP to next level
              </div>
            </CardContent>
          </Card>

        {/* Streak */}
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-6 h-6" />
              <span className="text-sm font-medium text-red-100">Streak</span>
                  </div>
            <div className="text-4xl font-bold">{data.currentStreak}</div>
            <div className="text-sm text-red-100 mt-2">
              {data.currentStreak > 0 ? 'days in a row' : 'Start logging to build your streak!'}
              </div>
            </CardContent>
          </Card>
                </div>
                
      {/* Daily XP Goal */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold">Daily XP Goal</span>
                  </div>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
              {data.todayXp} / {data.dailyXpGoal}
            </Badge>
                </div>
          <Progress 
            value={Math.min((data.todayXp / data.dailyXpGoal) * 100, 100)} 
            className="h-3"
          />
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold">Achievements</h2>
          </div>

          {coreAchievements.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                No achievements available
                  </p>
                </div>
              ) : (
            <div className="space-y-4">
              {coreAchievements.map((achievement) => {
                const progress = getAchievementProgress(achievement.id);
                const isUnlocked = achievement.unlocked;
                const isInProgress = !isUnlocked && progress > 0;

                return (
                    <div 
                      key={achievement.id}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      isUnlocked
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : isInProgress
                        ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/10'
                          : 'border-gray-200 bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        isUnlocked
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        {isUnlocked ? (
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <Lock className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold text-lg ${
                            isUnlocked 
                              ? 'text-green-800 dark:text-green-200' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {achievement.name}
                          </h3>
                          <Badge 
                            variant={isUnlocked ? "default" : "secondary"}
                            className={isUnlocked ? "bg-green-600" : ""}
                          >
                            {isUnlocked ? "Unlocked" : isInProgress ? "In Progress" : "Locked"}
                          </Badge>
                        </div>
                        <p className={`text-sm mb-3 ${
                          isUnlocked 
                            ? 'text-green-700 dark:text-green-300' 
                            : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {achievement.description}
                          </p>

                        {/* Progress Bar (for in-progress achievements) */}
                        {isInProgress && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                              <span>Progress</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}

                        {/* XP Reward */}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            +{achievement.xpReward} XP
                          </Badge>
                          {isUnlocked && achievement.unlockedAt && (
                            <span className="text-xs text-green-600 dark:text-green-400">
                              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
                </div>
              )}
            </CardContent>
          </Card>
    </div>
  );
}
