"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Users } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"

interface MealPlan {
  id: string
  date: string
  meals: {
    breakfast: string | null
    lunch: string | null
    dinner: string | null
    snacks: string[]
  }
}

export default function MobileCalendarPage() {
  const { t } = useLanguage()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const [mealPlans] = useState<MealPlan[]>([
    {
      id: "1",
      date: "2024-01-15",
      meals: {
        breakfast: "Avena con frutas",
        lunch: "Ensalada de quinoa",
        dinner: "Salmón al horno",
        snacks: ["Yogurt griego", "Nueces"]
      }
    },
    {
      id: "2",
      date: "2024-01-16",
      meals: {
        breakfast: "Smoothie verde",
        lunch: "Wrap de pollo",
        dinner: "Pasta integral",
        snacks: ["Manzana", "Almendras"]
      }
    }
  ])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []
    
    // Días del mes anterior
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const getSelectedDateMealPlan = () => {
    const dateString = selectedDate.toISOString().split('T')[0]
    return mealPlans.find(plan => plan.date === dateString)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const days = getDaysInMonth(currentDate)
  const selectedMealPlan = getSelectedDateMealPlan()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Planificación</h1>
          <button className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Navegación del calendario */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Calendario */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            if (!day) return <div key={index} className="h-10" />
            
            const isSelected = selectedDate.getDate() === day && 
                              selectedDate.getMonth() === currentDate.getMonth() &&
                              selectedDate.getFullYear() === currentDate.getFullYear()
            
            const isToday = new Date().getDate() === day && 
                           new Date().getMonth() === currentDate.getMonth() &&
                           new Date().getFullYear() === currentDate.getFullYear()
            
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-green-600 text-white'
                    : isToday
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Detalles del día seleccionado */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <CalendarIcon className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
          </div>

          {selectedMealPlan ? (
            <div className="space-y-4">
              {/* Desayuno */}
              <div className="border-l-4 border-yellow-400 pl-4">
                <h4 className="font-medium text-gray-900 mb-2">Desayuno</h4>
                <p className="text-gray-600">{selectedMealPlan.meals.breakfast}</p>
              </div>

              {/* Almuerzo */}
              <div className="border-l-4 border-orange-400 pl-4">
                <h4 className="font-medium text-gray-900 mb-2">Almuerzo</h4>
                <p className="text-gray-600">{selectedMealPlan.meals.lunch}</p>
              </div>

              {/* Cena */}
              <div className="border-l-4 border-blue-400 pl-4">
                <h4 className="font-medium text-gray-900 mb-2">Cena</h4>
                <p className="text-gray-600">{selectedMealPlan.meals.dinner}</p>
              </div>

              {/* Snacks */}
              {selectedMealPlan.meals.snacks.length > 0 && (
                <div className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-medium text-gray-900 mb-2">Snacks</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMealPlan.meals.snacks.map((snack, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                      >
                        {snack}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sin planificación</h3>
              <p className="text-gray-500 mb-4">No hay comidas planificadas para este día</p>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Planificar comidas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
