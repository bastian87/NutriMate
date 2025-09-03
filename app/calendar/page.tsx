"use client";

import { useState, useMemo, useEffect } from "react";
import { CalendarView } from '@/components/calendar-view';
import { DayDrawer } from '@/components/day-drawer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useActiveGoal } from "@/hooks/useActiveGoal";

/**
 * Nutrition Tracking Calendar page
 */
export default function CalendarPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { activeGoal, loading: goalLoading, createDefaultGoal } = useActiveGoal();
  const [range, setRange] = useState<"week" | "month">("week");
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);

  // default "from" = today (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const [from, setFrom] = useState<string>(todayStr);
  const [drawerDate, setDrawerDate] = useState<string>(todayStr);

  // Función para crear goal automáticamente
  const handleCreateGoal = async () => {
    setIsCreatingGoal(true);
    try {
      await createDefaultGoal();
    } finally {
      setIsCreatingGoal(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Acceso Requerido</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Necesitas iniciar sesión para acceder al seguimiento nutricional
          </p>
          <Button asChild>
            <a href="/login">Iniciar Sesión</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Seguimiento Nutricional</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitorea tus objetivos nutricionales diarios y construye hábitos saludables
        </p>
      </div>

      {/* Goal Configuration */}
      {!activeGoal && !goalLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Configurar Objetivo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Crea tu primer objetivo nutricional para comenzar el seguimiento
            </p>
            <Button 
              onClick={handleCreateGoal}
              disabled={isCreatingGoal}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isCreatingGoal ? "Creando..." : "Crear Objetivo (2000 kcal/día)"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Calendar Controls */}
      {activeGoal && (
        <Card>
          <CardHeader>
            <CardTitle>Controles del Calendario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Rango de Vista</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={range === "week" ? "default" : "outline"}
                    onClick={() => setRange("week")}
                    className="flex-1"
                  >
                    Semanal
                  </Button>
                  <Button
                    type="button"
                    variant={range === "month" ? "default" : "outline"}
                    onClick={() => setRange("month")}
                    className="flex-1"
                  >
                    Mensual
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="from" className="text-sm font-medium">
                  Fecha de Inicio
                </Label>
                <Input
                  id="from"
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="drawerDate" className="text-sm font-medium">
                  Abrir Día Específico
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="drawerDate"
                    type="date"
                    value={drawerDate}
                    onChange={(e) => setDrawerDate(e.target.value)}
                  />
                  <DayDrawer date={drawerDate} goalId={activeGoal?.id || ""} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {activeGoal && (
        <Card>
          <CardHeader>
            <CardTitle>Calendario de Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarView range={range} from={from} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
