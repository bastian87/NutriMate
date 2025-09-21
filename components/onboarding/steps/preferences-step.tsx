"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, X, Target, Clock, ChefHat, AlertTriangle } from "lucide-react"
import type { OnboardingData } from "@/lib/services/onboarding-service"

interface PreferencesStepProps {
  data: Partial<OnboardingData>
  onChange: (data: Partial<OnboardingData>) => void
}

export function PreferencesStep({ data, onChange }: PreferencesStepProps) {
  const [excludedIngredient, setExcludedIngredient] = useState('')
  const [allergy, setAllergy] = useState('')
  const [intolerance, setIntolerance] = useState('')

  const dietTypes = [
    'No Restrictions',
    'Vegetarian',
    'Vegan',
    'Pescatarian',
    'Keto',
    'Paleo',
    'Mediterranean',
    'Low Carb',
    'Low Fat',
    'Gluten Free'
  ]

  const macroPriorities = [
    { value: 'balanced', label: 'Equilibrado', description: 'Proteínas, carbohidratos y grasas balanceados' },
    { value: 'protein', label: 'Alto en proteínas', description: 'Enfoque en proteínas para ganancia muscular' },
    { value: 'carbs', label: 'Alto en carbohidratos', description: 'Ideal para atletas de resistencia' },
    { value: 'fat', label: 'Alto en grasas', description: 'Dieta cetogénica o similar' }
  ]

  const toggleDietaryPreference = (preference: string) => {
    const current = data.dietary_preferences || []
    const updated = current.includes(preference)
      ? current.filter(p => p !== preference)
      : [...current, preference]
    onChange({ dietary_preferences: updated })
  }

  const addExcludedIngredient = () => {
    if (excludedIngredient.trim()) {
      const current = data.excluded_ingredients || []
      if (!current.includes(excludedIngredient.trim())) {
        onChange({ excluded_ingredients: [...current, excludedIngredient.trim()] })
      }
      setExcludedIngredient('')
    }
  }

  const removeExcludedIngredient = (ingredient: string) => {
    const current = data.excluded_ingredients || []
    onChange({ excluded_ingredients: current.filter(i => i !== ingredient) })
  }

  const addAllergy = () => {
    if (allergy.trim()) {
      const current = data.allergies || []
      if (!current.includes(allergy.trim())) {
        onChange({ allergies: [...current, allergy.trim()] })
      }
      setAllergy('')
    }
  }

  const removeAllergy = (allergyItem: string) => {
    const current = data.allergies || []
    onChange({ allergies: current.filter(a => a !== allergyItem) })
  }

  const addIntolerance = () => {
    if (intolerance.trim()) {
      const current = data.intolerances || []
      if (!current.includes(intolerance.trim())) {
        onChange({ intolerances: [...current, intolerance.trim()] })
      }
      setIntolerance('')
    }
  }

  const removeIntolerance = (intoleranceItem: string) => {
    const current = data.intolerances || []
    onChange({ intolerances: current.filter(i => i !== intoleranceItem) })
  }

  const handleIncludeSnacksChange = (checked: boolean) => {
    onChange({ include_snacks: checked })
  }

  const handleMaxPrepTimeChange = (value: string) => {
    onChange({ max_prep_time: parseInt(value) })
  }

  const handleMacroPriorityChange = (value: string) => {
    onChange({ macro_priority: value })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Preferencias Dietarias</h2>
        <p className="text-gray-600">
          Personaliza tu plan según tus gustos y restricciones (opcional)
        </p>
      </div>

      {/* Preferencias dietarias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Tipos de Dieta
          </CardTitle>
          <CardDescription>
            Selecciona los tipos de dieta que te interesan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dietTypes.map((diet) => (
              <div key={diet} className="flex items-center space-x-2">
                <Checkbox
                  id={`diet-${diet}`}
                  checked={data.dietary_preferences?.includes(diet) || false}
                  onCheckedChange={() => toggleDietaryPreference(diet)}
                />
                <Label htmlFor={`diet-${diet}`} className="text-sm font-normal cursor-pointer">
                  {diet}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ingredientes excluidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Ingredientes a Evitar
          </CardTitle>
          <CardDescription>
            Ingredientes que no quieres en tus recetas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={excludedIngredient}
              onChange={(e) => setExcludedIngredient(e.target.value)}
              placeholder="Ej: cebolla, ajo, chile"
              onKeyPress={(e) => e.key === 'Enter' && addExcludedIngredient()}
            />
            <Button onClick={addExcludedIngredient} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {data.excluded_ingredients && data.excluded_ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.excluded_ingredients.map((ingredient, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {ingredient}
                  <button
                    onClick={() => removeExcludedIngredient(ingredient)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alergias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Alergias Alimentarias
          </CardTitle>
          <CardDescription>
            Alergias que debemos considerar para tu seguridad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={allergy}
              onChange={(e) => setAllergy(e.target.value)}
              placeholder="Ej: nueces, mariscos, huevos"
              onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
            />
            <Button onClick={addAllergy} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {data.allergies && data.allergies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.allergies.map((allergyItem, index) => (
                <Badge key={index} variant="destructive" className="flex items-center gap-1">
                  {allergyItem}
                  <button
                    onClick={() => removeAllergy(allergyItem)}
                    className="ml-1 hover:text-red-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Intolerancias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Intolerancias Alimentarias
          </CardTitle>
          <CardDescription>
            Intolerancias que pueden causar molestias digestivas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={intolerance}
              onChange={(e) => setIntolerance(e.target.value)}
              placeholder="Ej: lactosa, gluten, fructosa"
              onKeyPress={(e) => e.key === 'Enter' && addIntolerance()}
            />
            <Button onClick={addIntolerance} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {data.intolerances && data.intolerances.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.intolerances.map((intoleranceItem, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {intoleranceItem}
                  <button
                    onClick={() => removeIntolerance(intoleranceItem)}
                    className="ml-1 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferencias de cocina */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-600" />
              Preferencias de Cocina
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include_snacks"
                checked={data.include_snacks || false}
                onCheckedChange={handleIncludeSnacksChange}
              />
              <Label htmlFor="include_snacks" className="text-sm font-normal cursor-pointer">
                Incluir snacks en mi plan
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Tiempo de Preparación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max_prep_time">Tiempo máximo de preparación (minutos)</Label>
              <Select 
                value={data.max_prep_time?.toString() || '60'} 
                onValueChange={handleMaxPrepTimeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                  <SelectItem value="90">90 minutos</SelectItem>
                  <SelectItem value="120">120 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prioridad de macronutrientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Prioridad de Macronutrientes
          </CardTitle>
          <CardDescription>
            ¿En qué macronutriente quieres enfocar tu dieta?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {macroPriorities.map((priority) => (
              <button
                key={priority.value}
                onClick={() => handleMacroPriorityChange(priority.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                  data.macro_priority === priority.value
                    ? 'bg-orange-50 border-orange-200 border-2'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-medium text-gray-900">{priority.label}</h3>
                <p className="text-sm text-gray-600 mt-1">{priority.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      {(data.dietary_preferences?.length || data.excluded_ingredients?.length || data.allergies?.length || data.intolerances?.length) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-4">Resumen de tus preferencias</h3>
            <div className="space-y-3">
              {data.dietary_preferences && data.dietary_preferences.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-blue-800">Tipos de dieta:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.dietary_preferences.map((pref, index) => (
                      <Badge key={index} variant="outline" className="text-blue-700 border-blue-300">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {data.excluded_ingredients && data.excluded_ingredients.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-blue-800">Ingredientes a evitar:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.excluded_ingredients.map((ingredient, index) => (
                      <Badge key={index} variant="outline" className="text-blue-700 border-blue-300">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {data.allergies && data.allergies.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-blue-800">Alergias:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {data.intolerances && data.intolerances.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-blue-800">Intolerancias:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.intolerances.map((intolerance, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {intolerance}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
