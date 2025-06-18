"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useAuthContext } from "@/components/auth/auth-provider"
import { userService } from "@/lib/services/user-service"

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

export default function MobileOnboarding() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    age: 30,
    gender: "male",
    height: 175,
    weight: 70,
    activity_level: "moderate",
    health_goal: "",
    calorie_target: 2000,
    dietary_preferences: [] as string[],
    excluded_ingredients: [] as string[],
    include_snacks: false,
    allergies: [] as string[],
    intolerances: [] as string[],
    max_prep_time: 60,
    macro_priority: "balanced",
    customExcludedIngredient: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const totalSteps = 4

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    } else {
      setIsSubmitting(true)
      try {
        await userService.saveUserPreferences(user.id, { user_id: user.id, ...formData })
        router.push("/mobile")
      } catch (error) {
        alert("Error saving preferences")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const toggleDietaryPreference = (diet: string) => {
    setFormData((prev) => ({
      ...prev,
      dietary_preferences: prev.dietary_preferences.includes(diet)
        ? prev.dietary_preferences.filter((p) => p !== diet)
        : [...prev.dietary_preferences, diet],
    }))
  }

  return (
    <div className="bg-cream-50 min-h-screen flex flex-col items-center justify-center px-2 py-6">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-orange-600 h-2.5 rounded-full"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Paso {currentStep} de {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% Completo</span>
            </div>
          </div>

          {/* Step 1: Datos personales */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-2">Datos personales</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Edad</Label>
                  <Input id="age" type="number" value={formData.age} onChange={e => setFormData(prev => ({ ...prev, age: Number(e.target.value) }))} min={18} max={100} />
                </div>
                <div>
                  <Label htmlFor="gender">Género</Label>
                  <Select value={formData.gender} onValueChange={value => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Selecciona género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input id="height" type="number" value={formData.height} onChange={e => setFormData(prev => ({ ...prev, height: Number(e.target.value) }))} min={100} max={250} />
                </div>
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input id="weight" type="number" value={formData.weight} onChange={e => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))} min={30} max={200} />
                </div>
              </div>
              <div>
                <Label htmlFor="activity">Nivel de actividad</Label>
                <Select value={formData.activity_level} onValueChange={value => setFormData(prev => ({ ...prev, activity_level: value }))}>
                  <SelectTrigger id="activity">
                    <SelectValue placeholder="Selecciona nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentario</SelectItem>
                    <SelectItem value="light">Ligero</SelectItem>
                    <SelectItem value="moderate">Moderado</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="very_active">Muy activo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Objetivo */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-2">Objetivo de salud</h2>
              <Select value={formData.health_goal} onValueChange={value => setFormData(prev => ({ ...prev, health_goal: value }))}>
                <SelectTrigger id="health_goal">
                  <SelectValue placeholder="Selecciona objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_loss">Pérdida de peso</SelectItem>
                  <SelectItem value="muscle_gain">Ganancia muscular</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="health_improvement">Mejorar salud</SelectItem>
                  <SelectItem value="energy_boost">Más energía</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 3: Preferencias dietarias */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-2">Preferencias dietarias</h2>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {dietTypes.map((diet) => (
                  <div key={diet} className="flex items-center space-x-2">
                    <Checkbox
                      id={`diet-${diet}`}
                      checked={formData.dietary_preferences.includes(diet)}
                      onCheckedChange={() => toggleDietaryPreference(diet)}
                    />
                    <Label htmlFor={`diet-${diet}`}>{diet}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Preferencias avanzadas */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-2">Preferencias avanzadas</h2>
              <div>
                <Label htmlFor="include_snacks">¿Incluir snacks?</Label>
                <Checkbox
                  id="include_snacks"
                  checked={formData.include_snacks}
                  onCheckedChange={checked => setFormData(prev => ({ ...prev, include_snacks: checked as boolean }))}
                  className="ml-2"
                />
              </div>
              <div>
                <Label htmlFor="allergies">Alergias (separadas por coma)</Label>
                <Input
                  id="allergies"
                  placeholder="ej: nueces, mariscos, huevo"
                  value={formData.allergies?.join(", ") || ""}
                  onChange={e => setFormData(prev => ({ ...prev, allergies: e.target.value.split(",").map(i => i.trim()).filter(Boolean) }))}
                />
              </div>
              <div>
                <Label htmlFor="intolerances">Intolerancias (separadas por coma)</Label>
                <Input
                  id="intolerances"
                  placeholder="ej: lactosa, gluten"
                  value={formData.intolerances?.join(", ") || ""}
                  onChange={e => setFormData(prev => ({ ...prev, intolerances: e.target.value.split(",").map(i => i.trim()).filter(Boolean) }))}
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
                  onChange={e => setFormData(prev => ({ ...prev, max_prep_time: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="macro_priority">Prioridad de macronutrientes</Label>
                <Select
                  value={formData.macro_priority || "balanced"}
                  onValueChange={value => setFormData(prev => ({ ...prev, macro_priority: value }))}
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
              <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
            </Button>
            <Button
              onClick={handleNext}
              className="bg-orange-600 hover:bg-orange-700 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : currentStep === totalSteps ? "Completar" : "Siguiente"} {" "}
              {!isSubmitting && currentStep !== totalSteps && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 