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

interface HealthFormProps {
  user: any
  initialPreferences: any
  onUpdate: (preferences: any) => void
}

export default function HealthForm({ user, initialPreferences, onUpdate }: HealthFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    age: initialPreferences?.age || "",
    height: initialPreferences?.height || "",
    weight: initialPreferences?.weight || "",
    activityLevel: initialPreferences?.activityLevel || "",
    healthGoals: initialPreferences?.healthGoals || [],
    medicalConditions: initialPreferences?.medicalConditions || [],
  })
  const { toast } = useToast()

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
        title: "Health information updated",
        description: "Your health preferences have been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update health information. Please try again.",
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
        <CardTitle>Health Information</CardTitle>
        <CardDescription>Help us personalize your nutrition recommendations.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
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
              <Label htmlFor="height">Height (cm)</Label>
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
              <Label htmlFor="weight">Weight (kg)</Label>
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
            <Label>Activity Level</Label>
            <Select
              value={formData.activityLevel}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, activityLevel: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your activity level" />
              </SelectTrigger>
              <SelectContent>
                {activityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Health Goals</Label>
            <div className="grid grid-cols-2 gap-2">
              {healthGoalOptions.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={`goal-${goal}`}
                    checked={formData.healthGoals.includes(goal)}
                    onCheckedChange={(checked) => handleCheckboxChange("healthGoals", goal, checked as boolean)}
                  />
                  <Label htmlFor={`goal-${goal}`} className="text-sm">
                    {goal}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Medical Conditions</Label>
            <div className="grid grid-cols-2 gap-2">
              {medicalConditionOptions.map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={`condition-${condition}`}
                    checked={formData.medicalConditions.includes(condition)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("medicalConditions", condition, checked as boolean)
                    }
                  />
                  <Label htmlFor={`condition-${condition}`} className="text-sm">
                    {condition}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Health Information"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
