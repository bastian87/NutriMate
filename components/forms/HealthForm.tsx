"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/i18n/context"

interface HealthFormProps {
  user: any
  initialPreferences: any
  onUpdate: (preferences: any) => void
}

export default function HealthForm({ user, initialPreferences, onUpdate }: HealthFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<{
    age: any;
    height: any;
    weight: any;
    activity_level: any;
    health_goals: any;
    medical_conditions: any;
    [key: string]: any;
  }>({
    age: initialPreferences?.age || "",
    height: initialPreferences?.height || "",
    weight: initialPreferences?.weight || "",
    activity_level: initialPreferences?.activity_level || "",
    health_goals: initialPreferences?.health_goals || [],
    medical_conditions: initialPreferences?.medical_conditions || [],
  })
  const { toast } = useToast()
  const { t } = useLanguage()

  const activityLevels = [
    { value: "sedentary", label: "Sedentary (little or no exercise)" },
    { value: "light", label: "Light (light exercise 1-3 days/week)" },
    { value: "moderate", label: "Moderate (moderate exercise 3-5 days/week)" },
    { value: "active", label: "Active (hard exercise 6-7 days/week)" },
    { value: "very-active", label: "Very Active (very hard exercise, physical job)" },
  ]

  const healthGoalOptions = [
    "Weight Loss",
    "Weight Gain",
    "Muscle Building",
    "Maintain Weight",
    "Improve Energy",
    "Better Sleep",
    "Reduce Cholesterol",
    "Manage Diabetes",
  ]

  const medicalConditionOptions = [
    "Diabetes",
    "High Blood Pressure",
    "High Cholesterol",
    "Heart Disease",
    "Food Allergies",
    "Celiac Disease",
    "Lactose Intolerance",
    "None",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onUpdate(formData)
      toast({
        title: t("toast.updateHealthTitle"),
        description: t("toast.updateHealthDesc"),
      })
    } catch (error) {
      toast({
        title: t("toast.error"),
        description: t("toast.updateHealthError"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked ? [...prev[field], value] : prev[field].filter((item: string) => item !== value),
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("healthForm.title")}</CardTitle>
        <CardDescription>{t("healthForm.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">{t("healthForm.age")}</Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter your age"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">{t("healthForm.height")}</Label>
              <Input
                id="height"
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                placeholder="Enter your height"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">{t("healthForm.weight")}</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Enter your weight"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("healthForm.activityLevel")}</Label>
            <Select
              value={formData.activity_level}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, activity_level: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("healthForm.activityLevelPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {activityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {t(`healthForm.activityLevels.${level.value}`) || level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>{t("healthForm.healthGoals")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {healthGoalOptions.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={`goal-${goal}`}
                    checked={formData.health_goals.includes(goal)}
                    onCheckedChange={(checked) => handleCheckboxChange("health_goals", goal, checked as boolean)}
                  />
                  <Label htmlFor={`goal-${goal}`} className="text-sm">
                    {t(`healthForm.healthGoalOptions.${goal.replace(/\s/g, "")}`) || goal}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>{t("healthForm.medicalConditions")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {medicalConditionOptions.map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={`condition-${condition}`}
                    checked={formData.medical_conditions.includes(condition)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("medical_conditions", condition, checked as boolean)
                    }
                  />
                  <Label htmlFor={`condition-${condition}`} className="text-sm">
                    {t(`healthForm.medicalConditionOptions.${condition.replace(/\s/g, "")}`) || condition}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? t("healthForm.updating") : t("healthForm.update")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
