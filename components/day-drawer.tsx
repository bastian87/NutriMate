"use client";

import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import PlateBuilder from "./plate-builder/PlateBuilder";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useActiveGoal } from "@/hooks/useActiveGoal";
import type { DayEntryItem } from "@/types/nutri";

interface Props {
  date: string;
  goalId: string;
  onClose?: () => void;
  autoOpen?: boolean;
  onSave?: () => void;
}

export function DayDrawer({ date, goalId, onClose, autoOpen = false, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { activeGoal } = useActiveGoal();

  // Auto-open drawer when autoOpen is true (from calendar click)
  useEffect(() => {
    if (autoOpen && date && !open) {
      setOpen(true);
    }
  }, [autoOpen, date, open]);

  const handleSave = async (items: DayEntryItem[]) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes estar logueado para guardar entradas",
        variant: "destructive"
      });
      return;
    }

    console.log('DayDrawer - Saving data:', {
      date,
      goalId: activeGoal?.id || goalId,
      items: items.map(item => ({
        ingredientId: item.ingredientId,
        quantityGrams: item.quantityGrams
      }))
    });
    
    console.log('DayDrawer - Items details:', items.map(item => ({
      ingredientId: item.ingredientId,
      ingredientIdType: typeof item.ingredientId,
      ingredientIdLength: item.ingredientId?.length,
      quantityGrams: item.quantityGrams,
      quantityGramsType: typeof item.quantityGrams
    })));

    try {
      const response = await fetch('/api/day-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          date,
          goalId: activeGoal?.id || goalId,
          items: items.map(item => ({
            ingredientId: item.ingredientId,
            quantityGrams: item.quantityGrams
          }))
        })
      });

      console.log('DayDrawer - API Response status:', response.status);

      const data = await response.json();
      console.log('DayDrawer - API Response data:', data);
      
      if (response.ok) {
        toast({
          title: "¡Día guardado!",
          description: "Tu entrada nutricional ha sido guardada correctamente"
        });
        setOpen(false);
        onClose?.();
        onSave?.(); // Refresh calendar data
      } else {
        console.error('DayDrawer - API Error:', data);
        toast({
          title: "Error",
          description: data.error || "No se pudo guardar la entrada",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al guardar",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <Drawer open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleClose();
      }
    }}>
      <DrawerTrigger asChild>
        <Button variant="outline">Abrir {date}</Button>
      </DrawerTrigger>
      <DrawerContent className="p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Día {date}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>
        <PlateBuilder 
          date={date} 
          goalId={activeGoal?.id || goalId} 
          targetKcal={activeGoal?.targetKcalDay || 2000}
          onSave={handleSave}
        />
      </DrawerContent>
    </Drawer>
  );
}