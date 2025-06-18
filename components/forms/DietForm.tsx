"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { UserPreferences } from "@/lib/types/database"

interface DietFormProps {
  user: any
  initialPreferences: Partial<UserPreferences>
  onUpdate: (preferences: Partial<UserPreferences>) => void
}

export default function DietForm({ user, initialPreferences, onUpdate }: DietFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    dietary_preferences: initialPreferences?.dietary_preferences || [],
    excluded_ingredients: initialPreferences?.excluded_ingredients?.join(", ") || "", // Join for textarea
    // Assuming other fields from your onboarding might be here
  })
  const { toast } = useToast()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const dataToUpdate = {
        ...formData,
        // Split textarea back into an array, trimming whitespace and removing empty strings
        excluded_ingredients: formData.excluded_ingredients
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }
      await onUpdate(dataToUpdate)
      toast({
        title: "Diet preferences updated",
        description: "Your dietary preferences have been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update diet preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckboxChange = (value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentPrefs = prev.dietary_preferences || []
      const newPrefs = checked ? [...currentPrefs, value] : currentPrefs.filter((item) => item !== value)
      return { ...prev, dietary_preferences: newPrefs }
    })
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Diet Preferences</CardTitle>
        <CardDescription>Tell us about your dietary preferences and restrictions.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Dietary Preferences</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {dietTypes.map((diet) => (
                <div key={diet} className="flex items-center space-x-2">
                  <Checkbox
                    id={`diet-${diet}`}
                    checked={formData.dietary_preferences.includes(diet)}
                    onCheckedChange={(checked) => handleCheckboxChange(diet, checked as boolean)}
                  />
                  <Label htmlFor={`diet-${diet}`} className="text-sm font-normal">
                    {diet}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excluded_ingredients">Excluded Ingredients</Label>
            <Textarea
              id="excluded_ingredients"
              value={formData.excluded_ingredients}
              onChange={(e) => setFormData((prev) => ({ ...prev, excluded_ingredients: e.target.value }))}
              placeholder="e.g., mushrooms, cilantro, olives"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Separate ingredients with a comma.</p>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Diet Preferences"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
