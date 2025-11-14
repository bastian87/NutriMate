"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/context";
import { useIsPremium } from "@/components/auth/user-profile-provider";
import { Calendar, Crown, Lock } from "lucide-react";
import Link from "next/link";

interface WeeklySummary {
  daysLogged: number;
  averageCaloriesPerDay: number;
}

export default function WeeklySummaryPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { t } = useLanguage();
  const isPremium = useIsPremium();
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current week start (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  };

  const [selectedWeek] = useState(() => {
    return getWeekStart(new Date());
  });

  // Fetch weekly summary (always fetch, even for non-premium)
  const fetchWeeklySummary = async (weekStart: string) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/summary/weekly?weekStart=${weekStart}`, {
        headers: { 'x-user-id': user.id }
      });
      
      if (response.ok) {
        const result = await response.json();
        setSummary({
          daysLogged: result.totalDays || 0,
          averageCaloriesPerDay: result.averageKcalPerDay || 0
        });
      } else {
        toast({
          title: t("common.error"),
          description: "Failed to load weekly summary",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
      toast({
        title: t("common.error"),
        description: "Connection error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchWeeklySummary(selectedWeek);
    } else {
      setLoading(false);
    }
  }, [user?.id, selectedWeek]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Access Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to view your weekly summary
          </p>
          <Button asChild>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  const weekRange = () => {
    const start = new Date(selectedWeek);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Weekly Summary</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {weekRange().start} - {weekRange().end}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading weekly summary...</p>
        </div>
      ) : summary ? (
        <div className="relative">
          {/* Content - blurred if not premium */}
          <div className={isPremium ? "" : "blur-sm pointer-events-none select-none"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    Days Logged
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <div className="text-5xl font-bold text-orange-600 mb-2">
                      {summary.daysLogged}
                    </div>
                    <p className="text-sm text-gray-600">days this week</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Average Calories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <div className="text-5xl font-bold text-blue-600 mb-2">
                      {Math.round(summary.averageCaloriesPerDay)}
                    </div>
                    <p className="text-sm text-gray-600">kcal per day</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Premium Paywall Overlay */}
          {!isPremium && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-2xl border-2 border-orange-200 dark:border-orange-800 max-w-md w-full mx-4">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                      <Crown className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">Unlock Weekly Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Get insights into your weekly progress with Premium. Track your consistency and see your average daily calories.
                  </p>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Lock className="w-4 h-4 text-orange-600" />
                      <span>Days logged this week</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Lock className="w-4 h-4 text-orange-600" />
                      <span>Average calories per day</span>
                    </div>
                  </div>
                  <Button 
                    asChild 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-6"
                    size="lg"
                  >
                    <Link href="/pricing">
                      Unlock Premium
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Could not load weekly data
          </p>
        </div>
      )}
    </div>
  );
}
