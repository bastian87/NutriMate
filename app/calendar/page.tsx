"use client";

import { useState, useMemo, useEffect } from "react";
import { CalendarView } from '@/components/calendar-view';
import { DayDrawer } from '@/components/day-drawer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useActiveGoal } from "@/hooks/useActiveGoal";
import { useLanguage } from "@/lib/i18n/context";
import { useUserProfile, useIsPremium } from "@/components/auth/user-profile-provider";
import { useMealPlans } from "@/hooks/use-meal-plans";
import { 
  CalendarIcon, 
  MoreIcon, 
  CrownIcon,
  RunningIcon,
  StretchingIcon,
  WeightliftingIcon,
  WalkingIcon,
  SquatsIcon,
  CaloriesIcon,
  WeightIcon,
  WaterIcon,
  StepsIcon
} from '@/components/icons-new';
import { motion } from "framer-motion";
import Link from "next/link";

/**
 * Nutrition Tracking Calendar page
 */
export default function CalendarPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { activeGoal, loading: goalLoading, createDefaultGoal } = useActiveGoal();
  const { userData } = useUserProfile();
  const isPremium = useIsPremium();
  const { mealPlans } = useMealPlans();
  const { t } = useLanguage();
  const [range, setRange] = useState<"week" | "month">("month");
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);

  // default "from" = today (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const [from, setFrom] = useState<string>(todayStr);
  const [drawerDate, setDrawerDate] = useState<string>(todayStr);

  // Función para crear goal automáticamente
  const handleCreateGoal = async () => {
    setIsCreatingGoal(true);
    try {
      await createDefaultGoal();
    } finally {
      setIsCreatingGoal(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">{t("calendar.accessRequired")}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t("calendar.mustSignIn")}
                </p>
                <div className="space-y-3">
                  <Link href="/login" className="w-full">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      {t("calendar.signIn")}
                    </Button>
                  </Link>
                  <Link href="/signup" className="w-full">
                    <Button variant="outline" className="w-full">
                      Crear Cuenta
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <CalendarIcon className="h-8 w-8 text-orange-600" />
                {t("calendar.title")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {t("calendar.subtitle")}
              </p>
              {userData?.profile?.full_name && (
                <p className="text-sm text-gray-500">¡Bienvenido de vuelta, {userData.profile.full_name}!</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={isPremium ? "default" : "secondary"} className={isPremium ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" : ""}>
                  {isPremium ? (
                    <>
                      <CrownIcon className="h-3 w-3 mr-1" />
                      Cuenta Premium
                    </>
                  ) : (
                    "Cuenta Gratuita"
                  )}
                </Badge>
                {mealPlans && mealPlans.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {mealPlans.length} plan{mealPlans.length !== 1 ? 'es' : ''} de comida
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button variant="outline">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Ver Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Goal Configuration */}
        {!activeGoal && !goalLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WeightIcon className="h-5 w-5 text-orange-600" />
                  {t("calendar.configureGoal")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t("calendar.createFirstGoal")}
                </p>
                <Button 
                  onClick={handleCreateGoal}
                  disabled={isCreatingGoal}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isCreatingGoal ? t("calendar.creating") : t("calendar.createGoal")}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Calendar View */}
        {activeGoal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[rgba(255,241,215,1)] dark:bg-gray-800 border-orange-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-orange-600" />
                    {t("calendar.progressCalendar")}
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <MoreIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CalendarView range={range} from={from} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
