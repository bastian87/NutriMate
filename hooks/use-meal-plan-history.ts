"use client"

import { useState, useEffect } from "react"
import type { MealPlan } from "./use-meal-plans"

interface MealPlanHistoryItem {
  id: string
  mealPlan: MealPlan
  createdAt: string
  name?: string
}

export function useMealPlanHistory() {
  const [history, setHistory] = useState<MealPlanHistoryItem[]>([])

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("nutrimate-meal-plan-history")
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("nutrimate-meal-plan-history", JSON.stringify(history))
  }, [history])

  const saveMealPlan = (mealPlan: MealPlan, name?: string) => {
    const historyItem: MealPlanHistoryItem = {
      id: `history-${Date.now()}`,
      mealPlan,
      createdAt: new Date().toISOString(),
      name: name || `Meal Plan ${new Date().toLocaleDateString()}`,
    }

    setHistory((prev) => [historyItem, ...prev.slice(0, 9)]) // Keep only last 10
  }

  const deleteMealPlan = (historyId: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== historyId))
  }

  const getMealPlan = (historyId: string) => {
    return history.find((item) => item.id === historyId)
  }

  return {
    history,
    saveMealPlan,
    deleteMealPlan,
    getMealPlan,
  }
}
