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
import { useLanguage } from "@/lib/i18n/context"

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
  const { t } = useLanguage()

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
        title: t("toast.updateDietTitle"),
        description: t("toast.updateDietDesc"),
      })
    } catch (error) {
      toast({
        title: t("toast.error"),
        description: t("toast.updateDietError"),
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
        <CardTitle>{t("dietForm.title")}</CardTitle>
        <CardDescription>{t("dietForm.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>{t("dietForm.dietaryPreferences")}</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {dietTypes.map((diet) => (
                <div key={diet} className="flex items-center space-x-2">
                  <Checkbox
                    id={`diet-${diet}`}
                    checked={formData.dietary_preferences.includes(diet)}
                    onCheckedChange={(checked) => handleCheckboxChange(diet, checked as boolean)}
                  />
                  <Label htmlFor={`diet-${diet}`} className="text-sm font-normal">
                    {t(`dietTypes.${diet.replace(/\s/g, "")}`) || diet}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excluded_ingredients">{t("dietForm.excludedIngredients")}</Label>
            <Textarea
              id="excluded_ingredients"
              value={formData.excluded_ingredients}
              onChange={(e) => setFormData((prev) => ({ ...prev, excluded_ingredients: e.target.value }))}
              placeholder={t("dietForm.excludedIngredientsPlaceholder")}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{t("dietForm.excludedIngredientsHelp")}</p>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? t("dietForm.updating") : t("dietForm.update")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
