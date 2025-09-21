"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, User, Mail, AtSign, AlertCircle } from "lucide-react"
import type { OnboardingData } from "@/lib/services/onboarding-service"

interface PersonalInfoStepProps {
  data: Partial<OnboardingData>
  onChange: (data: Partial<OnboardingData>) => void
}

export function PersonalInfoStep({ data, onChange }: PersonalInfoStepProps) {
  const [usernameError, setUsernameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    return usernameRegex.test(username)
  }

  const handleFullNameChange = (value: string) => {
    onChange({ full_name: value })
  }

  const handleUsernameChange = (value: string) => {
    setUsernameError('')
    
    if (value && !validateUsername(value)) {
      setUsernameError('El usuario debe tener entre 3-20 caracteres y solo letras, números y guiones bajos')
      return
    }
    
    onChange({ username: value })
  }

  const handleEmailChange = (value: string) => {
    setEmailError('')
    
    if (value && !validateEmail(value)) {
      setEmailError('Por favor ingresa un email válido')
      return
    }
    
    onChange({ email: value })
  }

  const checkUsernameAvailability = async (username: string) => {
    if (!username || !validateUsername(username)) return
    
    setIsCheckingUsername(true)
    try {
      // Aquí podrías hacer una llamada a la API para verificar disponibilidad
      // Por ahora simulamos una verificación
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulamos que algunos usuarios ya existen
      const takenUsernames = ['admin', 'test', 'user', 'demo']
      if (takenUsernames.includes(username.toLowerCase())) {
        setUsernameError('Este nombre de usuario ya está en uso')
      }
    } catch (error) {
      console.error('Error checking username:', error)
    } finally {
      setIsCheckingUsername(false)
    }
  }

  const isFormValid = () => {
    return !!(
      data.full_name && 
      data.full_name.length >= 2 &&
      data.username && 
      validateUsername(data.username) &&
      !usernameError &&
      data.email && 
      validateEmail(data.email) &&
      !emailError
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Información Personal</h2>
        <p className="text-gray-600">
          Cuéntanos sobre ti para personalizar tu experiencia
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-orange-600" />
            Datos Básicos
          </CardTitle>
          <CardDescription>
            Esta información nos ayuda a crear tu perfil personalizado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nombre completo */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre completo *</Label>
            <Input
              id="full_name"
              type="text"
              value={data.full_name || ''}
              onChange={(e) => handleFullNameChange(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="h-12"
            />
            {data.full_name && data.full_name.length < 2 && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                El nombre debe tener al menos 2 caracteres
              </p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de usuario *</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <AtSign className="w-4 h-4" />
              </div>
              <Input
                id="username"
                type="text"
                value={data.username || ''}
                onChange={(e) => handleUsernameChange(e.target.value)}
                onBlur={() => data.username && checkUsernameAvailability(data.username)}
                placeholder="juanperez"
                className="h-12 pl-10"
              />
              {isCheckingUsername && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600" />
                </div>
              )}
              {data.username && !isCheckingUsername && !usernameError && validateUsername(data.username) && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              )}
            </div>
            {usernameError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {usernameError}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Solo letras, números y guiones bajos. Entre 3-20 caracteres.
            </p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico *</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <Input
                id="email"
                type="email"
                value={data.email || ''}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="juan@ejemplo.com"
                className="h-12 pl-10"
              />
              {data.email && !emailError && validateEmail(data.email) && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              )}
            </div>
            {emailError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {emailError}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Usaremos este email para crear tu cuenta y enviarte actualizaciones.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {isFormValid() && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Vista previa de tu perfil</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {data.full_name}
                </Badge>
                <span className="text-sm text-green-700">@{data.username}</span>
              </div>
              <p className="text-sm text-green-700">{data.email}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Consejos</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Usa tu nombre real para una experiencia más personalizada</li>
            <li>• El nombre de usuario será visible para otros usuarios</li>
            <li>• Puedes cambiar esta información más tarde en tu perfil</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

