"use client"

import { useState } from "react"
import { Target, Plus, TrendingUp, CheckCircle, Circle, Edit3, Trash2 } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"

interface Goal {
  id: string
  title: string
  description: string
  category: string
  target: number
  current: number
  unit: string
  deadline: string
  completed: boolean
}

export default function MobileGoalsPage() {
  const { t } = useLanguage()
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Beber más agua",
      description: "Consumir al menos 2 litros de agua al día",
      category: "Hidratación",
      target: 30,
      current: 15,
      unit: "días",
      deadline: "2024-02-15",
      completed: false
    },
    {
      id: "2",
      title: "Comer 5 vegetales",
      description: "Incluir 5 porciones de vegetales en la dieta diaria",
      category: "Nutrición",
      target: 30,
      current: 30,
      unit: "días",
      deadline: "2024-01-31",
      completed: true
    },
    {
      id: "3",
      title: "Ejercicio semanal",
      description: "Realizar al menos 3 sesiones de ejercicio por semana",
      category: "Fitness",
      target: 12,
      current: 8,
      unit: "semanas",
      deadline: "2024-03-01",
      completed: false
    }
  ])

  const categories = ["Todas", "Nutrición", "Hidratación", "Fitness", "Sueño", "Otros"]
  const [selectedCategory, setSelectedCategory] = useState("Todas")

  const filteredGoals = goals.filter(goal => 
    selectedCategory === "Todas" || goal.category === selectedCategory
  )

  const completedGoals = goals.filter(goal => goal.completed).length
  const totalGoals = goals.length
  const progressPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0

  const toggleGoal = (id: string) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ))
  }

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id))
  }

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage >= 100) return "bg-green-500"
    if (percentage >= 75) return "bg-yellow-500"
    if (percentage >= 50) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mis Metas</h1>
            <p className="text-sm text-gray-500">
              {completedGoals} de {totalGoals} completadas
            </p>
          </div>
          <button className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Progreso general */}
        <div className="bg-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Progreso general</span>
            <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Categorías */}
        <div className="flex space-x-2 overflow-x-auto mt-4 pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de metas */}
      <div className="px-6 py-4">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin metas</h3>
            <p className="text-gray-500">Crea tu primera meta para comenzar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGoals.map((goal) => (
              <div
                key={goal.id}
                className={`bg-white rounded-xl p-4 shadow-sm transition-all ${
                  goal.completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => toggleGoal(goal.id)}
                    className={`mt-1 ${
                      goal.completed ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
                    } transition-colors`}
                  >
                    {goal.completed ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-medium ${
                        goal.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {goal.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Progreso</span>
                        <span className="font-medium text-gray-900">
                          {goal.current} / {goal.target} {goal.unit}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal.current, goal.target)}`}
                          style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded-full">
                          {goal.category}
                        </span>
                        <span>
                          Vence: {new Date(goal.deadline).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-4">Estadísticas</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{completedGoals}</p>
              <p className="text-sm text-gray-500">Completadas</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalGoals - completedGoals}</p>
              <p className="text-sm text-gray-500">En progreso</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
