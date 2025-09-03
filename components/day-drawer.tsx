"use client";

import { useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import PlateBuilder from "./plate-builder/PlateBuilder";
import { useAuthContext } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useActiveGoal } from "@/hooks/useActiveGoal";
import type { DayEntryItem } from "@/types/nutri";

interface Props {
  date: string;
  goalId: string;
}

export function DayDrawer({ date, goalId }: Props) {
  const [open, setOpen] = useState(false);
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { activeGoal } = useActiveGoal();

  const handleSave = async (items: DayEntryItem[]) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes estar logueado para guardar entradas",
        variant: "destructive"
      });
      return;
    }

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

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "¡Día guardado!",
          description: "Tu entrada nutricional ha sido guardada correctamente"
        });
        setOpen(false);
      } else {
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

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Abrir {date}</Button>
      </DrawerTrigger>
      <DrawerContent className="p-4">
        <h2 className="font-bold text-lg mb-4">Día {date}</h2>
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