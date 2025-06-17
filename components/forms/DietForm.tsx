"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface DietFormProps {
  user: any
  initialPreferences: any
  onUpdate: (preferences: any) => void
}

export default function DietForm({ user, initialPreferences, onUpdate }: DietFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    dietType: initialPreferences?.dietType || "",
    allergies: initialPreferences?.allergies || [],
    dislikes: initialPreferences?.dislikes || [],
    cuisinePreferences: initialPreferences?.cuisinePreferences || [],
    mealPreferences: initialPreferences?.mealPreferences || "",
    cookingTime: initialPreferences?.cookingTime || "",
    additionalNotes: initialPreferences?.additionalNotes || "",
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

  const commonAllergies = ["Nuts", "Shellfish", "Dairy", "Eggs", "Soy", "Gluten", "Fish", "Sesame"]

  const cuisineTypes = [
    "Italian",
    "Mexican",
    "Asian",
    "Mediterranean",
    "Indian",
    "American",
    "French",
    "Thai",
    "Japanese",
    "Middle Eastern",
  ]

  const cookingTimes = [
    { value: "15", label: "15 minutes or less" },
    { value: "30", label: "30 minutes or less" },
    { value: "45", label: "45 minutes or less" },
    { value: "60", label: "1 hour or less" },
    { value: "60+", label: "More than 1 hour" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onUpdate(formData)
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

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked ? [...prev[field], value] : prev[field].filter((item: string) => item !== value),
    }))
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Diet Preferences</CardTitle>
        <CardDescription>Tell us about your dietary preferences and restrictions.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Diet Type</Label>
            <Select
              value={formData.dietType}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, dietType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your diet type" />
              </SelectTrigger>
              <SelectContent>
                {dietTypes.map((diet) => (
                  <SelectItem key={diet} value={diet}>
                    {diet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Food Allergies</Label>
            <div className="grid grid-cols-2 gap-2">
              {commonAllergies.map((allergy) => (
                <div key={allergy} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergy-${allergy}`}
                    checked={formData.allergies.includes(allergy)}
                    onCheckedChange={(checked) => handleCheckboxChange("allergies", allergy, checked as boolean)}
                  />
                  <Label htmlFor={`allergy-${allergy}`} className="text-sm">
                    {allergy}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Cuisine Preferences</Label>
            <div className="grid grid-cols-2 gap-2">
              {cuisineTypes.map((cuisine) => (
                <div key={cuisine} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cuisine-${cuisine}`}
                    checked={formData.cuisinePreferences.includes(cuisine)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("cuisinePreferences", cuisine, checked as boolean)
                    }
                  />
                  <Label htmlFor={`cuisine-${cuisine}`} className="text-sm">
                    {cuisine}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred Cooking Time</Label>
            <Select
              value={formData.cookingTime}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, cookingTime: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select preferred cooking time" />
              </SelectTrigger>
              <SelectContent>
                {cookingTimes.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => setFormData((prev) => ({ ...prev, additionalNotes: e.target.value }))}
              placeholder="Any additional dietary preferences or restrictions..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Diet Preferences"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
