"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedCard, MetricCard } from "./animated-card";
import { 
  WeightIcon, 
  WaterIcon, 
  CaloriesIcon,
  MoreIcon,
  StarIcon,
  WeightChart,
  WaterProgress,
  CaloriesChart,
  MacroChart,
  PlusIcon,
  ClockIcon
} from './icons-new';
import { useLanguage } from "@/lib/i18n/context";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { useUserProfile, useIsPremium } from "@/components/auth/user-profile-provider";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useActiveGoal } from "@/hooks/useActiveGoal";
import { Crown, Calendar, RefreshCw, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

interface DashboardFoodDiaryProps {
  onRefresh?: () => void;
}

export const DashboardFoodDiary = ({ onRefresh }: DashboardFoodDiaryProps) => {
  const { t } = useLanguage();
  const { user } = useAuthContext();
  const { userData } = useUserProfile();
  const isPremium = useIsPremium();
  const { activeGoal } = useActiveGoal();
  const { 
    todayEntries, 
    todayNutrition, 
    weekNutrition, 
    recentEntries, 
    loading, 
    error 
  } = useDashboardData();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const currentDate = new Date();
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const targetCalories = activeGoal?.targetKcalDay || 2000;
  const calorieProgress = Math.min((todayNutrition.calories / targetCalories) * 100, 100);
  const isOnTrack = calorieProgress >= 80 && calorieProgress <= 120;

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    // First day of the week (Monday = 1)
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push(dateStr);
    }
    
    return days;
  }, [currentMonth]);

  // Process food entries for calendar display
  const processFoodEntriesForCalendar = (entries: any[], startDate: Date, endDate: Date) => {
    const targetCalories = activeGoal?.targetKcalDay || 2000;
    const daysMap = new Map();
    
    // Initialize all days in the month
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().slice(0, 10);
      daysMap.set(dateStr, {
        date: dateStr,
        entries: [],
        totalCalories: 0,
        status: 'normal'
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Process entries
    entries.forEach(entry => {
      const dateStr = entry.date;
      if (daysMap.has(dateStr)) {
        const dayData = daysMap.get(dateStr);
        dayData.entries.push(entry);
        dayData.totalCalories += entry.calories || 0;
      }
    });
    
    // Calculate status for each day
    daysMap.forEach((dayData) => {
      if (dayData.entries.length === 0) {
        dayData.status = 'normal'; // No entries
      } else {
        const calorieRatio = dayData.totalCalories / targetCalories;
        if (calorieRatio <= 1.0) {
          dayData.status = 'positive'; // Green if within or under target
        } else {
          dayData.status = 'negative'; // Red if over target
        }
      }
    });
    
    return Array.from(daysMap.values());
  };

  // Get day status for calendar
  const getDayStatus = (dateStr: string) => {
    if (!recentEntries) return null;
    
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const processedDays = processFoodEntriesForCalendar(recentEntries, startDate, endDate);
    
    return processedDays.find(d => d.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando datos del día...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error al cargar los datos: {error}</p>
          <Button onClick={onRefresh} className="bg-orange-600 hover:bg-orange-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
      <div className="grid grid-cols-12 gap-6">
        
        {/* Top Stats Row */}
        <div className="col-span-3">
          <MetricCard
            title="Calorías Hoy"
            value={`${todayNutrition.calories.toFixed(0)} kcal`}
            subtitle=""
            icon={<CaloriesIcon className="w-4 h-4 text-orange-600" />}
            color="text-orange-600"
            chart={<div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>}
            delay={0.1}
          />
        </div>

        <div className="col-span-3">
          <MetricCard
            title="Proteína"
            value={`${todayNutrition.protein.toFixed(1)}g`}
            subtitle=""
            icon={<WeightIcon className="w-4 h-4 text-blue-600" />}
            color="text-blue-600"
            chart={<div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>}
            delay={0.2}
          />
        </div>

        <div className="col-span-3">
          <MetricCard
            title="Carbohidratos"
            value={`${todayNutrition.carbs.toFixed(1)}g`}
            subtitle=""
            icon={<div className="w-4 h-4 bg-green-600 rounded-full" />}
            color="text-green-600"
            chart={<div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>}
            delay={0.3}
          />
        </div>

        <div className="col-span-3">
          <MetricCard
            title="Grasas"
            value={`${todayNutrition.fats.toFixed(1)}g`}
            subtitle=""
            icon={<WaterIcon className="w-4 h-4 text-purple-600" />}
            color="text-purple-600"
            chart={<div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>}
            delay={0.4}
          />
        </div>

        {/* Mini Calendar */}
        <div className="col-span-3">
          <AnimatedCard delay={0.5}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((dateStr, index) => {
                  if (!dateStr) {
                    return <div key={index} className="h-6" />;
                  }
                  
                  const dayStatus = getDayStatus(dateStr);
                  const dayNumber = parseInt(dateStr.split('-')[2]);
                  const isToday = dateStr === new Date().toISOString().slice(0, 10);
                  
                  return (
                    <button
                      key={dateStr}
                      className={`
                        h-6 w-6 text-xs rounded transition-transform duration-100 ease-out hover:scale-110 flex items-center justify-center relative
                        ${dayStatus?.status === 'positive'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300' 
                          : dayStatus?.status === 'negative'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300'
                            : 'hover:bg-muted dark:hover:bg-gray-800'
                        }
                        ${isToday ? 'ring-2 ring-primary font-bold' : ''}
                      `}
                      title={dayStatus ? `${dayStatus.totalCalories} kcal` : 'Sin datos'}
                    >
                      {dayNumber}
                      {isToday && (
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-100 rounded-full"></div>
                    <span>Bien</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-100 rounded-full"></div>
                    <span>Regular</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-muted rounded-full"></div>
                    <span>Sin datos</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Today's Progress */}
        <div className="col-span-6">
          <AnimatedCard delay={0.6}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Progreso de Hoy</CardTitle>
                <Badge variant={isOnTrack ? "default" : "destructive"} className={isOnTrack ? "bg-green-100 text-green-800" : ""}>
                  {isOnTrack ? "✓ En camino" : "⚠ Necesita atención"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Calorie Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Calorías</span>
                    <span>{todayNutrition.calories.toFixed(0)} / {targetCalories}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isOnTrack ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-medium">{todayEntries.length}</div>
                    <div className="text-xs text-gray-500">Comidas registradas</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium">{todayNutrition.protein.toFixed(1)}g</div>
                    <div className="text-xs text-gray-500">Proteína</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium">{todayNutrition.carbs.toFixed(1)}g</div>
                    <div className="text-xs text-gray-500">Carbohidratos</div>
                  </div>
                </div>

                {/* Motivational Message */}
                <div className={`p-3 rounded-lg text-sm ${
                  isOnTrack 
                    ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                }`}>
                  {isOnTrack 
                    ? "¡Excelente! Estás manteniendo un balance nutricional saludable."
                    : "Registra más comidas para alcanzar tu objetivo diario."
                  }
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Recent Entries & Quick Actions */}
        <div className="col-span-3">
          <AnimatedCard delay={0.7}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Entradas Recientes</CardTitle>
                <Link href="/food-diary">
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentEntries.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm mb-3">No hay entradas recientes</p>
                  <div className="space-y-2">
                    <Link href="/food-diary">
                      <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Registrar Comida
                      </Button>
                    </Link>
                    <Link href="/calendar">
                      <Button variant="outline" size="sm" className="w-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        Ver Calendario
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEntries.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                        {entry.category === 'breakfast' ? '🍳' :
                         entry.category === 'lunch' ? '🍽️' :
                         entry.category === 'dinner' ? '🍽️' : '🍎'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {entry.menu || (entry.ingredients ? entry.ingredients.map(ing => ing.name).join(', ') : 'Sin nombre')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {entry.calories || 0} kcal • {entry.time}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                </div>
              )}
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Week Summary */}
        <div className="col-span-12">
          <AnimatedCard delay={0.8}>
            <CardHeader>
              <CardTitle>Resumen de la Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {weekNutrition.calories.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-500">Calorías promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {weekNutrition.protein.toFixed(0)}g
                  </div>
                  <div className="text-sm text-gray-500">Proteína total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {weekNutrition.carbs.toFixed(0)}g
                  </div>
                  <div className="text-sm text-gray-500">Carbohidratos total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {weekNutrition.fats.toFixed(0)}g
                  </div>
                  <div className="text-sm text-gray-500">Grasas total</div>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
};
