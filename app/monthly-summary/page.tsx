"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/context";
import { Calendar, Target, Zap, TrendingUp, CheckCircle, XCircle, BarChart3 } from "lucide-react";

interface MonthlySummary {
  month: string;
  year: number;
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
  weeklyBreakdown: Array<{
    weekStart: string;
    weekEnd: string;
    successfulDays: number;
    totalDays: number;
    totalKcal: number;
    xpEarned: number;
  }>;
  topPerformingDays: Array<{
    date: string;
    totalKcal: number;
    isSuccess: boolean;
  }>;
}

export default function MonthlySummaryPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current month
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Fetch monthly summary
  const fetchMonthlySummary = async (month: string) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/summary/monthly?month=${month}`, {
        headers: { 'x-user-id': user.id }
      });
      
      if (response.ok) {
        const result = await response.json();
        setSummary(result);
      } else {
        toast({
          title: t("common.error"),
          description: t("monthlySummary.errorLoading"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      toast({
        title: t("common.error"),
        description: t("monthlySummary.connectionError"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setLoading(true);
    fetchMonthlySummary(month);
  };

  useEffect(() => {
    fetchMonthlySummary(selectedMonth);
  }, [user?.id, selectedMonth]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">{t("monthlySummary.accessRequired")}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("monthlySummary.signInRequired")}
          </p>
          <Button asChild>
            <a href="/login">{t("monthlySummary.signIn")}</a>
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

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("monthlySummary.title")}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("monthlySummary.subtitle")}
        </p>
      </div>

      {/* Month Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t("monthlySummary.selectMonth")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">{t("monthlySummary.monthAndYear")}</Label>
              <Input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-600">
              {summary && (
                <span>{getMonthName(selectedMonth)}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("monthlySummary.loadingMonthlySummary")}</p>
        </div>
      ) : summary ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("monthlySummary.successfulDays")}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {summary.successfulDays}/{summary.totalDays}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="mt-4">
                  <Progress value={getSuccessRate()} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{t("monthlySummary.successRate", { rate: getSuccessRate() })}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("monthlySummary.totalCalories")}</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {summary.totalKcal.toLocaleString()}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <div className="mt-4">
                  <Progress value={getKcalProgress()} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {t("monthlySummary.objectiveProgress", { progress: Math.round(getKcalProgress()) })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("monthlySummary.dailyAverage")}</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(summary.averageKcalPerDay)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">{t("monthlySummary.kcalPerDay")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("monthlySummary.xpEarned")}</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {summary.xpEarned}
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">{t("monthlySummary.thisMonth")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Goals Status */}
          <Card>
            <CardHeader>
              <CardTitle>{t("monthlySummary.monthlyGoalsStatus")}</CardTitle>
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
                    <p className="font-medium">{t("monthlySummary.calorieGoal")}</p>
                    <Badge variant={summary.goals.kcalGoal ? "default" : "destructive"}>
                      {summary.goals.kcalGoal ? t("monthlySummary.achieved") : t("monthlySummary.notAchieved")}
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
                    <p className="font-medium">{t("monthlySummary.macroGoals")}</p>
                    <Badge variant={summary.goals.macroGoals ? "default" : "destructive"}>
                      {summary.goals.macroGoals ? t("monthlySummary.achieved") : t("monthlySummary.notAchieved")}
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
                    <p className="font-medium">{t("monthlySummary.consistencyGoal")}</p>
                    <Badge variant={summary.goals.consistencyGoal ? "default" : "destructive"}>
                      {summary.goals.consistencyGoal ? t("monthlySummary.achieved") : t("monthlySummary.notAchieved")}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {t("monthlySummary.weeklyBreakdown")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.weeklyBreakdown.map((week, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {t("monthlySummary.week", { number: index + 1 })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(week.weekStart).toLocaleDateString('es-ES')} - {new Date(week.weekEnd).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">{t("monthlySummary.successfulDaysLabel")}</p>
                        <p className="font-bold text-green-600">
                          {week.successfulDays}/{week.totalDays}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">{t("monthlySummary.calories")}</p>
                        <p className="font-bold text-blue-600">
                          {week.totalKcal.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">{t("monthlySummary.xp")}</p>
                        <p className="font-bold text-orange-600">
                          {week.xpEarned}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Days */}
          <Card>
            <CardHeader>
              <CardTitle>{t("monthlySummary.topPerformingDays")}</CardTitle>
            </CardHeader>
            <CardContent>
              {summary.topPerformingDays.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("monthlySummary.noDataForBestDays")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.topPerformingDays.map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {new Date(day.date).toLocaleDateString('es-ES', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </p>
                          <p className="text-sm text-gray-600">
                            {day.totalKcal} kcal
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {day.isSuccess ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {t("monthlySummary.successful")}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="w-3 h-3 mr-1" />
                            {t("monthlySummary.partial")}
                          </Badge>
                        )}
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
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {t("monthlySummary.couldNotLoadData")}
          </p>
        </div>
      )}
    </div>
  );
}
