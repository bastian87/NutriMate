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
}

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
          <p className="text-gray-600 mb-4">Please sign in to access your account.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading account information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Account Settings</h1>
            <p className="text-gray-600">Manage your health preferences and profile settings</p>
          </div>
          <Link href="/account/settings">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Settings className="h-4 w-4 mr-2" />
              Profile & Advanced Settings
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
                Health Information
              </CardTitle>
              <CardDescription>Your basic health metrics for personalized recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={preferences.age}
                    onChange={(e) => setPreferences((prev) => ({ ...prev, age: Number.parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={preferences.gender} onValueChange={(value) => setPreferences((prev) => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={preferences.height}
                    onChange={(e) => setPreferences((prev) => ({ ...prev, height: Number.parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={preferences.weight}
                    onChange={(e) => setPreferences((prev) => ({ ...prev, weight: Number.parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="activity_level">Activity Level</Label>
                <Select value={preferences.activity_level} onValueChange={(value) => setPreferences((prev) => ({ ...prev, activity_level: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                    <SelectItem value="light">Lightly active (light exercise/sports 1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderately active (moderate exercise/sports 3-5 days/week)</SelectItem>
                    <SelectItem value="active">Very active (hard exercise/sports 6-7 days a week)</SelectItem>
                    <SelectItem value="very_active">Extra active (very hard exercise/sports & physical job)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="health_goal">Health Goal</Label>
                <Select value={preferences.health_goal} onValueChange={(value) => setPreferences((prev) => ({ ...prev, health_goal: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select health goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Weight Loss</SelectItem>
                    <SelectItem value="maintenance">Weight Maintenance</SelectItem>
                    <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                    <SelectItem value="general_health">General Health</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="calorie_target">Daily Calorie Target</Label>
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
                Dietary Preferences
              </CardTitle>
              <CardDescription>Customize your dietary preferences and restrictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium">Dietary Preferences</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["vegetarian", "vegan", "gluten-free", "dairy-free", "keto", "paleo", "mediterranean"].map((preference) => (
                    <div key={preference} className="flex items-center space-x-2">
                      <Checkbox
                        id={preference}
                        checked={preferences.dietary_preferences?.includes(preference)}
                        onCheckedChange={() => toggleDietaryPreference(preference)}
                      />
                      <Label htmlFor={preference} className="text-sm capitalize">
                        {preference.replace("-", " ")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="excluded_ingredients">Excluded Ingredients</Label>
                <Input
                  id="excluded_ingredients"
                  placeholder="e.g., nuts, shellfish, soy (comma separated)"
                  value={preferences.excluded_ingredients?.join(", ") || ""}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      excluded_ingredients: e.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                    }))
                  }
                />
                <p className="text-sm text-gray-500 mt-1">Separate ingredients with commas</p>
              </div>

              <Button onClick={handleSavePreferences} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
