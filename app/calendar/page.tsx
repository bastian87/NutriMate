"use client";

import { useState, useMemo, useEffect } from "react";
import { CalendarView } from '@/components/calendar-view';
import { DayDrawer } from '@/components/day-drawer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useActiveGoal } from "@/hooks/useActiveGoal";
import { useLanguage } from "@/lib/i18n/context";

/**
 * Nutrition Tracking Calendar page
 */
export default function CalendarPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { activeGoal, loading: goalLoading, createDefaultGoal } = useActiveGoal();
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">{t("calendar.accessRequired")}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("calendar.mustSignIn")}
          </p>
          <Button asChild>
            <a href="/login">{t("calendar.signIn")}</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("calendar.title")}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("calendar.subtitle")}
        </p>
      </div>

      {/* Goal Configuration */}
      {!activeGoal && !goalLoading && (
        <Card>
          <CardHeader>
            <CardTitle>{t("calendar.configureGoal")}</CardTitle>
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
      )}

      {/* Quick Actions */}
      {activeGoal && (
        <Card>
          <CardHeader>
            <CardTitle>{t("calendar.quickActions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label htmlFor="drawerDate" className="text-sm font-medium">
                  {t("calendar.openSpecificDay")}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="drawerDate"
                    type="date"
                    value={drawerDate}
                    onChange={(e) => setDrawerDate(e.target.value)}
                  />
                  <DayDrawer 
                    date={drawerDate} 
                    goalId={activeGoal?.id || ""} 
                    onSave={() => window.location.reload()}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {activeGoal && (
        <Card>
          <CardHeader>
            <CardTitle>{t("calendar.progressCalendar")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarView range={range} from={from} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
