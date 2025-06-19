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
import { useLanguage } from "@/lib/i18n/context"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { useAuthContext } from "@/components/auth/auth-provider"
import { userService } from "@/lib/services/user-service"

type HealthGoal = "weight_loss" | "muscle_gain" | "maintenance" | "health_improvement" | "energy_boost"
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active"

interface ValidationErrors {
  age?: string
  height?: string
  weight?: string
  healthGoal?: string
  general?: string
}

// Lista unificada de preferencias dietarias (igual que en /account)
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

export default function OnboardingForm() {
  const router = useRouter()
  const { t } = useLanguage()
  const { user } = useAuthContext()
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState({
    // Basic info
    age: 30,
    gender: "male",
    height: 175, // in cm
    weight: 70, // in kg
    activity_level: "moderate" as ActivityLevel,

    // Health goals
    health_goal: "" as HealthGoal,
    calorie_target: 0, // Will be calculated based on other inputs

    // Dietary preferences
    dietary_preferences: [] as string[],
    excluded_ingredients: [] as string[],
    customExcludedIngredient: "",
    // Advanced
    include_snacks: false,
    allergies: [] as string[],
    intolerances: [] as string[],
    max_prep_time: 60,
    macro_priority: "balanced",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm")
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg")
  const [showConfirmation, setShowConfirmation] = useState(false)

  const totalSteps = 4

  // Validation functions
  const validateStep1 = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.age || formData.age <= 0) {
      newErrors.age = t("onboardingForm.validation.ageRequired")
    } else if (formData.age < 18) {
      newErrors.age = t("onboardingForm.validation.ageMinimum")
    }

    if (!formData.height || formData.height <= 0) {
      newErrors.height = t("onboardingForm.validation.heightRequired")
    } else {
      const minHeight = heightUnit === "cm" ? 100 : 3
      const maxHeight = heightUnit === "cm" ? 250 : 8
      if (formData.height < minHeight || formData.height > maxHeight) {
        newErrors.height = t("onboardingForm.validation.heightRange")
      }
    }

    if (!formData.weight || formData.weight <= 0) {
      newErrors.weight = t("onboardingForm.validation.weightRequired")
    } else {
      const minWeight = weightUnit === "kg" ? 30 : 66
      const maxWeight = weightUnit === "kg" ? 200 : 440
      if (formData.weight < minWeight || formData.weight > maxWeight) {
        newErrors.weight = t("onboardingForm.validation.weightRange")
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.health_goal) {
      newErrors.healthGoal = t("onboardingForm.validation.healthGoalRequired")
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

    return Math.round(bmr * activityMultipliers[formData.activity_level])
  }

  // Calculate calorie target based on health goal and TDEE
  const calculateCalorieTarget = () => {
    const tdee = calculateTDEE()

    switch (formData.health_goal) {
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
    if (!user) {
      setErrors({ general: t("onboardingForm.loginRequired") })
      return
    }
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
          calorie_target: calorieTarget,
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
          activity_level: formData.activity_level,
          health_goal: formData.health_goal,
          calorie_target: formData.calorie_target,
          dietary_preferences: formData.dietary_preferences,
          excluded_ingredients: formData.excluded_ingredients,
          include_snacks: formData.include_snacks,
          allergies: formData.allergies,
          intolerances: formData.intolerances,
          max_prep_time: formData.max_prep_time,
          macro_priority: formData.macro_priority,
        }

        await userService.saveUserPreferences(user.id, { user_id: user.id, ...dataToSubmit })

        // Show confirmation dialog with actual user email
        setShowConfirmation(true)
      } catch (error) {
        console.error("Error saving preferences:", error)
        setErrors({ general: t("onboardingForm.savingError") })
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

  const handleConfirmationClose = () => {
    setShowConfirmation(false)
    // Redirect to dashboard after closing confirmation
    router.push("/dashboard")
  }

  const toggleDietaryPreference = (preference: string) => {
    setFormData((prev) => {
      if (prev.dietary_preferences.includes(preference)) {
        return {
          ...prev,
          dietary_preferences: prev.dietary_preferences.filter((p) => p !== preference),
        }
      } else {
        return {
          ...prev,
          dietary_preferences: [...prev.dietary_preferences, preference],
        }
      }
    })
  }

  const addExcludedIngredient = () => {
    if (formData.customExcludedIngredient.trim()) {
      setFormData((prev) => ({
        ...prev,
        excluded_ingredients: [...prev.excluded_ingredients, prev.customExcludedIngredient.trim().toLowerCase()],
        customExcludedIngredient: "",
      }))
    }
  }

  const removeExcludedIngredient = (ingredient: string) => {
    setFormData((prev) => ({
      ...prev,
      excluded_ingredients: prev.excluded_ingredients.filter((i) => i !== ingredient),
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
    <>
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
                    value={formData.activity_level}
                    onValueChange={(value: ActivityLevel) =>
                      setFormData((prev) => ({ ...prev, activity_level: value }))
                    }
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
                value={formData.health_goal}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, health_goal: value as HealthGoal }))
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
              <h2 className="text-xl font-semibold mb-4">Dietary Preferences</h2>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {dietTypes.map((diet) => (
                  <div key={diet} className="flex items-center space-x-2">
                    <Checkbox
                      id={`diet-${diet}`}
                      checked={formData.dietary_preferences.includes(diet)}
                      onCheckedChange={() => {
                        toggleDietaryPreference(diet)
                      }}
                    />
                    <Label htmlFor={`diet-${diet}`}>{diet}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Advanced Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Preferencias avanzadas</h2>
              <div>
                <Label htmlFor="include_snacks">¿Incluir snacks?</Label>
                <Checkbox
                  id="include_snacks"
                  checked={formData.include_snacks}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, include_snacks: checked as boolean }))}
                  className="ml-2"
                />
              </div>
              <div>
                <Label htmlFor="allergies">Alergias (separadas por coma)</Label>
                <Input
                  id="allergies"
                  placeholder="ej: nueces, mariscos, huevo"
                  value={formData.allergies?.join(", ") || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, allergies: e.target.value.split(",").map((i) => i.trim()).filter(Boolean) }))}
                />
              </div>
              <div>
                <Label htmlFor="intolerances">Intolerancias (separadas por coma)</Label>
                <Input
                  id="intolerances"
                  placeholder="ej: lactosa, gluten"
                  value={formData.intolerances?.join(", ") || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, intolerances: e.target.value.split(",").map((i) => i.trim()).filter(Boolean) }))}
                />
              </div>
              <div>
                <Label htmlFor="max_prep_time">Tiempo máximo de preparación (minutos)</Label>
                <Input
                  id="max_prep_time"
                  type="number"
                  min={5}
                  max={180}
                  value={formData.max_prep_time || 60}
                  onChange={(e) => setFormData((prev) => ({ ...prev, max_prep_time: Number.parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="macro_priority">Prioridad de macronutrientes</Label>
                <Select
                  value={formData.macro_priority || "balanced"}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, macro_priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanceado</SelectItem>
                    <SelectItem value="protein">Alta proteína</SelectItem>
                    <SelectItem value="carbs">Altos carbohidratos</SelectItem>
                    <SelectItem value="fat">Altas grasas</SelectItem>
                  </SelectContent>
                </Select>
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
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={handleConfirmationClose}
        email={user?.email || "No email available"}
      />
    </>
  )
}
