"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Target, Activity, Calculator, TrendingUp, TrendingDown, Minus, AlertCircle, Check } from "lucide-react"
import type { OnboardingData } from "@/lib/services/onboarding-service"

interface GoalsStepProps {
  data: Partial<OnboardingData>
  onChange: (data: Partial<OnboardingData>) => void
}

export function GoalsStep({ data, onChange }: GoalsStepProps) {
  const [calorieError, setCalorieError] = useState('')
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null)

  const activityLevels = [
    {
      value: 'sedentary',
      label: 'Sedentario',
      description: 'Poco o ningún ejercicio',
      multiplier: 1.2
    },
    {
      value: 'light',
      label: 'Ligero',
      description: 'Ejercicio ligero 1-3 días/semana',
      multiplier: 1.375
    },
    {
      value: 'moderate',
      label: 'Moderado',
      description: 'Ejercicio moderado 3-5 días/semana',
      multiplier: 1.55
    },
    {
      value: 'active',
      label: 'Activo',
      description: 'Ejercicio intenso 6-7 días/semana',
      multiplier: 1.725
    },
    {
      value: 'very_active',
      label: 'Muy activo',
      description: 'Ejercicio muy intenso, trabajo físico',
      multiplier: 1.9
    }
  ]

  const healthGoals = [
    {
      value: 'weight_loss',
      label: 'Pérdida de peso',
      description: 'Crear un déficit calórico moderado',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      value: 'maintenance',
      label: 'Mantenimiento',
      description: 'Mantener tu peso actual',
      icon: Minus,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      value: 'muscle_gain',
      label: 'Ganancia muscular',
      description: 'Aumentar masa muscular',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      value: 'general_health',
      label: 'Salud general',
      description: 'Mejorar hábitos alimentarios',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ]

  const calculateCalories = () => {
    if (!data.age || !data.gender || !data.height || !data.weight || !data.activity_level) {
      return null
    }

    // Fórmula de Harris-Benedict
    let bmr: number
    if (data.gender === 'male') {
      bmr = 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age)
    } else {
      bmr = 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age)
    }

    const activityLevel = activityLevels.find(level => level.value === data.activity_level)
    if (!activityLevel) return null

    const tdee = bmr * activityLevel.multiplier

    // Ajustar según el objetivo
    let targetCalories: number
    switch (data.health_goal) {
      case 'weight_loss':
        targetCalories = tdee - 500 // Déficit de 500 calorías
        break
      case 'muscle_gain':
        targetCalories = tdee + 300 // Superávit de 300 calorías
        break
      case 'maintenance':
      case 'general_health':
      default:
        targetCalories = tdee
        break
    }

    return Math.round(targetCalories)
  }

  const handleActivityLevelChange = (value: string) => {
    onChange({ activity_level: value })
  }

  const handleHealthGoalChange = (value: string) => {
    onChange({ health_goal: value })
  }

  const handleCalorieTargetChange = (value: string) => {
    const calories = parseInt(value)
    setCalorieError('')
    
    // Siempre actualizar el estado, incluso si hay errores de validación
    onChange({ calorie_target: value ? calories : undefined })
    
    if (value && (isNaN(calories) || calories < 800 || calories > 5000)) {
      setCalorieError('Las calorías deben estar entre 800 y 5000')
    }
  }

  // Calcular calorías cuando cambien los datos
  useEffect(() => {
    const calories = calculateCalories()
    setCalculatedCalories(calories)
    
    if (calories && !data.calorie_target) {
      onChange({ calorie_target: calories })
    }
  }, [data.age, data.gender, data.height, data.weight, data.activity_level, data.health_goal])

  const isFormValid = () => {
    return !!(
      data.activity_level &&
      data.health_goal &&
      data.calorie_target &&
      data.calorie_target >= 800 &&
      data.calorie_target <= 5000
    )
  }

  const selectedActivityLevel = activityLevels.find(level => level.value === data.activity_level)
  const selectedHealthGoal = healthGoals.find(goal => goal.value === data.health_goal)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Objetivos de Salud</h2>
        <p className="text-gray-600">
          Define tus metas para crear un plan personalizado
        </p>
      </div>

      {/* Nivel de actividad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            Nivel de Actividad Física
          </CardTitle>
          <CardDescription>
            ¿Qué tan activo eres en tu día a día?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={data.activity_level || ''} onValueChange={handleActivityLevelChange}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecciona tu nivel de actividad" />
            </SelectTrigger>
            <SelectContent>
              {activityLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{level.label}</span>
                    <span className="text-sm text-gray-500">{level.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Objetivo de salud */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Objetivo Principal
          </CardTitle>
          <CardDescription>
            ¿Cuál es tu meta principal?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthGoals.map((goal) => (
              <button
                key={goal.value}
                onClick={() => handleHealthGoalChange(goal.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                  data.health_goal === goal.value
                    ? `${goal.bgColor} ${goal.borderColor} border-2`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <goal.icon className={`w-6 h-6 ${goal.color} mt-1`} />
                  <div>
                    <h3 className="font-medium text-gray-900">{goal.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Meta de calorías */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-orange-600" />
            Meta de Calorías Diarias
          </CardTitle>
          <CardDescription>
            Basado en tu información, hemos calculado una meta recomendada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {calculatedCalories && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-900">Recomendación calculada</span>
              </div>
              <p className="text-orange-800">
                Basado en tu perfil, te recomendamos <strong>{calculatedCalories} calorías</strong> por día.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="calorie_target">Calorías objetivo por día *</Label>
            <div className="relative">
              <Input
                id="calorie_target"
                type="number"
                value={data.calorie_target || ''}
                onChange={(e) => handleCalorieTargetChange(e.target.value)}
                placeholder={calculatedCalories?.toString() || "2000"}
                className="h-12"
                min="800"
                max="5000"
              />
              {data.calorie_target && !calorieError && data.calorie_target >= 800 && data.calorie_target <= 5000 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              )}
            </div>
            {calorieError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {calorieError}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Puedes ajustar este número según tus preferencias (800-5000 calorías)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      {isFormValid() && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Resumen de tus objetivos</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {selectedActivityLevel?.label}
                </Badge>
                <span className="text-sm text-green-700">{selectedActivityLevel?.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {selectedHealthGoal?.label}
                </Badge>
                <span className="text-sm text-green-700">{selectedHealthGoal?.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {data.calorie_target} calorías/día
                </Badge>
                <span className="text-sm text-green-700">Meta calórica diaria</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Consejos</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Sé honesto sobre tu nivel de actividad para obtener mejores resultados</li>
            <li>• Los objetivos realistas son más fáciles de mantener a largo plazo</li>
            <li>• Puedes ajustar tu meta calórica en cualquier momento</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

