"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { useActiveGoal } from "@/hooks/useActiveGoal";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  MoreIcon,
  CaloriesIcon,
  WeightIcon,
  CheckIcon,
  XIcon
} from '@/components/icons-new';
import { motion } from "framer-motion";
import Link from "next/link";

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

interface CalendarDay {
  date: string;
  entries: FoodEntry[];
  totalCalories: number;
  status: 'positive' | 'negative' | 'normal'; // Verde, Rojo, Normal
}

interface Props {
  range: "week" | "month";
  from: string; // YYYY-MM-DD
}

export function CalendarView({ range, from }: Props) {
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    console.log('CalendarView - Initializing with date:', now);
    console.log('CalendarView - Month:', now.getMonth(), 'Year:', now.getFullYear());
    return now;
  });
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuthContext();
  const { activeGoal } = useActiveGoal();

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
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
  }, [currentDate]);

  useEffect(() => {
    if (!user?.id) return;
    
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Fetch food entries from Food Diary API
    fetch('/api/food-entries', {
      headers: { "x-user-id": user.id },
    })
      .then((r) => r.json())
      .then((data) => {
        const entries = data.entries || [];
        const processedDays = processFoodEntriesForCalendar(entries, startDate, endDate);
        setDays(processedDays);
      })
      .catch((error) => {
        console.error('Error fetching food entries:', error);
        setDays([]);
      });
  }, [currentDate, user?.id, refreshKey]);

  // Process food entries for calendar display
  const processFoodEntriesForCalendar = (entries: FoodEntry[], startDate: Date, endDate: Date) => {
    const targetCalories = activeGoal?.targetKcalDay || 2000;
    const daysMap = new Map<string, CalendarDay>();
    
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
        const dayData = daysMap.get(dateStr)!;
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

  const getDayStatus = (dateStr: string) => {
    return days.find(d => d.date === dateStr);
  };

  const refreshCalendar = () => {
    setRefreshKey(prev => prev + 1);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="hover:bg-orange-50 hover:border-orange-200"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        
        <div className="text-center">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          {/* Debug info - hidden on mobile */}
          <span className="hidden sm:inline text-xs text-gray-500 ml-2">
            (Mes: {currentDate.getMonth()}, Día: {currentDate.getDate()})
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="hover:bg-orange-50 hover:border-orange-200"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-2 sm:p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex flex-col items-center text-center">
              <h4 className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200 mb-2">Días Exitosos</h4>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center mb-2">
                <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg sm:text-2xl font-bold text-green-600">
                  {days.filter(d => d.status === 'positive').length}
                </span>
                <span className="text-xs sm:text-sm text-green-600">días</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-2 sm:p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <div className="flex flex-col items-center text-center">
              <h4 className="text-xs sm:text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">Calorías Objetivo</h4>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center mb-2">
                <CaloriesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg sm:text-2xl font-bold text-orange-600">
                  {activeGoal?.targetKcalDay || 2000}
                </span>
                <span className="text-xs sm:text-sm text-orange-600">kcal</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-2 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex flex-col items-center text-center">
              <h4 className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Progreso</h4>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mb-2">
                <WeightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg sm:text-2xl font-bold text-blue-600">
                  {Math.round((days.filter(d => d.status === 'positive').length / Math.max(days.length, 1)) * 100)}%
                </span>
                <span className="text-xs sm:text-sm text-blue-600">completado</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekDays.map((day) => (
          <div key={day} className="p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((dateStr, index) => {
          if (!dateStr) {
            return <div key={index} className="h-16 sm:h-20" />;
          }
          
          const dayStatus = getDayStatus(dateStr);
          const dayNumber = parseInt(dateStr.split('-')[2]);
          const isToday = dateStr === new Date().toISOString().slice(0, 10);
          
          return (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
            >
              <Card
                className={cn(
                  "h-16 sm:h-20 p-1 sm:p-2 cursor-pointer transition-all hover:shadow-lg hover:scale-105",
                  "flex flex-col items-center justify-center relative",
                  dayStatus?.status === 'positive'
                    ? "bg-pastel-green-100 border-pastel-green-300 hover:bg-pastel-green-200 dark:bg-green-900/30 dark:border-green-700" 
                    : dayStatus?.status === 'negative'
                      ? "bg-pastel-pink-100 border-pastel-pink-300 hover:bg-pastel-pink-200 dark:bg-red-900/30 dark:border-red-700"
                      : "bg-card border-border hover:bg-muted dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700",
                  isToday && "ring-2 ring-orange-400 shadow-lg"
                )}
                onClick={() => setSelectedDate(dateStr)}
              >
                <div className={cn(
                  "text-xs sm:text-sm font-semibold",
                  isToday && "text-primary font-bold",
                  dayStatus?.status === 'positive' && "text-pastel-green-700 dark:text-green-300",
                  dayStatus?.status === 'negative' && "text-pastel-pink-700 dark:text-red-300"
                )}>
                  {dayNumber}
                </div>
                {dayStatus && dayStatus.entries.length > 0 && (
                  <div className="mt-1">
                    {dayStatus.status === 'positive' ? (
                      <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    ) : (
                      <XIcon className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                    )}
                  </div>
                )}
                {dayStatus && dayStatus.entries.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {dayStatus.totalCalories} kcal
                  </div>
                )}
                {isToday && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Day Details Modal - View only */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  {new Date(selectedDate).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <div className="flex gap-2">
                  <Link href={`/food-diary?date=${selectedDate}`}>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Ver en Food Diary
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedDate("")}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
              
              {(() => {
                const dayStatus = getDayStatus(selectedDate);
                if (!dayStatus || dayStatus.entries.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-4">No hay comidas registradas para este día</p>
                      <Link href={`/food-diary?date=${selectedDate}`}>
                        <Button className="bg-green-600 hover:bg-green-700">
                          Registrar Comida
                        </Button>
                      </Link>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    {/* Day Summary */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <Card className="p-4 bg-gray-50">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-800">
                            {dayStatus.totalCalories}
                          </div>
                          <div className="text-sm text-gray-600">Calorías Totales</div>
                        </div>
                      </Card>
                      <Card className={cn(
                        "p-4",
                        dayStatus.status === 'positive' ? "bg-green-50" : 
                        dayStatus.status === 'negative' ? "bg-red-50" : "bg-gray-50"
                      )}>
                        <div className="text-center">
                          <div className={cn(
                            "text-2xl font-bold",
                            dayStatus.status === 'positive' ? "text-green-600" : 
                            dayStatus.status === 'negative' ? "text-red-600" : "text-gray-600"
                          )}>
                            {dayStatus.status === 'positive' ? '✓' : 
                             dayStatus.status === 'negative' ? '✗' : '○'}
                          </div>
                          <div className="text-sm text-gray-600">Estado del Día</div>
                        </div>
                      </Card>
                    </div>
                    
                    {/* Food Entries */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">Comidas Registradas</h4>
                      {dayStatus.entries.map((entry, index) => (
                        <Card key={entry.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">
                                  {entry.category === 'breakfast' ? '🍳 Desayuno' :
                                   entry.category === 'lunch' ? '🍽️ Almuerzo' :
                                   entry.category === 'dinner' ? '🍽️ Cena' : '🍎 Snack'}
                                </Badge>
                                <span className="text-sm text-gray-500">{entry.time}</span>
                              </div>
                              <div className="font-medium mb-1">
                                {entry.menu || (entry.ingredients ? entry.ingredients.map(ing => ing.name).join(', ') : 'Sin nombre')}
                              </div>
                              {entry.amount && (
                                <div className="text-sm text-gray-600 mb-2">
                                  Cantidad: {entry.amount}
                                </div>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>Calorías: {entry.calories || 0}</span>
                                {entry.carb && <span>Carbohidratos: {entry.carb}g</span>}
                                {entry.protein && <span>Proteínas: {entry.protein}g</span>}
                                {entry.fats && <span>Grasas: {entry.fats}g</span>}
                              </div>
                              {entry.thoughts && (
                                <div className="mt-2 text-sm text-gray-600">
                                  <span className="font-medium">Reflexión:</span> {entry.thoughts}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
