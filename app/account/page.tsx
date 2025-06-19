"use client"

import { useState, useEffect } from "react"
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

interface UserPreferences {
  age?: number
  gender?: string
  height?: number
  weight?: number
  activity_level?: string
  health_goal?: string
  calorie_target?: number
  dietary_preferences?: string[]
  excluded_ingredients?: string[]
  include_snacks?: boolean
  allergies?: string[]
  intolerances?: string[]
  max_prep_time?: number
  macro_priority?: string
}

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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    age: 30,
    gender: "male",
    height: 175,
    weight: 70,
    activity_level: "moderate",
    health_goal: "maintenance",
    calorie_target: 2000,
    dietary_preferences: [],
    excluded_ingredients: [],
    include_snacks: false,
    allergies: [],
    intolerances: [],
    max_prep_time: 60,
    macro_priority: "balanced",
  })

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load preferences from API
      const userPrefs = await userService.getUserPreferences(user.id)
      if (userPrefs) {
        setPreferences({
          age: userPrefs.age || 30,
          gender: userPrefs.gender || "male",
          height: userPrefs.height || 175,
          weight: userPrefs.weight || 70,
          activity_level: userPrefs.activity_level || "moderate",
          health_goal: userPrefs.health_goal || "maintenance",
          calorie_target: userPrefs.calorie_target || 2000,
          dietary_preferences: userPrefs.dietary_preferences || [],
          excluded_ingredients: userPrefs.excluded_ingredients || [],
          include_snacks: userPrefs.include_snacks ?? false,
          allergies: userPrefs.allergies || [],
          intolerances: userPrefs.intolerances || [],
          max_prep_time: userPrefs.max_prep_time || 60,
          macro_priority: userPrefs.macro_priority || "balanced",
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    if (!user) return

    try {
      setSaving(true)
      await userService.saveUserPreferences(user.id, preferences)
      alert("Preferences updated successfully!")
    } catch (error) {
      console.error("Error saving preferences:", error)
      alert("Failed to update preferences")
    } finally {
      setSaving(false)
    }
  }

  const toggleDietaryPreference = (preference: string) => {
    setPreferences((prev) => ({
      ...prev,
      dietary_preferences: prev.dietary_preferences?.includes(preference)
        ? prev.dietary_preferences.filter((p) => p !== preference)
        : [...(prev.dietary_preferences || []), preference],
    }))
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
                    value={preferences.age}
                    onChange={(e) => setPreferences((prev) => ({ ...prev, age: Number.parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">{t("accountPage.gender")}</Label>
                  <Select value={preferences.gender} onValueChange={(value) => setPreferences((prev) => ({ ...prev, gender: value }))}>
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
                    value={preferences.height}
                    onChange={(e) => setPreferences((prev) => ({ ...prev, height: Number.parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">{t("accountPage.weight")}</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={preferences.weight}
                    onChange={(e) => setPreferences((prev) => ({ ...prev, weight: Number.parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="activity_level">{t("accountPage.activityLevel")}</Label>
                <Select value={preferences.activity_level} onValueChange={(value) => setPreferences((prev) => ({ ...prev, activity_level: value }))}>
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
                <Select value={preferences.health_goal} onValueChange={(value) => setPreferences((prev) => ({ ...prev, health_goal: value }))}>
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
                  value={preferences.calorie_target}
                  onChange={(e) => setPreferences((prev) => ({ ...prev, calorie_target: Number.parseInt(e.target.value) }))}
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
                        checked={preferences.dietary_preferences?.includes(diet)}
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
                  value={preferences.excluded_ingredients?.join(", ") || ""}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      excluded_ingredients: e.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                    }))
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
                  checked={preferences.include_snacks}
                  onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, include_snacks: checked as boolean }))}
                  className="ml-2"
                />
              </div>
              <div>
                <Label htmlFor="allergies">{t("accountPage.allergies")}</Label>
                <Input
                  id="allergies"
                  placeholder={t("accountPage.allergies")}
                  value={preferences.allergies?.join(", ") || ""}
                  onChange={(e) => setPreferences((prev) => ({ ...prev, allergies: e.target.value.split(",").map((i) => i.trim()).filter(Boolean) }))}
                />
              </div>
              <div>
                <Label htmlFor="intolerances">{t("accountPage.intolerances")}</Label>
                <Input
                  id="intolerances"
                  placeholder={t("accountPage.intolerances")}
                  value={preferences.intolerances?.join(", ") || ""}
                  onChange={(e) => setPreferences((prev) => ({ ...prev, intolerances: e.target.value.split(",").map((i) => i.trim()).filter(Boolean) }))}
                />
              </div>
              <div>
                <Label htmlFor="max_prep_time">{t("accountPage.maxPrepTime")}</Label>
                <Input
                  id="max_prep_time"
                  type="number"
                  min={5}
                  max={180}
                  value={preferences.max_prep_time || 60}
                  onChange={(e) => setPreferences((prev) => ({ ...prev, max_prep_time: Number.parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="macro_priority">{t("accountPage.macroPriority")}</Label>
                <Select
                  value={preferences.macro_priority || "balanced"}
                  onValueChange={(value) => setPreferences((prev) => ({ ...prev, macro_priority: value }))}
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
