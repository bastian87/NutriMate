"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuthContext } from "@/components/auth/auth-provider"
import { userService } from "@/lib/services/user-service"
import { useLanguage } from "@/lib/i18n/context"
import { Settings, Target, Heart } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import SubscriptionStatus from "@/components/subscription-status"
import { useUserPreferences } from "@/components/auth/user-preferences-provider";
import { useEffect } from "react";
import type { UserPreferences } from "@/lib/types/database";

// Eliminar la interfaz local UserPreferences y usar el tipo global importado
// import type { UserPreferences } from "@/lib/types/database"

// Lista unificada de preferencias dietarias (igual que en el onboarding)
const dietTypes = [
  "No Restrictions",
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Keto",
  "Paleo",
  "Mediterranean",
  "Low Carb",
  "Low Fat",
  "Gluten Free",
]

export default function AccountPage() {
  const { user } = useAuthContext()
  const { t } = useLanguage()
  const { preferences, loading, fetchPreferences } = useUserPreferences();
  const [saving, setSaving] = useState(false)
  const [formPrefs, setFormPrefs] = useState<UserPreferences | null>(null);

  useEffect(() => {
    if (preferences) setFormPrefs(preferences);
  }, [preferences]);

  // Asegurarse de que todos los campos estén presentes al inicializar o actualizar formPrefs
  useEffect(() => {
    if (preferences) {
      setFormPrefs({
        ...preferences,
        dietary_preferences: preferences.dietary_preferences ?? [],
        excluded_ingredients: preferences.excluded_ingredients ?? [],
      });
    }
  }, [preferences]);

  const handleSavePreferences = async () => {
    if (!user || !formPrefs) return
    try {
      setSaving(true)
      await userService.saveUserPreferences(user.id, formPrefs)
      alert("Preferences updated successfully!")
      await fetchPreferences();
    } catch (error) {
      console.error("Error saving preferences:", error)
      alert("Failed to update preferences")
    } finally {
      setSaving(false)
    }
  }

  const toggleDietaryPreference = (preference: string) => {
    setFormPrefs((prev: UserPreferences | null) => prev ? {
      ...prev,
      dietary_preferences: prev.dietary_preferences.includes(preference)
        ? prev.dietary_preferences.filter((p: string) => p !== preference)
        : [...prev.dietary_preferences, preference],
    } : prev);
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

  if (loading || !formPrefs) {
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
      <div className="mb-8">
        <SubscriptionStatus userId={user.id} />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("accountPage.title")}</h1>
            <p className="text-gray-600">{t("accountPage.subtitle")}</p>
          </div>
          <Link href="/account/settings">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Settings className="h-4 w-4 mr-2" />
              {t("accountPage.profileAdvancedSettings")}
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Health Information */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                {t("accountPage.healthInfo")}
              </CardTitle>
              <CardDescription>{t("accountPage.healthInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">{t("accountPage.age")}</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formPrefs.age ?? ""}
                    onChange={(e) => setFormPrefs((prev) => prev ? { ...prev, age: Number.parseInt(e.target.value) } : prev)}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">{t("accountPage.gender")}</Label>
                  <Select value={formPrefs.gender ?? ""} onValueChange={(value) => setFormPrefs((prev) => prev ? { ...prev, gender: value } : prev)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("accountPage.selectGender")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("accountPage.male")}</SelectItem>
                      <SelectItem value="female">{t("accountPage.female")}</SelectItem>
                      <SelectItem value="other">{t("accountPage.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">{t("accountPage.height")}</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formPrefs.height ?? ""}
                    onChange={(e) => setFormPrefs((prev) => prev ? { ...prev, height: Number.parseInt(e.target.value) } : prev)}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">{t("accountPage.weight")}</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formPrefs.weight ?? ""}
                    onChange={(e) => setFormPrefs((prev) => prev ? { ...prev, weight: Number.parseInt(e.target.value) } : prev)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="activity_level">{t("accountPage.activityLevel")}</Label>
                <Select value={formPrefs.activity_level ?? ""} onValueChange={(value) => setFormPrefs((prev) => prev ? { ...prev, activity_level: value } : prev)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("accountPage.selectActivityLevel")} />
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
                    <SelectValue placeholder={t("accountPage.selectHealthGoal")} />
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
                  onChange={(e) => setFormPrefs((prev) => prev ? { ...prev, calorie_target: Number.parseInt(e.target.value) } : prev)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dietary Preferences */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t("accountPage.dietaryPreferences")}
              </CardTitle>
              <CardDescription>{t("accountPage.dietaryPreferencesDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium">{t("accountPage.dietaryPreferences")}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {dietTypes.map((diet) => (
                    <div key={diet} className="flex items-center space-x-2">
                      <Checkbox
                        id={`diet-${diet}`}
                        checked={formPrefs.dietary_preferences?.includes(diet)}
                        onCheckedChange={() => toggleDietaryPreference(diet)}
                      />
                      <Label htmlFor={`diet-${diet}`} className="text-sm font-normal">
                        {diet}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="excluded_ingredients">{t("accountPage.excludedIngredients")}</Label>
                <Input
                  id="excluded_ingredients"
                  placeholder={t("accountPage.excludedIngredientsPlaceholder")}
                  value={formPrefs.excluded_ingredients?.join(", ") || ""}
                  onChange={(e) =>
                    setFormPrefs((prev) => prev ? {
                      ...prev,
                      excluded_ingredients: e.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                    } : prev)
                  }
                />
                <p className="text-sm text-gray-500 mt-1">{t("accountPage.separateIngredients")}</p>
              </div>

              <Button onClick={handleSavePreferences} disabled={saving} className="w-full">
                {saving ? t("accountPage.saving") : t("accountPage.savePreferences")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Advanced Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t("accountPage.advancedPreferences")}
              </CardTitle>
              <CardDescription>{t("accountPage.advancedPreferencesDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="include_snacks">{t("accountPage.includeSnacks")}</Label>
                <Checkbox
                  id="include_snacks"
                  checked={!!formPrefs.include_snacks}
                  onCheckedChange={(checked) => setFormPrefs((prev) => prev ? { ...prev, include_snacks: checked as boolean } : prev)}
                  className="ml-2"
                />
              </div>              
              <div>
                <Label htmlFor="max_prep_time">{t("accountPage.maxPrepTime")}</Label>
                <Input
                  id="max_prep_time"
                  type="number"
                  min={5}
                  max={180}
                  value={formPrefs.max_prep_time || 60}
                  onChange={(e) => setFormPrefs((prev) => prev ? { ...prev, max_prep_time: Number.parseInt(e.target.value) } : prev)}
                />
              </div>
              <div>
                <Label htmlFor="macro_priority">{t("accountPage.macroPriority")}</Label>
                <Select
                  value={formPrefs.macro_priority || "balanced"}
                  onValueChange={(value) => setFormPrefs((prev) => prev ? { ...prev, macro_priority: value } : prev)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("accountPage.selectMacroPriority")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">{t("accountPage.balanced")}</SelectItem>
                    <SelectItem value="protein">{t("accountPage.protein")}</SelectItem>
                    <SelectItem value="carbs">{t("accountPage.carbs")}</SelectItem>
                    <SelectItem value="fat">{t("accountPage.fat")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSavePreferences} disabled={saving} className="w-full">
                {saving ? t("accountPage.saving") : t("accountPage.saveAdvancedPreferences")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
