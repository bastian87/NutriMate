"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Award, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"

interface NutritionData {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
}

interface NutritionSummaryProps {
  data: NutritionData
  targets?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  title?: string
  period?: string
}

export function NutritionSummary({
  data,
  targets = { calories: 2000, protein: 150, carbs: 250, fat: 65 },
  title,
  period,
}: NutritionSummaryProps) {
  const { t } = useLanguage()

  const resolvedTitle = title || t("nutritionSummary.title")
  const resolvedPeriod = period || t("nutritionSummary.period")

  const calculatePercentage = (value: number, target: number) => {
    return Math.min(Math.round((value / target) * 100), 100)
  }

  const getStatusColor = (percentage: number) => {
    if (percentage < 50) return "text-red-500"
    if (percentage < 80) return "text-yellow-500"
    if (percentage <= 100) return "text-green-500"
    return "text-orange-500"
  }

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return "bg-red-500"
    if (percentage < 80) return "bg-yellow-500"
    if (percentage <= 100) return "bg-green-500"
    return "bg-orange-500"
  }

  const macros = [
    {
      name: "Calories",
      value: Number(data.calories?.toFixed(2)),
      target: targets.calories,
      unit: "kcal",
      icon: TrendingUp,
      color: "text-orange-600",
    },
    {
      name: "Protein",
      value: Number(data.protein?.toFixed(2)),
      target: targets.protein,
      unit: "g",
      icon: Target,
      color: "text-blue-600",
    },
    {
      name: "Carbs",
      value: Number(data.carbs?.toFixed(2)),
      target: targets.carbs,
      unit: "g",
      icon: Award,
      color: "text-green-600",
    },
    {
      name: "Fat",
      value: Number(data.fat?.toFixed(2)),
      target: targets.fat,
      unit: "g",
      icon: AlertCircle,
      color: "text-purple-600",
    },
  ]

  const totalCaloriesPercentage = calculatePercentage(data.calories, targets.calories)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="font-bold">{resolvedTitle}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">{resolvedPeriod}</p>
          </div>
          <Badge
            variant={totalCaloriesPercentage <= 100 ? "default" : "destructive"}
            className={
              totalCaloriesPercentage <= 100 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""
            }
          >
            {totalCaloriesPercentage}% of target
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Calorie Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="text-3xl font-bold mb-2">
            {Number(data.calories.toFixed(2))} <span className="text-lg text-gray-500">/ {targets.calories} kcal</span>
          </div>
          <Progress value={totalCaloriesPercentage} className="h-3 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {targets.calories - data.calories > 0
              ? `${Number((targets.calories - data.calories).toFixed(2))} calories remaining`
              : `${Number((data.calories - targets.calories).toFixed(2))} calories over target`}
          </p>
        </motion.div>

        {/* Macronutrient Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {macros.map((macro, index) => {
            const percentage = calculatePercentage(macro.value, macro.target)
            const Icon = macro.icon

            return (
              <motion.div
                key={macro.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <Icon className={`h-5 w-5 ${macro.color}`} />
                </div>
                <div className="text-lg font-bold mb-1">
                  {macro.value.toFixed(2)}
                  {macro.unit}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {t(`nutritionSummary.of`)} {macro.target}
                  {macro.unit}
                </div>
                <Progress value={percentage} className="h-2" />
                <div className={`text-xs mt-1 font-medium ${getStatusColor(percentage)}`}>{percentage}%</div>
              </motion.div>
            )
          })}
        </div>

        {/* Additional Nutrients (if available) */}
        {(data.fiber || data.sugar || data.sodium) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border-t pt-4"
          >
            <h4 className="font-semibold mb-3">Additional Nutrients</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              {data.fiber && (
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Fiber</div>
                  <div className="font-semibold">{Number(data.fiber.toFixed(2))}g</div>
                </div>
              )}
              {data.sugar && (
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Sugar</div>
                  <div className="font-semibold">{Number(data.sugar.toFixed(2))}g</div>
                </div>
              )}
              {data.sodium && (
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Sodium</div>
                  <div className="font-semibold">{Number(data.sodium.toFixed(2))}mg</div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Nutrition Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4"
        >
          <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">💡 Nutrition Insights</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            {(data.protein / data.calories) * 100 > 20 && (
              <li>• Great protein intake! This supports muscle maintenance and satiety.</li>
            )}
            {data.calories < targets.calories * 0.8 && (
              <li>• Consider adding a healthy snack to meet your calorie goals.</li>
            )}
            {(data.fat / data.calories) * 100 < 20 && (
              <li>• You might benefit from adding healthy fats like avocado or nuts.</li>
            )}
            {totalCaloriesPercentage >= 90 && totalCaloriesPercentage <= 110 && (
              <li>• Perfect! You're right on track with your calorie target.</li>
            )}
          </ul>
        </motion.div>
      </CardContent>
    </Card>
  )
}
