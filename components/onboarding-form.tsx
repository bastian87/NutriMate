"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react"
import { saveUserPreferences } from "@/lib/mock-services"
import { useLanguage } from "@/lib/i18n/context"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

type HealthGoal = "weight_loss" | "muscle_gain" | "maintenance" | "health_improvement" | "energy_boost"
type DietaryPreference = "vegetarian" | "vegan" | "gluten_free" | "dairy_free" | "keto" | "paleo"
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active"

interface ValidationErrors {
  age?: string
  height?: string
  weight?: string
  healthGoal?: string
  general?: string
}

interface OnboardingFormProps {
  onComplete?: (data: any) => void
}

export default function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState({
    // Basic info
    age: 30,
    gender: "male",
    height: 175, // in cm
    weight: 70, // in kg
    activityLevel: "moderate" as ActivityLevel,

    // Health goals
    healthGoal: "" as HealthGoal,
    calorieTarget: 0, // Will be calculated based on other inputs

    // Dietary preferences
    dietaryPreferences: [] as DietaryPreference[],
    excludedIngredients: [] as string[],
    customExcludedIngredient: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm")
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [userEmail, setUserEmail] = useState<string>("")

  const totalSteps = 4

  // Validation functions
  const validateStep1 = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.age || formData.age <= 0) {
      newErrors.age = t("validation.ageRequired")
    } else if (formData.age < 18) {
      newErrors.age = t("validation.ageMinimum")
    }

    if (!formData.height || formData.height <= 0) {
      newErrors.height = t("validation.heightRequired")
    } else {
      const minHeight = heightUnit === "cm" ? 100 : 3
      const maxHeight = heightUnit === "cm" ? 250 : 8
      if (formData.height < minHeight || formData.height > maxHeight) {
        newErrors.height = t("validation.heightRange")
      }
    }

    if (!formData.weight || formData.weight <= 0) {
      newErrors.weight = t("validation.weightRequired")
    } else {
      const minWeight = weightUnit === "kg" ? 30 : 66
      const maxWeight = weightUnit === "kg" ? 200 : 440
      if (formData.weight < minWeight || formData.weight > maxWeight) {
        newErrors.weight = t("validation.weightRange")
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.healthGoal) {
      newErrors.healthGoal = t("validation.healthGoalRequired")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    const weight = weightUnit === "kg" ? formData.weight : formData.weight * 0.453592 // Convert lb to kg
    const height = heightUnit === "cm" ? formData.height : formData.height * 30.48 // Convert ft to cm

    if (formData.gender === "male") {
      return 10 * weight + 6.25 * height - 5 * formData.age + 5
    } else {
      return 10 * weight + 6.25 * height - 5 * formData.age - 161
    }
  }

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = () => {
    const bmr = calculateBMR()
    const activityMultipliers = {
      sedentary: 1.2, // Little or no exercise
      light: 1.375, // Light exercise 1-3 days/week
      moderate: 1.55, // Moderate exercise 3-5 days/week
      active: 1.725, // Hard exercise 6-7 days/week
      very_active: 1.9, // Very hard exercise & physical job or 2x training
    }

    return Math.round(bmr * activityMultipliers[formData.activityLevel])
  }

  // Calculate calorie target based on health goal and TDEE
  const calculateCalorieTarget = () => {
    const tdee = calculateTDEE()

    switch (formData.healthGoal) {
      case "weight_loss":
        return Math.round(tdee * 0.8) // 20% deficit
      case "muscle_gain":
        return Math.round(tdee * 1.1) // 10% surplus
      case "maintenance":
        return tdee
      case "health_improvement":
        return tdee
      case "energy_boost":
        return tdee
      default:
        return tdee
    }
  }

  const handleNext = async () => {
    // Clear previous errors
    setErrors({})

    if (currentStep < totalSteps) {
      // Validate current step
      let isValid = true
      if (currentStep === 1) {
        isValid = validateStep1()
      } else if (currentStep === 2) {
        isValid = validateStep2()
      }

      if (!isValid) {
        return
      }

      // If moving from step 2 to 3, calculate calorie target
      if (currentStep === 2) {
        const calorieTarget = calculateCalorieTarget()
        setFormData((prev) => ({
          ...prev,
          calorieTarget,
        }))
      }

      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    } else {
      // Submit the form
      setIsSubmitting(true)

      try {
        const dataToSubmit = {
          age: formData.age,
          gender: formData.gender,
          height: heightUnit === "cm" ? formData.height : formData.height * 30.48,
          weight: weightUnit === "kg" ? formData.weight : formData.weight * 0.453592,
          activityLevel: formData.activityLevel,
          healthGoal: formData.healthGoal,
          calorieTarget: formData.calorieTarget,
          dietaryPreferences: formData.dietaryPreferences,
          excludedIngredients: formData.excludedIngredients,
        }

        await saveUserPreferences(dataToSubmit)

        // Get user email for confirmation dialog
        // You might need to get this from auth context or pass it as prop
        setUserEmail("user@example.com") // Replace with actual user email
        setShowConfirmation(true)
      } catch (error) {
        console.error("Error saving preferences:", error)
        setErrors({ general: t("validation.savingError") })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setErrors({}) // Clear errors when going back
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const toggleDietaryPreference = (preference: DietaryPreference) => {
    setFormData((prev) => {
      if (prev.dietaryPreferences.includes(preference)) {
        return {
          ...prev,
          dietaryPreferences: prev.dietaryPreferences.filter((p) => p !== preference),
        }
      } else {
        return {
          ...prev,
          dietaryPreferences: [...prev.dietaryPreferences, preference],
        }
      }
    })
  }

  const addExcludedIngredient = () => {
    if (formData.customExcludedIngredient.trim()) {
      setFormData((prev) => ({
        ...prev,
        excludedIngredients: [...prev.excludedIngredients, prev.customExcludedIngredient.trim().toLowerCase()],
        customExcludedIngredient: "",
      }))
    }
  }

  const removeExcludedIngredient = (ingredient: string) => {
    setFormData((prev) => ({
      ...prev,
      excludedIngredients: prev.excludedIngredients.filter((i) => i !== ingredient),
    }))
  }

  // Error message component
  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5">
            <div
              className="bg-orange-600 h-2.5 rounded-full"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Step {currentStep} of {totalSteps}
            </span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
        </div>

        {/* General Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <ErrorMessage error={errors.general} />
          </div>
        )}

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Tell us about yourself</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This information helps us calculate your daily calorie needs and personalize your meal plan.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, age: Number.parseInt(e.target.value) || 0 }))
                      if (errors.age) {
                        setErrors((prev) => ({ ...prev, age: undefined }))
                      }
                    }}
                    min={18}
                    max={100}
                    className={errors.age ? "border-red-500" : ""}
                  />
                  <ErrorMessage error={errors.age} />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger id="gender">
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

              <div>
                <Label htmlFor="height">Height</Label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, height: Number.parseFloat(e.target.value) || 0 }))
                        if (errors.height) {
                          setErrors((prev) => ({ ...prev, height: undefined }))
                        }
                      }}
                      min={heightUnit === "cm" ? 100 : 3}
                      max={heightUnit === "cm" ? 250 : 8}
                      step={heightUnit === "cm" ? 1 : 0.01}
                      className={errors.height ? "border-red-500" : ""}
                    />
                  </div>
                  <Select
                    value={heightUnit}
                    onValueChange={(value: "cm" | "ft") => {
                      // Convert the current height value when changing units
                      if (value === "cm" && heightUnit === "ft") {
                        // Convert from feet to cm
                        setFormData((prev) => ({ ...prev, height: Math.round(prev.height * 30.48) }))
                      } else if (value === "ft" && heightUnit === "cm") {
                        // Convert from cm to feet
                        setFormData((prev) => ({
                          ...prev,
                          height: Number.parseFloat((prev.height / 30.48).toFixed(2)),
                        }))
                      }
                      setHeightUnit(value)
                      // Clear height error when changing units
                      if (errors.height) {
                        setErrors((prev) => ({ ...prev, height: undefined }))
                      }
                    }}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="ft">ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ErrorMessage error={errors.height} />
              </div>

              <div>
                <Label htmlFor="weight">Weight</Label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, weight: Number.parseFloat(e.target.value) || 0 }))
                        if (errors.weight) {
                          setErrors((prev) => ({ ...prev, weight: undefined }))
                        }
                      }}
                      min={weightUnit === "kg" ? 30 : 66}
                      max={weightUnit === "kg" ? 200 : 440}
                      step={0.1}
                      className={errors.weight ? "border-red-500" : ""}
                    />
                  </div>
                  <Select
                    value={weightUnit}
                    onValueChange={(value: "kg" | "lb") => {
                      // Convert the current weight value when changing units
                      if (value === "kg" && weightUnit === "lb") {
                        // Convert from pounds to kg
                        setFormData((prev) => ({
                          ...prev,
                          weight: Number.parseFloat((prev.weight * 0.453592).toFixed(1)),
                        }))
                      } else if (value === "lb" && weightUnit === "kg") {
                        // Convert from kg to pounds
                        setFormData((prev) => ({
                          ...prev,
                          weight: Number.parseFloat((prev.weight / 0.453592).toFixed(1)),
                        }))
                      }
                      setWeightUnit(value)
                      // Clear weight error when changing units
                      if (errors.weight) {
                        setErrors((prev) => ({ ...prev, weight: undefined }))
                      }
                    }}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lb">lb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ErrorMessage error={errors.weight} />
              </div>

              <div>
                <Label htmlFor="activity">Activity Level</Label>
                <Select
                  value={formData.activityLevel}
                  onValueChange={(value: ActivityLevel) => setFormData((prev) => ({ ...prev, activityLevel: value }))}
                >
                  <SelectTrigger id="activity">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                    <SelectItem value="light">Lightly active (light exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderately active (moderate exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="active">Very active (hard exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="very_active">Extra active (very hard exercise & physical job)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Health Goals */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">What's your primary health goal?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This helps us tailor your meal plan to support your specific goals.
            </p>

            <RadioGroup
              value={formData.healthGoal}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, healthGoal: value as HealthGoal }))
                if (errors.healthGoal) {
                  setErrors((prev) => ({ ...prev, healthGoal: undefined }))
                }
              }}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                <RadioGroupItem value="weight_loss" id="weight_loss" />
                <Label htmlFor="weight_loss" className="flex-1 cursor-pointer">
                  <div className="font-medium">Weight Loss</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Calorie-controlled meals to support healthy weight loss
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                <RadioGroupItem value="muscle_gain" id="muscle_gain" />
                <Label htmlFor="muscle_gain" className="flex-1 cursor-pointer">
                  <div className="font-medium">Muscle Gain</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Protein-rich meals to support muscle building
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                <RadioGroupItem value="maintenance" id="maintenance" />
                <Label htmlFor="maintenance" className="flex-1 cursor-pointer">
                  <div className="font-medium">Maintenance</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Balanced meals to maintain your current weight
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                <RadioGroupItem value="health_improvement" id="health_improvement" />
                <Label htmlFor="health_improvement" className="flex-1 cursor-pointer">
                  <div className="font-medium">Health Improvement</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Nutrient-dense meals to improve overall health
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                <RadioGroupItem value="energy_boost" id="energy_boost" />
                <Label htmlFor="energy_boost" className="flex-1 cursor-pointer">
                  <div className="font-medium">Energy Boost</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Meals designed to increase energy levels throughout the day
                  </div>
                </Label>
              </div>
            </RadioGroup>
            <ErrorMessage error={errors.healthGoal} />
          </div>
        )}

        {/* Step 3: Dietary Preferences */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Do you have any dietary preferences?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Select all that apply. This helps us filter recipes to match your preferences.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                className={`border p-4 rounded-md cursor-pointer ${
                  formData.dietaryPreferences.includes("vegetarian")
                    ? "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-900"
                    : "hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
                onClick={() => toggleDietaryPreference("vegetarian")}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.dietaryPreferences.includes("vegetarian")}
                    onCheckedChange={() => toggleDietaryPreference("vegetarian")}
                  />
                  <Label className="font-medium cursor-pointer">Vegetarian</Label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-6">No meat, poultry, or seafood</p>
              </div>

              <div
                className={`border p-4 rounded-md cursor-pointer ${
                  formData.dietaryPreferences.includes("vegan")
                    ? "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-900"
                    : "hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
                onClick={() => toggleDietaryPreference("vegan")}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.dietaryPreferences.includes("vegan")}
                    onCheckedChange={() => toggleDietaryPreference("vegan")}
                  />
                  <Label className="font-medium cursor-pointer">Vegan</Label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-6">No animal products</p>
              </div>

              <div
                className={`border p-4 rounded-md cursor-pointer ${
                  formData.dietaryPreferences.includes("gluten_free")
                    ? "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-900"
                    : "hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
                onClick={() => toggleDietaryPreference("gluten_free")}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.dietaryPreferences.includes("gluten_free")}
                    onCheckedChange={() => toggleDietaryPreference("gluten_free")}
                  />
                  <Label className="font-medium cursor-pointer">Gluten-Free</Label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-6">No wheat, barley, or rye</p>
              </div>

              <div
                className={`border p-4 rounded-md cursor-pointer ${
                  formData.dietaryPreferences.includes("dairy_free")
                    ? "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-900"
                    : "hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
                onClick={() => toggleDietaryPreference("dairy_free")}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.dietaryPreferences.includes("dairy_free")}
                    onCheckedChange={() => toggleDietaryPreference("dairy_free")}
                  />
                  <Label className="font-medium cursor-pointer">Dairy-Free</Label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-6">No milk, cheese, or dairy products</p>
              </div>

              <div
                className={`border p-4 rounded-md cursor-pointer ${
                  formData.dietaryPreferences.includes("keto")
                    ? "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-900"
                    : "hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
                onClick={() => toggleDietaryPreference("keto")}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.dietaryPreferences.includes("keto")}
                    onCheckedChange={() => toggleDietaryPreference("keto")}
                  />
                  <Label className="font-medium cursor-pointer">Keto</Label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-6">Low-carb, high-fat meals</p>
              </div>

              <div
                className={`border p-4 rounded-md cursor-pointer ${
                  formData.dietaryPreferences.includes("paleo")
                    ? "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-900"
                    : "hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
                onClick={() => toggleDietaryPreference("paleo")}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.dietaryPreferences.includes("paleo")}
                    onCheckedChange={() => toggleDietaryPreference("paleo")}
                  />
                  <Label className="font-medium cursor-pointer">Paleo</Label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-6">
                  Whole foods, no grains or processed items
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Excluded Ingredients */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Any ingredients you want to avoid?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add any ingredients you're allergic to or simply don't like.
            </p>

            <div className="flex space-x-2">
              <Input
                placeholder="Enter an ingredient (e.g., mushrooms)"
                value={formData.customExcludedIngredient}
                onChange={(e) => setFormData((prev) => ({ ...prev, customExcludedIngredient: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addExcludedIngredient()
                  }
                }}
              />
              <Button type="button" onClick={addExcludedIngredient}>
                Add
              </Button>
            </div>

            {formData.excludedIngredients.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Excluded ingredients:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.excludedIngredients.map((ingredient) => (
                    <div
                      key={ingredient}
                      className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {ingredient}
                      <button
                        onClick={() => removeExcludedIngredient(ingredient)}
                        className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-900">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <span className="font-medium">Tip:</span> Adding ingredients you want to avoid helps us create a meal
                plan you'll truly enjoy. Don't forget common allergens if they apply to you!
              </p>
            </div>

            {/* Show calculated calorie target */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-md border border-orange-100 dark:border-orange-900">
              <h3 className="font-medium text-orange-800 dark:text-orange-300 mb-2">Your Daily Calorie Target</h3>
              <p className="text-orange-800 dark:text-orange-300 text-2xl font-bold">
                {formData.calorieTarget} calories
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                Based on your age, gender, height, weight, activity level, and health goal
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("common.back")}
          </Button>
          <Button
            onClick={handleNext}
            className="bg-orange-600 hover:bg-orange-700 flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : currentStep === totalSteps ? "Complete" : t("common.next")}{" "}
            {!isSubmitting && currentStep !== totalSteps && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
        <ConfirmationDialog open={showConfirmation} onOpenChange={setShowConfirmation} email={userEmail} />
      </CardContent>
    </Card>
  )
}
