"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/context";
import { Flame, Zap, Trophy, Target, Calendar } from "lucide-react";

interface GamificationData {
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
  xpToNextLevel: number;
  weeklyXp: number;
  monthlyXp: number;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    unlockedAt?: string;
  }>;
}

export default function GamificationPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch gamification data
  const fetchGamificationData = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/gamification', {
        headers: { 'x-user-id': user.id }
      });
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        toast({
          title: t("common.error"),
          description: t("gamification.errorLoading"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      toast({
        title: t("common.error"),
        description: t("gamification.connectionError"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamificationData();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">{t("gamification.accessRequired")}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("gamification.signInRequired")}
          </p>
          <Button asChild>
            <a href="/login">{t("gamification.signIn")}</a>
          </Button>
        </div>
      </div>
    );
  }

  const getLevelProgress = () => {
    if (!data) return 0;
    const currentLevelXp = data.level * 1000; // 1000 XP per level
    const nextLevelXp = (data.level + 1) * 1000;
    const progress = ((data.totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-red-600";
    if (streak >= 14) return "text-orange-600";
    if (streak >= 7) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("gamification.title")}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("gamification.subtitle")}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("gamification.loadingGamification")}</p>
        </div>
      ) : data ? (
        <>
          {/* Level and XP */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                {t("gamification.levelAndExperience")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">
                    {t("gamification.currentLevel")} {data.level}
                  </div>
                  <p className="text-gray-600">{t("gamification.currentLevel")}</p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {data.totalXp.toLocaleString()}
                  </div>
                  <p className="text-gray-600">{t("gamification.totalXp")}</p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {data.xpToNextLevel}
                  </div>
                  <p className="text-gray-600">{t("gamification.xpToNextLevel")}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{t("gamification.progressToLevel", { level: data.level + 1 })}</span>
                  <span>{Math.round(getLevelProgress())}%</span>
                </div>
                <Progress value={getLevelProgress()} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Streaks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5" />
                {t("gamification.streak")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className={`text-6xl font-bold mb-2 ${getStreakColor(data.currentStreak)}`}>
                    {data.currentStreak}
                  </div>
                  <p className="text-gray-600">{t("gamification.currentStreak")}</p>
                  <Badge variant={data.currentStreak > 0 ? "default" : "secondary"} className="mt-2">
                    {data.currentStreak > 0 ? t("gamification.onStreak") : t("gamification.noActiveStreak")}
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="text-6xl font-bold text-purple-600 mb-2">
                    {data.longestStreak}
                  </div>
                  <p className="text-gray-600">{t("gamification.bestStreak")}</p>
                  <Badge variant="outline" className="mt-2">
                    {t("gamification.personalRecord")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly and Monthly XP */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                {t("gamification.xpByPeriod")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {data.weeklyXp}
                  </div>
                  <p className="text-gray-600">{t("gamification.weeklyXp")}</p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {data.monthlyXp}
                  </div>
                  <p className="text-gray-600">{t("gamification.monthlyXp")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {t("gamification.achievements")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.achievements.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("gamification.noAchievementsAvailable")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.achievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`border rounded-lg p-4 ${
                        achievement.unlocked 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-200 bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Trophy className={`w-6 h-6 ${
                          achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'
                        }`} />
                        <div>
                          <h3 className={`font-semibold ${
                            achievement.unlocked ? 'text-green-800 dark:text-green-200' : 'text-gray-600'
                          }`}>
                            {achievement.name}
                          </h3>
                          <p className={`text-sm ${
                            achievement.unlocked ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {achievement.description}
                          </p>
                          {achievement.unlocked && achievement.unlockedAt && (
                            <p className="text-xs text-green-500 mt-1">
                              {t("gamification.unlocked", { date: new Date(achievement.unlockedAt).toLocaleDateString('es-ES') })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12">
          <Flame className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {t("gamification.couldNotLoadData")}
          </p>
        </div>
      )}
    </div>
  );
}
