"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Target, Calendar, ChefHat, BarChart3, Smartphone } from "lucide-react"
import type { OnboardingData } from "@/lib/services/onboarding-service"

interface WelcomeStepProps {
  data: Partial<OnboardingData>
  onChange: (data: Partial<OnboardingData>) => void
}

export function WelcomeStep({ data, onChange }: WelcomeStepProps) {
  const features = [
    {
      icon: Target,
      title: "Plan Personalizado",
      description: "Creamos un plan de comidas basado en tus objetivos y preferencias"
    },
    {
      icon: Calendar,
      title: "Planificación Semanal",
      description: "Organiza tus comidas de toda la semana de forma fácil"
    },
    {
      icon: ChefHat,
      title: "Recetas Saludables",
      description: "Accede a miles de recetas nutritivas y deliciosas"
    },
    {
      icon: BarChart3,
      title: "Seguimiento de Progreso",
      description: "Monitorea tu evolución hacia tus objetivos de salud"
    },
    {
      icon: Smartphone,
      title: "Acceso Móvil",
      description: "Lleva tu plan contigo en cualquier dispositivo"
    },
    {
      icon: Heart,
      title: "Salud Integral",
      description: "Enfoque completo en tu bienestar nutricional"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-10 h-10 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          ¡Bienvenido a NutriMate!
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tu asistente personal de nutrición que te ayudará a alcanzar tus objetivos de salud 
          con un plan de comidas personalizado y recetas deliciosas.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="text-center hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Process Overview */}
      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <CardHeader>
          <CardTitle className="text-orange-900">¿Cómo funciona?</CardTitle>
          <CardDescription className="text-orange-700">
            Te guiaremos paso a paso para crear tu plan personalizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                1
              </div>
              <p className="text-sm font-medium text-orange-900">Información Personal</p>
              <p className="text-xs text-orange-700">Nombre, email y usuario</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                2
              </div>
              <p className="text-sm font-medium text-orange-900">Métricas de Salud</p>
              <p className="text-xs text-orange-700">Edad, peso, altura</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                3
              </div>
              <p className="text-sm font-medium text-orange-900">Objetivos</p>
              <p className="text-xs text-orange-700">Metas y preferencias</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                4
              </div>
              <p className="text-sm font-medium text-orange-900">Crear Cuenta</p>
              <p className="text-xs text-orange-700">Guardar tu plan</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <p className="text-gray-600">
          ¿Listo para comenzar tu viaje hacia una vida más saludable?
        </p>
        <Badge variant="outline" className="text-orange-600 border-orange-200">
          Tiempo estimado: 3-5 minutos
        </Badge>
      </div>
    </div>
  )
}
