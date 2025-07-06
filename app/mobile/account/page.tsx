"use client"

import { useState, useEffect } from "react"
import { User, Settings, Heart, ArrowLeft, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import MobileNavigation from "@/components/mobile-navigation"
import { useAuthContext } from "@/components/auth/auth-provider"
import { userService } from "@/lib/services/user-service"
import { motion } from "framer-motion"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "react-i18next"

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

export default function MobileAccountPage() {
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
  })
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load profile
      const userProfile = await userService.getUserProfile(user.id)
      if (userProfile) {
        setProfile({
          full_name: userProfile.full_name || "",
          email: userProfile.email,
        })
      }

      // Load preferences
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

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      setSaving(true)
      await userService.updateUserProfile(user.id, profile)
      toast({
        title: t("accountPage.profileUpdated"),
        description: t("toast.success"),
      })
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: t("accountPage.profileUpdateFailed"),
        description: t("toast.error"),
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    if (!user) return

    try {
      setSaving(true)
      await userService.saveUserPreferences(user.id, preferences)
      toast({
        title: t("accountPage.preferencesUpdated"),
        description: t("toast.success"),
      })
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
      <div className="bg-background min-h-screen pb-20">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/mobile" className="flex items-center text-gray-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Link>
            <h1 className="text-lg font-bold">Account</h1>
            <button onClick={() => setIsMenuOpen(true)} className="w-8 h-8 flex items-center justify-center">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="text-center py-12 px-4">
          <p className="text-gray-600 mb-4">Please sign in to access your account.</p>
          <Link href="/login">
            <Button className="bg-orange-600 hover:bg-orange-700">Sign In</Button>
          </Link>
        </div>
        <MobileNavigation isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-background min-h-screen pb-20">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/mobile" className="flex items-center text-gray-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Link>
            <h1 className="text-lg font-bold">Account</h1>
            <button onClick={() => setIsMenuOpen(true)} className="w-8 h-8 flex items-center justify-center">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading account information...</p>
        </div>
        <MobileNavigation isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/mobile" className="flex items-center text-gray-600">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Link>
          <h1 className="text-lg font-bold">Account</h1>
          <button onClick={() => setIsMenuOpen(true)} className="w-8 h-8 flex items-center justify-center">
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <User className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.full_name || "User"}</h2>
            <p className="text-gray-600">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="px-4 mt-6">
        <div className="bg-green-600 rounded-lg shadow-sm p-4 text-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Premium Plan</h3>
            <span className="text-sm bg-white text-green-600 px-2 py-1 rounded-full">Active</span>
          </div>
          <p className="text-sm mb-4">Your subscription renews on June 21, 2025</p>
          <Link href="/account/subscription">
            <button className="bg-white text-green-600 rounded-lg py-2 px-4 text-sm font-medium">
              Manage Subscription
            </button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-6">
        <div className="flex bg-white rounded-lg p-1 shadow-sm">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "profile" ? "bg-orange-600 text-white" : "text-gray-600"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "health" ? "bg-orange-600 text-white" : "text-gray-600"
            }`}
            onClick={() => setActiveTab("health")}
          >
            Health
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "diet" ? "bg-orange-600 text-white" : "text-gray-600"
            }`}
            onClick={() => setActiveTab("diet")}
          >
            Diet
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-6 pb-20">
        {activeTab === "profile" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile((prev) => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profile.email} disabled className="bg-gray-50" />
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "health" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Health Information
                </CardTitle>
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
                    <Select
                      value={preferences.gender}
                      onValueChange={(value) => setPreferences((prev) => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                  <Select
                    value={preferences.activity_level}
                    onValueChange={(value) => setPreferences((prev) => ({ ...prev, activity_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="light">Lightly Active</SelectItem>
                      <SelectItem value="moderate">Moderately Active</SelectItem>
                      <SelectItem value="active">Very Active</SelectItem>
                      <SelectItem value="very_active">Extra Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="health_goal">Health Goal</Label>
                  <Select
                    value={preferences.health_goal}
                    onValueChange={(value) => setPreferences((prev) => ({ ...prev, health_goal: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight_loss">Weight Loss</SelectItem>
                      <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="health_improvement">Health Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="calorie_target">Daily Calorie Target</Label>
                  <Input
                    id="calorie_target"
                    type="number"
                    value={preferences.calorie_target}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, calorie_target: Number.parseInt(e.target.value) }))
                    }
                  />
                </div>
                <Button
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {saving ? "Saving..." : "Save Health Info"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "diet" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Dietary Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { id: "vegetarian", label: "Vegetarian" },
                    { id: "vegan", label: "Vegan" },
                    { id: "gluten_free", label: "Gluten-Free" },
                    { id: "dairy_free", label: "Dairy-Free" },
                    { id: "keto", label: "Keto" },
                    { id: "paleo", label: "Paleo" },
                  ].map((pref) => (
                    <div key={pref.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={pref.id}
                        checked={preferences.dietary_preferences?.includes(pref.id)}
                        onCheckedChange={() => toggleDietaryPreference(pref.id)}
                      />
                      <Label htmlFor={pref.id}>{pref.label}</Label>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <MobileNavigation isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  )
}
