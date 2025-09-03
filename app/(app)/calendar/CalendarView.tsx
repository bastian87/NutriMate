'use client';

/**
 * Calendar view component for nutrition tracking
 */

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, X, Circle } from 'lucide-react';

/**
 * Calendar day entry type
 */
interface CalendarDayEntry {
  date: string;
  total_kcal: number;
  target_kcal: number;
  is_success: boolean | null; // null means no entry
  has_entry: boolean;
}

/**
 * Calendar data response type
 */
interface CalendarData {
  range: 'week' | 'month';
  from: string;
  days: CalendarDayEntry[];
}

/**
 * Calendar view component
 */
export default function CalendarView() {
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch calendar data for the current range and date
   */
  const fetchCalendarData = async (range: 'week' | 'month', fromDate: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/calendar?range=${range}&from=${fromDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
      }
      const data = await response.json();
      setCalendarData(data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (value: string) => {
    const tabValue = value as 'week' | 'month';
    setActiveTab(tabValue);
    const fromDate = currentDate.toISOString().split('T')[0];
    fetchCalendarData(tabValue, fromDate);
  };

  /**
   * Handle date navigation
   */
  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (activeTab === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
    const fromDate = newDate.toISOString().split('T')[0];
    fetchCalendarData(activeTab, fromDate);
  };

  /**
   * Handle day click
   */
  const handleDayClick = (day: CalendarDayEntry) => {
    // TODO: Open DayDrawer with the selected day
    console.log('Day clicked:', day);
  };

  /**
   * Get progress percentage for kcal bar
   */
  const getProgressPercentage = (total: number, target: number): number => {
    return Math.min((total / target) * 100, 100);
  };

  /**
   * Get success icon for a day
   */
  const getSuccessIcon = (day: CalendarDayEntry) => {
    if (!day.has_entry) {
      return <Circle className="w-4 h-4 text-gray-400" />;
    }
    if (day.is_success) {
      return <Check className="w-4 h-4 text-green-500" />;
    }
    return <X className="w-4 h-4 text-red-500" />;
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'short'
    });
  };

  /**
   * Get week/month title
   */
  const getTitle = (): string => {
    if (activeTab === 'week') {
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      endDate.setDate(startDate.getDate() + 6);
      
      return `${startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
    } else {
      return currentDate.toLocaleDateString('es-ES', { 
        month: 'long',
        year: 'numeric'
      });
    }
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    const fromDate = currentDate.toISOString().split('T')[0];
    fetchCalendarData(activeTab, fromDate);
  }, [activeTab, currentDate]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Calendario de Nutrición</h1>
        <p className="text-gray-600">Rastrea tu progreso diario y semanal</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="week">Semanal</TabsTrigger>
          <TabsTrigger value="month">Mensual</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{getTitle()}</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateNavigation('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateNavigation('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {calendarData?.days.map((day, index) => (
                    <div
                      key={day.date}
                      className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleDayClick(day)}
                    >
                      <div className="text-center">
                        <div className="text-sm font-medium mb-2">
                          {formatDate(day.date)}
                        </div>
                        
                        <div className="flex justify-center mb-2">
                          {getSuccessIcon(day)}
                        </div>
                        
                        {day.has_entry && (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-600">
                              {day.total_kcal}/{day.target_kcal} kcal
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  day.is_success ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                style={{
                                  width: `${getProgressPercentage(day.total_kcal, day.target_kcal)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="month" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{getTitle()}</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateNavigation('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateNavigation('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {calendarData?.days.map((day, index) => (
                    <div
                      key={day.date}
                      className="border rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleDayClick(day)}
                    >
                      <div className="text-center">
                        <div className="text-xs font-medium mb-1">
                          {formatDate(day.date)}
                        </div>
                        
                        <div className="flex justify-center mb-1">
                          {getSuccessIcon(day)}
                        </div>
                        
                        {day.has_entry && (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-600">
                              {day.total_kcal}/{day.target_kcal}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className={`h-1 rounded-full ${
                                  day.is_success ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                style={{
                                  width: `${getProgressPercentage(day.total_kcal, day.target_kcal)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
