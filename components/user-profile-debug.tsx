"use client"

import { useUserProfile, useIsPremium, useAccountType, useFeatureAccess } from "@/components/auth/user-profile-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, User, Clock, CheckCircle, XCircle } from "lucide-react"

export function UserProfileDebug() {
  const { userData, loading, error } = useUserProfile()
  const isPremium = useIsPremium()
  const accountType = useAccountType()
  const saveRecipesAccess = useFeatureAccess("save_recipes")
  const mealPlansAccess = useFeatureAccess("create_meal_plans")
  const smartGroceryAccess = useFeatureAccess("smart_grocery_lists")

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Loading User Profile...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Error Loading Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!userData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>No User Profile Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">User profile data is not available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPremium ? <Crown className="h-5 w-5 text-orange-600" /> : <User className="h-5 w-5" />}
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Account Type:</span>
            <Badge variant={isPremium ? "default" : "secondary"} className={isPremium ? "bg-orange-100 text-orange-800" : ""}>
              {accountType.toUpperCase()}
            </Badge>
          </div>
          
          {userData.profile && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Name:</span>
                <span>{userData.profile.full_name || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Email:</span>
                <span className="text-sm">{userData.profile.email}</span>
              </div>
            </div>
          )}

          {userData.subscription && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Subscription Status:</span>
                <Badge variant={userData.subscription.status === "active" ? "default" : "secondary"}>
                  {userData.subscription.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Plan:</span>
                <span>{userData.subscription.plan}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Limits */}
      {userData.usage && (
        <Card>
          <CardHeader>
            <CardTitle>Usage Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Saved Recipes:</span>
              <span>{userData.usage.recipes.saved}/{userData.usage.recipes.maxSaved}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Meal Plans:</span>
              <span>{userData.usage.mealPlans.created}/{userData.usage.mealPlans.maxCreated}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Custom Recipes:</span>
              <span>{userData.usage.customRecipes.created}/{userData.usage.customRecipes.maxCreated}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Exports:</span>
              <span>{userData.usage.exports.used}/{userData.usage.exports.maxExports}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Access */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Save Recipes:</span>
            <div className="flex items-center gap-2">
              {saveRecipesAccess.canAccess ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">{saveRecipesAccess.canAccess ? "Allowed" : "Limited"}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Create Meal Plans:</span>
            <div className="flex items-center gap-2">
              {mealPlansAccess.canAccess ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">{mealPlansAccess.canAccess ? "Allowed" : "Limited"}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Smart Grocery Lists:</span>
            <div className="flex items-center gap-2">
              {smartGroceryAccess.canAccess ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">{smartGroceryAccess.canAccess ? "Allowed" : "Premium Only"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      {userData.preferences && (
        <Card>
          <CardHeader>
            <CardTitle>User Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Calorie Target:</span>
              <span>{userData.preferences.calorie_target || "Not set"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Health Goal:</span>
              <span>{userData.preferences.health_goal || "Not set"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Activity Level:</span>
              <span>{userData.preferences.activity_level || "Not set"}</span>
            </div>
            {userData.preferences.dietary_preferences.length > 0 && (
              <div>
                <span className="font-medium">Dietary Preferences:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {userData.preferences.dietary_preferences.map((pref, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {pref}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 