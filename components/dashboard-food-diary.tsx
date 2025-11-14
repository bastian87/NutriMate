"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedCard, MetricCard } from "./animated-card";
import { 
  WeightIcon, 
  WaterIcon, 
  CaloriesIcon,
  MoreIcon,
  StarIcon,
  WeightChart,
  WaterProgress,
  CaloriesChart,
  MacroChart,
  PlusIcon,
  ClockIcon
} from './icons-new';
import { useLanguage } from "@/lib/i18n/context";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { useUserProfile, useIsPremium } from "@/components/auth/user-profile-provider";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useActiveGoal } from "@/hooks/useActiveGoal";
import { Crown, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface DashboardFoodDiaryProps {
  onRefresh?: () => void;
}

export const DashboardFoodDiary = ({ onRefresh }: DashboardFoodDiaryProps) => {
  const { t } = useLanguage();
  const { user } = useAuthContext();
  const { userData } = useUserProfile();
  const isPremium = useIsPremium();
  const { activeGoal } = useActiveGoal();
  const { 
    todayEntries, 
    todayNutrition, 
    weekNutrition, 
    recentEntries, 
    loading, 
    error 
  } = useDashboardData();

  const targetCalories = activeGoal?.targetKcalDay || 2000;
  const calorieProgress = Math.min((todayNutrition.calories / targetCalories) * 100, 100);
  const isOnTrack = calorieProgress >= 80 && calorieProgress <= 120;

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{t("common.error")}: {error}</p>
          <Button onClick={onRefresh} className="bg-orange-600 hover:bg-orange-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("common.tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
      <div className="grid grid-cols-12 gap-6">
        
        {/* Top Stats Row */}
        <div className="col-span-3">
          <MetricCard
            title={t("dashboard.caloriesToday")}
            value={`${todayNutrition.calories.toFixed(0)} kcal`}
            subtitle=""
            icon={<CaloriesIcon className="w-4 h-4 text-orange-600" />}
            color="text-orange-600"
            chart={<div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>}
            delay={0.1}
          />
        </div>

        <div className="col-span-3">
          <MetricCard
            title={t("recipes.protein")}
            value={`${todayNutrition.protein.toFixed(1)}g`}
            subtitle=""
            icon={<WeightIcon className="w-4 h-4 text-blue-600" />}
            color="text-blue-600"
            chart={<div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>}
            delay={0.2}
          />
        </div>

        <div className="col-span-3">
          <MetricCard
            title={t("recipes.carbs")}
            value={`${todayNutrition.carbs.toFixed(1)}g`}
            subtitle=""
            icon={<div className="w-4 h-4 bg-green-600 rounded-full" />}
            color="text-green-600"
            chart={<div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>}
            delay={0.3}
          />
        </div>

        <div className="col-span-3">
          <MetricCard
            title={t("recipes.fat")}
            value={`${todayNutrition.fats.toFixed(1)}g`}
            subtitle=""
            icon={<WaterIcon className="w-4 h-4 text-purple-600" />}
            color="text-purple-600"
            chart={<div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>}
            delay={0.4}
          />
        </div>

        {/* Today's Progress */}
        <div className="col-span-9">
          <AnimatedCard delay={0.5}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("dashboard.todayProgress")}</CardTitle>
                <Badge variant={isOnTrack ? "default" : "destructive"} className={isOnTrack ? "bg-green-100 text-green-800" : ""}>
                  {isOnTrack ? t("dashboard.onTrack") : t("dashboard.needsAttention")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Calorie Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t("recipes.calories")}</span>
                    <span>{todayNutrition.calories.toFixed(0)} / {targetCalories}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isOnTrack ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-medium">{todayEntries.length}</div>
                    <div className="text-xs text-gray-500">{t("dashboard.mealsRegistered")}</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium">{todayNutrition.protein.toFixed(1)}g</div>
                    <div className="text-xs text-gray-500">{t("recipes.protein")}</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium">{todayNutrition.carbs.toFixed(1)}g</div>
                    <div className="text-xs text-gray-500">{t("recipes.carbs")}</div>
                  </div>
                </div>

                {/* Motivational Message */}
                <div className={`p-3 rounded-lg text-sm ${
                  isOnTrack 
                    ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                }`}>
                  {isOnTrack 
                    ? t("dashboard.excellentBalance")
                    : t("dashboard.registerMoreMeals")
                  }
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Recent Entries & Quick Actions */}
        <div className="col-span-3">
          <AnimatedCard delay={0.6}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{t("dashboard.recentEntries")}</CardTitle>
                <Link href="/food-diary">
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentEntries.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm mb-3">{t("dashboard.noRecentEntries")}</p>
                  <div className="space-y-2">
                    <Link href="/food-diary">
                      <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30">
                        <PlusIcon className="w-4 h-4 mr-2" />
{t("dashboard.registerFood")}
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEntries.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                        {entry.category === 'breakfast' ? '🍳' :
                         entry.category === 'lunch' ? '🍽️' :
                         entry.category === 'dinner' ? '🍽️' : '🍎'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {entry.menu || (entry.ingredients ? entry.ingredients.map(ing => ing.name).join(', ') : t("dashboard.noName"))}
                        </div>
                        <div className="text-xs text-gray-500">
                          {entry.calories || 0} kcal • {entry.time}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                </div>
              )}
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Week Summary */}
        <div className="col-span-12">
          <AnimatedCard delay={0.7}>
            <CardHeader>
              <CardTitle>{t("dashboard.weekSummary")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {weekNutrition.calories.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-500">Calorías promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {weekNutrition.protein.toFixed(0)}g
                  </div>
                  <div className="text-sm text-gray-500">Proteína total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {weekNutrition.carbs.toFixed(0)}g
                  </div>
                  <div className="text-sm text-gray-500">Carbohidratos total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {weekNutrition.fats.toFixed(0)}g
                  </div>
                  <div className="text-sm text-gray-500">Grasas total</div>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
};
