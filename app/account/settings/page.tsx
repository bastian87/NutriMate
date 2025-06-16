"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthContext } from "@/components/auth/auth-provider"
import { userService } from "@/lib/services/user-service"
import { User, Settings, Heart, CreditCard, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

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

export default function AccountSettingsPage() {
  const { user, signOut } = useAuthContext()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to update profile")
    } finally {
      setSaving(false)
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

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Please sign in to access account settings.</p>
          <Button onClick={() => router.push("/login")}>Sign In</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading account settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your profile, preferences, and account settings</p>
      </motion.div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Health
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Diet
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your basic profile information</CardDescription>
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
              <Button onClick={handleSaveProfile} disabled={saving} className="bg-orange-600 hover:bg-orange-700">
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Health Information
              </CardTitle>
              <CardDescription>Your health metrics for personalized recommendations</CardDescription>
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
              <Button onClick={handleSavePreferences} disabled={saving} className="bg-orange-600 hover:bg-orange-700">
                {saving ? "Saving..." : "Save Health Info"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dietary Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Dietary Preferences
              </CardTitle>
              <CardDescription>Select your dietary preferences and restrictions</CardDescription>
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
                  { id: "low_carb", label: "Low Carb" },
                  { id: "mediterranean", label: "Mediterranean" },
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
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription & Billing
              </CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800">Free Plan</h3>
                <p className="text-sm text-green-600">You're currently on the free plan</p>
              </div>
              <Button onClick={() => router.push("/pricing")} className="bg-orange-600 hover:bg-orange-700">
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Password</h3>
                    <p className="text-sm text-gray-600">Change your account password</p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <h4 className="font-medium text-red-800">Sign Out</h4>
                      <p className="text-sm text-red-600">Sign out of your account</p>
                    </div>
                    <Button variant="destructive" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
