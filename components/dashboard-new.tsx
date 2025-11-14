"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AnimatedCard, MetricCard } from "./animated-card"
import { 
  WeightIcon, 
  StepsIcon, 
  WaterIcon, 
  CaloriesIcon,
  RunningIcon,
  StretchingIcon,
  WeightliftingIcon,
  WalkingIcon,
  SquatsIcon,
  MoreIcon,
  StarIcon,
  WeightChart,
  StepsChart,
  WaterProgress,
  CaloriesChart,
  MacroChart
} from './icons-new'
import { useLanguage } from "@/lib/i18n/context"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { useUserProfile, useIsPremium } from "@/components/auth/user-profile-provider"
import { Crown, RefreshCw } from "lucide-react"
import Link from "next/link"

interface DashboardNewProps {
  todaysNutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

export const DashboardNew = ({ 
  todaysNutrition
}: DashboardNewProps) => {
  const { t } = useLanguage()
  const { user } = useAuthContext()
  const { userData } = useUserProfile()
  const isPremium = useIsPremium()



  return (
    <div className="flex-1 p-6 bg-background">
      <div className="grid grid-cols-12 gap-6">
        
        {/* Top Stats Row */}
        <div className="col-span-3">
          <MetricCard
            title={t("recipes.calories")}
            value={`${todaysNutrition.calories.toFixed(0)} kcal`}
            subtitle={t("dashboard.calorieTarget", { target: 2000 })}
            icon={<CaloriesIcon className="w-4 h-4 text-primary" />}
            color="text-primary"
            chart={<CaloriesChart />}
            delay={0.1}
          />
        </div>

        <div className="col-span-3">
          <MetricCard
            title={t("recipes.protein")}
            value={`${todaysNutrition.protein.toFixed(1)}g`}
            subtitle={t("dashboard.proteinTarget", { target: 150 })}
            icon={<WeightIcon className="w-4 h-4 text-pastel-blue-500" />}
            color="text-pastel-blue-500"
            chart={<WeightChart />}
            delay={0.2}
          />
        </div>

        <div className="col-span-3">
          <MetricCard
            title={t("recipes.carbs")}
            value={`${todaysNutrition.carbs.toFixed(1)}g`}
            subtitle={t("dashboard.carbsTarget", { target: 250 })}
            icon={<div className="w-4 h-4 bg-pastel-green-500 rounded-full" />}
            color="text-pastel-green-500"
            delay={0.3}
          />
        </div>

        <div className="col-span-3">
          <MetricCard
            title={t("recipes.fat")}
            value={`${todaysNutrition.fat.toFixed(1)}g`}
            subtitle={t("dashboard.fatTarget", { target: 65 })}
            icon={<WaterIcon className="w-4 h-4 text-purple-500" />}
            color="text-purple-500"
            chart={<WaterProgress percentage={Math.min((todaysNutrition.fat / 65) * 100, 100)} />}
            delay={0.4}
          />
        </div>


        {/* Nutrition Progress Card */}
        <div className="col-span-6">
          <AnimatedCard delay={0.6}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Progreso Nutricional</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreIcon className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <CaloriesChart />
                <div className="flex-1">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    ¡Excelente progreso! Estás manteniendo un balance nutricional saludable. 
                    Continúa así para alcanzar tus objetivos.
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-lg font-medium">{todaysNutrition.calories.toFixed(0)}</div>
                      <div className="text-xs text-gray-500">Calorías hoy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium">{todaysNutrition.protein.toFixed(1)}g</div>
                      <div className="text-xs text-gray-500">Proteína</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium">{todaysNutrition.carbs.toFixed(1)}g</div>
                      <div className="text-xs text-gray-500">Carbohidratos</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Macro Distribution Card */}
        <div className="col-span-3">
          <AnimatedCard delay={0.7}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Distribución de Macros</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreIcon className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <CaloriesChart />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Carbohidratos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CaloriesIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{todaysNutrition.carbs.toFixed(1)}g</span>
                  </div>
                </div>
                <MacroChart />
              </div>
            </CardContent>
          </AnimatedCard>
        </div>


        {/* Workout Progress */}
        <div className="col-span-6">
          <AnimatedCard delay={0.9}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Actividad Física</CardTitle>
                <span className="text-sm text-gray-500">Esta Semana</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <RunningIcon className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="text-sm font-medium">Caminata 30 min</div>
                      <div className="text-xs text-gray-500">75% completado</div>
                    </div>
                  </div>
                  <Badge className="bg-green-500 text-white">Cardio</Badge>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <SquatsIcon className="w-6 h-6 text-orange-600" />
                    <div>
                      <div className="text-sm font-medium">Sentadillas 3x15</div>
                      <div className="text-xs text-gray-500">60% completado</div>
                    </div>
                  </div>
                  <Badge className="bg-orange-500 text-white">Fuerza</Badge>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <StretchingIcon className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium">Estiramientos 15 min</div>
                      <div className="text-xs text-gray-500">40% completado</div>
                    </div>
                  </div>
                  <Badge className="bg-blue-500 text-white">Flexibilidad</Badge>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Recommended Exercises */}
        <div className="col-span-3">
          <AnimatedCard delay={1.0}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ejercicios Recomendados</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreIcon className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <WalkingIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Caminata Rápida</h4>
                  <p className="text-xs text-gray-500">5 km/h • 30 min</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Principiante</Badge>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                  <SquatsIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Sentadillas Corporales</h4>
                  <p className="text-xs text-gray-500">15 reps • 20 min</p>
                </div>
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">Intermedio</Badge>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <WeightliftingIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Flexiones</h4>
                  <p className="text-xs text-gray-500">10 reps • 15 min</p>
                </div>
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Avanzado</Badge>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Recent Activity */}
        <div className="col-span-3">
          <AnimatedCard delay={1.1}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Actividad Reciente</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreIcon className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-green-600 font-medium">✓</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium">Registro de comida completado</h4>
                  <p className="text-xs text-gray-500">Has alcanzado el 85% de tu objetivo calórico diario</p>
                  <span className="text-xs text-gray-400">2h ago</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-orange-600 font-medium">🏃</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium">Sesión de ejercicio completada</h4>
                  <p className="text-xs text-gray-500">Caminata de 30 minutos registrada</p>
                  <span className="text-xs text-gray-400">4h ago</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-blue-600 font-medium">📊</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium">Progreso nutricional actualizado</h4>
                  <p className="text-xs text-gray-500">Nuevos datos de macronutrientes disponibles</p>
                  <span className="text-xs text-gray-400">1d ago</span>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

      </div>
    </div>
  )
}
