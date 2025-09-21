"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Ruler, Weight, Calendar, User, AlertCircle, Check } from "lucide-react"
import type { OnboardingData } from "@/lib/services/onboarding-service"

interface HealthMetricsStepProps {
  data: Partial<OnboardingData>
  onChange: (data: Partial<OnboardingData>) => void
}

export function HealthMetricsStep({ data, onChange }: HealthMetricsStepProps) {
  const [ageError, setAgeError] = useState('')
  const [heightError, setHeightError] = useState('')
  const [weightError, setWeightError] = useState('')

  const validateAge = (age: number) => {
    return age >= 13 && age <= 120
  }

  const validateHeight = (height: number) => {
    return height >= 100 && height <= 250
  }

  const validateWeight = (weight: number) => {
    return weight >= 30 && weight <= 300
  }

  const handleAgeChange = (value: string) => {
    const age = parseInt(value)
    setAgeError('')
    
    // Siempre actualizar el estado, incluso si hay errores de validación
    onChange({ age: value ? age : undefined })
    
    if (value && (isNaN(age) || !validateAge(age))) {
      setAgeError('La edad debe estar entre 13 y 120 años')
    }
  }

  const handleHeightChange = (value: string) => {
    const height = parseInt(value)
    setHeightError('')
    
    // Siempre actualizar el estado, incluso si hay errores de validación
    onChange({ height: value ? height : undefined })
    
    if (value && (isNaN(height) || !validateHeight(height))) {
      setHeightError('La altura debe estar entre 100 y 250 cm')
    }
  }

  const handleWeightChange = (value: string) => {
    const weight = parseInt(value)
    setWeightError('')
    
    // Siempre actualizar el estado, incluso si hay errores de validación
    onChange({ weight: value ? weight : undefined })
    
    if (value && (isNaN(weight) || !validateWeight(weight))) {
      setWeightError('El peso debe estar entre 30 y 300 kg')
    }
  }

  const handleGenderChange = (value: string) => {
    onChange({ gender: value })
  }

  const calculateBMI = () => {
    if (data.height && data.weight) {
      const heightInMeters = data.height / 100
      const bmi = data.weight / (heightInMeters * heightInMeters)
      return Math.round(bmi * 10) / 10
    }
    return null
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Bajo peso', color: 'bg-blue-100 text-blue-800' }
    if (bmi < 25) return { category: 'Peso normal', color: 'bg-green-100 text-green-800' }
    if (bmi < 30) return { category: 'Sobrepeso', color: 'bg-yellow-100 text-yellow-800' }
    return { category: 'Obesidad', color: 'bg-red-100 text-red-800' }
  }

  const bmi = calculateBMI()
  const bmiCategory = bmi ? getBMICategory(bmi) : null

  const isFormValid = () => {
    return !!(
      data.age && 
      validateAge(data.age) &&
      data.gender &&
      data.height && 
      validateHeight(data.height) &&
      data.weight && 
      validateWeight(data.weight)
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Métricas de Salud</h2>
        <p className="text-gray-600">
          Necesitamos esta información para calcular tus necesidades nutricionales
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              Información Básica
            </CardTitle>
            <CardDescription>
              Datos necesarios para personalizar tu plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Edad */}
            <div className="space-y-2">
              <Label htmlFor="age">Edad *</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <Input
                  id="age"
                  type="number"
                  value={data.age || ''}
                  onChange={(e) => handleAgeChange(e.target.value)}
                  placeholder="25"
                  className="h-12 pl-10"
                  min="13"
                  max="120"
                />
                {data.age && !ageError && validateAge(data.age) && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </div>
              {ageError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {ageError}
                </p>
              )}
            </div>

            {/* Género */}
            <div className="space-y-2">
              <Label htmlFor="gender">Género *</Label>
              <Select value={data.gender || ''} onValueChange={handleGenderChange}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona tu género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Femenino</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Medidas corporales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-orange-600" />
              Medidas Corporales
            </CardTitle>
            <CardDescription>
              Altura y peso para calcular tu IMC
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Altura */}
            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm) *</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Ruler className="w-4 h-4" />
                </div>
                <Input
                  id="height"
                  type="number"
                  value={data.height || ''}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  placeholder="170"
                  className="h-12 pl-10"
                  min="100"
                  max="250"
                />
                {data.height && !heightError && validateHeight(data.height) && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </div>
              {heightError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {heightError}
                </p>
              )}
            </div>

            {/* Peso */}
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg) *</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Weight className="w-4 h-4" />
                </div>
                <Input
                  id="weight"
                  type="number"
                  value={data.weight || ''}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  placeholder="70"
                  className="h-12 pl-10"
                  min="30"
                  max="300"
                />
                {data.weight && !weightError && validateWeight(data.weight) && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </div>
              {weightError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {weightError}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BMI Calculation */}
      {bmi && bmiCategory && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-gray-900">Tu Índice de Masa Corporal (IMC)</h3>
              <div className="flex items-center justify-center gap-4">
                <div className="text-3xl font-bold text-gray-900">{bmi}</div>
                <Badge className={`${bmiCategory.color} text-sm px-3 py-1`}>
                  {bmiCategory.category}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Basado en tu altura de {data.height} cm y peso de {data.weight} kg
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Note */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-gray-900 mb-2">🔒 Privacidad</h3>
          <p className="text-sm text-gray-600">
            Esta información es completamente privada y solo se usa para calcular tus necesidades nutricionales. 
            No se comparte con terceros.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

