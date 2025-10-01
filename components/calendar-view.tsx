"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { DayDrawer } from "@/components/day-drawer";
import { useActiveGoal } from "@/hooks/useActiveGoal";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarDay {
  date: string;
  is_success: boolean;
}

interface Props {
  range: "week" | "month";
  from: string; // YYYY-MM-DD
}

export function CalendarView({ range, from }: Props) {
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date(from));
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
    
    fetch(`/api/calendar?range=month&from=${startDate.toISOString().slice(0, 10)}`, {
      headers: { "x-user-id": user.id },
    })
      .then((r) => r.json())
      .then((d) => setDays(d.days ?? []));
  }, [currentDate, user?.id, refreshKey]);

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
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dateStr, index) => {
          if (!dateStr) {
            return <div key={index} className="h-12" />;
          }
          
          const dayStatus = getDayStatus(dateStr);
          const dayNumber = parseInt(dateStr.split('-')[2]);
          const isToday = dateStr === new Date().toISOString().slice(0, 10);
          
          return (
            <Card
              key={dateStr}
              className={cn(
                "h-12 p-1 cursor-pointer transition-all hover:shadow-md",
                "flex flex-col items-center justify-center",
                dayStatus?.is_success 
                  ? "bg-green-100 border-green-400 hover:bg-green-200" 
                  : dayStatus 
                    ? "bg-red-100 border-red-400 hover:bg-red-200"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100",
                isToday && "ring-2 ring-blue-400"
              )}
              onClick={() => setSelectedDate(dateStr)}
            >
              <div className={cn(
                "text-sm font-medium",
                isToday && "text-blue-600 font-bold"
              )}>
                {dayNumber}
              </div>
              {dayStatus && (
                <div className="text-xs">
                  {dayStatus.is_success ? "✅" : "❌"}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Day Drawer - Rendered outside calendar grid */}
      {selectedDate && (
        <DayDrawer 
          date={selectedDate} 
          goalId={activeGoal?.id || ""} 
          targetKcal={activeGoal?.targetKcalDay}
          onClose={() => setSelectedDate("")}
          autoOpen={true}
          onSave={refreshCalendar}
        />
      )}
    </div>
  );
}
