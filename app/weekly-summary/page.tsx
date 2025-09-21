"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/context";
import { Calendar, Target, Zap, TrendingUp, CheckCircle, XCircle } from "lucide-react";

interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalDays: number;
  successfulDays: number;
  totalKcal: number;
  targetKcal: number;
  averageKcalPerDay: number;
  xpEarned: number;
  streak: number;
  goals: {
    kcalGoal: boolean;
    macroGoals: boolean;
    consistencyGoal: boolean;
  };
  dailyBreakdown: Array<{
    date: string;
    isSuccess: boolean;
    totalKcal: number;
    targetKcal: number;
    flags: {
      hasCarb: boolean;
      hasProtein: boolean;
      hasFat: boolean;
      hasVegFruit: boolean;
      extrasCount: number;
    };
  }>;
}

export default function WeeklySummaryPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current week start (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    return d;
  };

  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    return getWeekStart(today).toISOString().slice(0, 10);
  });

  // Fetch weekly summary
  const fetchWeeklySummary = async (weekStart: string) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/summary/weekly?weekStart=${weekStart}`, {
        headers: { 'x-user-id': user.id }
      });
      
      if (response.ok) {
        const result = await response.json();
        setSummary(result);
      } else {
        toast({
          title: t("common.error"),
          description: t("weeklySummary.errorLoading"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
      toast({
        title: t("common.error"),
        description: t("weeklySummary.connectionError"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWeekChange = (weekStart: string) => {
    setSelectedWeek(weekStart);
    setLoading(true);
    fetchWeeklySummary(weekStart);
  };

  useEffect(() => {
    fetchWeeklySummary(selectedWeek);
  }, [user?.id, selectedWeek]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">{t("weeklySummary.accessRequired")}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("weeklySummary.signInRequired")}
          </p>
          <Button asChild>
            <a href="/login">{t("weeklySummary.signIn")}</a>
          </Button>
        </div>
      </div>
    );
  }

  const getSuccessRate = () => {
    if (!summary) return 0;
    return Math.round((summary.successfulDays / summary.totalDays) * 100);
  };

  const getKcalProgress = () => {
    if (!summary) return 0;
    return Math.min(100, (summary.totalKcal / summary.targetKcal) * 100);
  };

  const getWeekRange = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toLocaleDateString('es-ES'),
      end: end.toLocaleDateString('es-ES')
    };
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("weeklySummary.title")}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("weeklySummary.subtitle")}
        </p>
      </div>

      {/* Week Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t("weeklySummary.selectWeek")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="weekStart">{t("weeklySummary.weekStart")}</Label>
              <Input
                id="weekStart"
                type="date"
                value={selectedWeek}
                onChange={(e) => handleWeekChange(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-600">
              {summary && (
                <span>
                  {t("weeklySummary.weekRange", { 
                    start: getWeekRange(selectedWeek).start, 
                    end: getWeekRange(selectedWeek).end 
                  })}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("weeklySummary.loadingWeeklySummary")}</p>
        </div>
      ) : summary ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("weeklySummary.successfulDays")}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {summary.successfulDays}/{summary.totalDays}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="mt-4">
                  <Progress value={getSuccessRate()} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{t("weeklySummary.successRate", { rate: getSuccessRate() })}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("weeklySummary.totalCalories")}</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {summary.totalKcal.toLocaleString()}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <div className="mt-4">
                  <Progress value={getKcalProgress()} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {t("weeklySummary.objectiveProgress", { progress: Math.round(getKcalProgress()) })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("weeklySummary.dailyAverage")}</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(summary.averageKcalPerDay)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">{t("weeklySummary.kcalPerDay")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("weeklySummary.xpEarned")}</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {summary.xpEarned}
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">{t("weeklySummary.thisWeek")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Goals Status */}
          <Card>
            <CardHeader>
              <CardTitle>{t("weeklySummary.goalsStatus")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  {summary.goals.kcalGoal ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{t("weeklySummary.calorieGoal")}</p>
                    <Badge variant={summary.goals.kcalGoal ? "default" : "destructive"}>
                      {summary.goals.kcalGoal ? t("weeklySummary.achieved") : t("weeklySummary.notAchieved")}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {summary.goals.macroGoals ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{t("weeklySummary.macroGoals")}</p>
                    <Badge variant={summary.goals.macroGoals ? "default" : "destructive"}>
                      {summary.goals.macroGoals ? t("weeklySummary.achieved") : t("weeklySummary.notAchieved")}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {summary.goals.consistencyGoal ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{t("weeklySummary.consistencyGoal")}</p>
                    <Badge variant={summary.goals.consistencyGoal ? "default" : "destructive"}>
                      {summary.goals.consistencyGoal ? t("weeklySummary.achieved") : t("weeklySummary.notAchieved")}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>{t("weeklySummary.dailyBreakdown")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.dailyBreakdown.map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {day.isSuccess ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">
                          {new Date(day.date).toLocaleDateString('es-ES', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {day.totalKcal} / {day.targetKcal} kcal
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {day.flags.hasCarb && <Badge variant="outline" className="text-xs">C</Badge>}
                      {day.flags.hasProtein && <Badge variant="outline" className="text-xs">P</Badge>}
                      {day.flags.hasFat && <Badge variant="outline" className="text-xs">G</Badge>}
                      {day.flags.hasVegFruit && <Badge variant="outline" className="text-xs">V</Badge>}
                      {day.flags.extrasCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          +{day.flags.extrasCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {t("weeklySummary.couldNotLoadData")}
          </p>
        </div>
      )}
    </div>
  );
}
