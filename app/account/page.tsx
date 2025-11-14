"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { userService } from "@/lib/services/user-service"
import { useLanguage } from "@/lib/i18n/context"
import { Settings, Heart, Trophy } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import SubscriptionStatus from "@/components/subscription-status"
import { useUserPreferences } from "@/components/auth/user-preferences-provider";
import type { UserPreferences } from "@/lib/types/database";
import { useToast } from "@/components/ui/use-toast"

export default function AccountPage() {
  const { user } = useAuthContext()
  const { t } = useLanguage()
  const { preferences, loading, fetchPreferences } = useUserPreferences();
  const [saving, setSaving] = useState(false)
  const [formPrefs, setFormPrefs] = useState<Partial<UserPreferences> | null>(null);
  const [gamificationData, setGamificationData] = useState<any>(null);
  const { toast } = useToast();

  // Fetch gamification data
  useEffect(() => {
    if (user?.id) {
      fetch('/api/gamification')
        .then(res => res.json())
        .then(data => setGamificationData(data))
        .catch(err => console.error('Error fetching gamification data:', err));
    }
  }, [user?.id]);

  // Initialize form preferences with only the fields we need
  useEffect(() => {
    if (preferences) {
      const simplifiedPrefs: Partial<UserPreferences> = {
        age: preferences.age ?? null,
        gender: preferences.gender ?? null,
        height: preferences.height ?? null,
        weight: preferences.weight ?? null,
        activity_level: preferences.activity_level ?? null,
        health_goal: preferences.health_goal ?? null,
        calorie_target: preferences.calorie_target ?? null,
      };
      setFormPrefs(simplifiedPrefs);
    } else if (!loading && !formPrefs) {
      // Initialize with empty values if preferences haven't loaded yet
      setFormPrefs({
        age: null,
        gender: null,
        height: null,
        weight: null,
        activity_level: null,
        health_goal: null,
        calorie_target: null,
      });
    }
  }, [preferences, loading]);

  const handleSavePreferences = async () => {
    if (!user || !formPrefs) return
    try {
      setSaving(true)
      // Only save the simplified fields
      await userService.saveUserPreferences(user.id, formPrefs as UserPreferences)
      toast({
        title: t("accountPage.preferencesUpdated"),
        description: t("toast.success"),
      })
      await fetchPreferences();
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: t("accountPage.preferencesUpdateFailed"),
        description: t("toast.error"),
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">{t("accountPage.pleaseSignIn")}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("accountPage.loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Profile</h1>
            <p className="text-gray-600">View your progress, manage your subscription, and update your profile & goals.</p>
          </div>
          <Link href="/account/settings">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Settings className="h-4 w-4 mr-2" />
              {t("accountPage.profileAdvancedSettings")}
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* 1. Gamification Progress Card - FIRST */}
      {gamificationData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-orange-600" />
                Progress & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Level */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Level</p>
                  <p className="text-4xl font-bold text-orange-600 mb-1">{gamificationData.level}</p>
                  <p className="text-xs text-gray-500">{gamificationData.totalXp} total XP</p>
                </div>
                
                {/* XP Progress */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Progress</p>
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full h-3 transition-all"
                        style={{ width: `${gamificationData.progressPercent}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{gamificationData.xpToNextLevel} XP to next level</p>
                </div>
                
                {/* Streak */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Streak</p>
                  <p className="text-4xl font-bold text-orange-600 mb-1">{gamificationData.currentStreak}</p>
                  <p className="text-xs text-gray-500">days in a row</p>
                </div>
              </div>
              
              {/* Daily XP Goal */}
              <div className="mt-6 pt-6 border-t border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Daily XP Goal</p>
                    <p className="text-xs text-gray-500">Earn {gamificationData.dailyXpGoal} XP today</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600">{gamificationData.todayXp} / {gamificationData.dailyXpGoal}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round((gamificationData.todayXp / gamificationData.dailyXpGoal) * 100)}% complete
                    </p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 rounded-full h-2 transition-all"
                    style={{ width: `${Math.min((gamificationData.todayXp / gamificationData.dailyXpGoal) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 2. Subscription Status Card - SECOND */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <SubscriptionStatus userId={user.id} />
      </motion.div>

      {/* 3. Profile & Goals Form - THIRD */}
      {formPrefs && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleSavePreferences();
            }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Profile & Goals
                </CardTitle>
                <CardDescription>Update your basic health information and goals for personalized tracking.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">{t("accountPage.age")}</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formPrefs.age ?? ""}
                      onChange={(e) => setFormPrefs((prev) => prev ? { ...prev, age: Number.parseInt(e.target.value) || null } : prev)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">{t("accountPage.gender")}</Label>
                    <Select value={formPrefs.gender ?? ""} onValueChange={(value) => setFormPrefs((prev) => prev ? { ...prev, gender: value } : prev)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("accountPage.selectGender")}/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t("accountPage.male")}</SelectItem>
                        <SelectItem value="female">{t("accountPage.female")}</SelectItem>
                        <SelectItem value="other">{t("accountPage.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height">{t("accountPage.height")}</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formPrefs.height ?? ""}
                      onChange={(e) => setFormPrefs((prev) => prev ? { ...prev, height: Number.parseInt(e.target.value) || null } : prev)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">{t("accountPage.weight")}</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formPrefs.weight ?? ""}
                      onChange={(e) => setFormPrefs((prev) => prev ? { ...prev, weight: Number.parseInt(e.target.value) || null } : prev)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="activity_level">{t("accountPage.activityLevel")}</Label>
                  <Select value={formPrefs.activity_level ?? ""} onValueChange={(value) => setFormPrefs((prev) => prev ? { ...prev, activity_level: value } : prev)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("accountPage.selectActivityLevel")}/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">{t("accountPage.sedentary")}</SelectItem>
                      <SelectItem value="light">{t("accountPage.light")}</SelectItem>
                      <SelectItem value="moderate">{t("accountPage.moderate")}</SelectItem>
                      <SelectItem value="active">{t("accountPage.active")}</SelectItem>
                      <SelectItem value="very_active">{t("accountPage.veryActive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="health_goal">{t("accountPage.healthGoal")}</Label>
                  <Select value={formPrefs.health_goal ?? ""} onValueChange={(value) => setFormPrefs((prev) => prev ? { ...prev, health_goal: value } : prev)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("accountPage.selectHealthGoal")}/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight_loss">{t("accountPage.weightLoss")}</SelectItem>
                      <SelectItem value="maintenance">{t("accountPage.maintenance")}</SelectItem>
                      <SelectItem value="muscle_gain">{t("accountPage.muscleGain")}</SelectItem>
                      <SelectItem value="general_health">{t("accountPage.generalHealth")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="calorie_target">{t("accountPage.calorieTarget")}</Label>
                  <Input
                    id="calorie_target"
                    type="number"
                    value={formPrefs.calorie_target ?? ""}
                    onChange={(e) => setFormPrefs((prev) => prev ? { ...prev, calorie_target: Number.parseInt(e.target.value) || null } : prev)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={saving} className="w-full md:w-auto">
                {saving ? t("accountPage.saving") : t("accountPage.savePreferences")}
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  )
}
