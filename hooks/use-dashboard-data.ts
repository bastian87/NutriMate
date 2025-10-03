"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { useActiveGoal } from "@/hooks/useActiveGoal";

interface FoodEntry {
  id: string;
  date: string;
  time: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  menu?: string;
  amount?: string;
  carb?: number;
  protein?: number;
  fats?: number;
  sugar?: number;
  calories?: number;
  ingredients?: {
    name: string;
    quantity: number;
    unit: string;
    calories: number;
  }[];
  thoughts: string;
  image_url?: string;
  entry_mode: 'dish' | 'ingredients';
}

interface DashboardData {
  todayEntries: FoodEntry[];
  todayNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    sugar: number;
  };
  weekEntries: FoodEntry[];
  weekNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    sugar: number;
  };
  recentEntries: FoodEntry[];
  loading: boolean;
  error: string | null;
}

export function useDashboardData() {
  const { user } = useAuthContext();
  const { activeGoal } = useActiveGoal();
  const [data, setData] = useState<DashboardData>({
    todayEntries: [],
    todayNutrition: { calories: 0, protein: 0, carbs: 0, fats: 0, sugar: 0 },
    weekEntries: [],
    weekNutrition: { calories: 0, protein: 0, carbs: 0, fats: 0, sugar: 0 },
    recentEntries: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!user?.id) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Fetch food entries with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch('/api/food-entries', {
          headers: { 'x-user-id': user.id },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error('Failed to fetch food entries');
        }

        const result = await response.json();
        const entries: FoodEntry[] = result.entries || [];

        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        
        // Get start of week (Monday)
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

        // Filter entries
        const todayEntries = entries.filter(entry => entry.date === today);
        const weekEntries = entries.filter(entry => entry.date >= startOfWeekStr);
        const recentEntries = entries.slice(0, 5); // Last 5 entries

        // Calculate nutrition totals
        const calculateNutrition = (entries: FoodEntry[]) => {
          return entries.reduce((acc, entry) => ({
            calories: acc.calories + (entry.calories || 0),
            protein: acc.protein + (entry.protein || 0),
            carbs: acc.carbs + (entry.carb || 0),
            fats: acc.fats + (entry.fats || 0),
            sugar: acc.sugar + (entry.sugar || 0)
          }), { calories: 0, protein: 0, carbs: 0, fats: 0, sugar: 0 });
        };

        const todayNutrition = calculateNutrition(todayEntries);
        const weekNutrition = calculateNutrition(weekEntries);

        setData({
          todayEntries,
          todayNutrition,
          weekEntries,
          weekNutrition,
          recentEntries,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  return data;
}
