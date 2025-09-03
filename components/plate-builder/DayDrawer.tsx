'use client';

/**
 * Day drawer component for plate builder
 */

import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import PlateBuilder from './PlateBuilder';
import FirstTimeCoachmark from './FirstTimeCoachmark';
import type { DayEntryItem } from '@/types/nutri';
import { Calendar, Target, Zap } from 'lucide-react';

/**
 * Day drawer props
 */
interface DayDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  goalId: string;
  targetKcal: number;
  existingItems?: DayEntryItem[];
}

/**
 * DayDrawer component
 */
export default function DayDrawer({ 
  isOpen, 
  onClose, 
  date, 
  goalId, 
  targetKcal,
  existingItems = []
}: DayDrawerProps) {
  const { toast } = useToast();
  const [showCoachmark, setShowCoachmark] = useState(false);

  /**
   * Handle save day
   */
  const handleSaveDay = async (items: DayEntryItem[]) => {
    try {
      const response = await fetch('/api/day-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          goal_id: goalId,
          items: items.map(item => ({
            ingredientId: item.ingredientId,
            quantityGrams: item.quantityGrams
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save day entry');
      }

      const result = await response.json();
      
      // Close drawer on successful save
      onClose();
      
      return result;
    } catch (error) {
      console.error('Error saving day entry:', error);
      throw error;
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Get day of week color
   */
  const getDayColor = (dateString: string): string => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    
    switch (dayOfWeek) {
      case 0: // Sunday
        return 'text-red-600';
      case 6: // Saturday
        return 'text-blue-600';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="h-[90vh]">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className={getDayColor(date)}>
                    {formatDate(date)}
                  </span>
                </DrawerTitle>
                <DrawerDescription>
                  Construye tu plato balanceado para este día
                </DrawerDescription>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Target className="w-4 h-4" />
                    <span>Objetivo: {targetKcal} kcal</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Zap className="w-4 h-4" />
                    <span>+50 XP por día exitoso</span>
                  </div>
                </div>
                
                <Button variant="outline" onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-hidden">
            <PlateBuilder
              date={date}
              goalId={goalId}
              targetKcal={targetKcal}
              onSave={handleSaveDay}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* First time coachmark */}
      <FirstTimeCoachmark />
    </>
  );
}
