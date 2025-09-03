"use client";

import { useMemo, useState } from "react";
import { CalendarView } from "@/components/calendar-view";
import { DayDrawer } from "@/components/day-drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Target, Zap, Info, Play, Code } from "lucide-react";

/**
 * Simple demo page to exercise Nutrimate v2 end-to-end:
 *  - Set a goalId (created via POST /api/goals)
 *  - Choose range (week/month) and start date
 *  - Open a DayDrawer with a PlateBuilder for the selected date
 *  - CalendarView fetches /api/calendar to show ✅/❌ per day
 *
 * NOTE: Components make requests with header "x-user-id": "demo-user-id".
 *       Ensure you use the same userId when creating the goal.
 */

export default function DemoPage() {
  const [goalId, setGoalId] = useState<string>("");
  const [range, setRange] = useState<"week" | "month">("week");

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

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
            <Play className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-4xl font-bold text-orange-600">
            Nutrimate v2 Demo
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Prueba las nuevas funcionalidades gamificadas de seguimiento nutricional
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            <Target className="w-3 h-3 mr-1" />
            Gamificación
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Calendar className="w-3 h-3 mr-1" />
            Calendario
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Zap className="w-3 h-3 mr-1" />
            XP System
          </Badge>
        </div>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-orange-600" />
            Configuración de Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="goalId" className="text-sm font-medium">
                Goal ID
              </Label>
              <Input
                id="goalId"
                placeholder="Pega el UUID del goal aquí"
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Crea un goal via POST /api/goals
              </p>
            </div>

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
          </div>

          <Separator />

          <div className="flex items-end gap-4">
            <div className="space-y-3 flex-1">
              <Label htmlFor="drawerDate" className="text-sm font-medium">
                Abrir Día Específico
              </Label>
              <Input
                id="drawerDate"
                type="date"
                value={drawerDate}
                onChange={(e) => setDrawerDate(e.target.value)}
              />
            </div>
            <DayDrawer date={drawerDate} goalId={goalId} />
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Vista de Calendario
            </CardTitle>
            <div className="text-sm text-muted-foreground bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              <span className="font-mono">{range}</span> | Desde:{" "}
              <span className="font-mono">{from}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CalendarView range={range} from={from} />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Instrucciones de Uso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-600">1</span>
                </div>
                <h4 className="font-medium">Crear Goal</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Crea un goal via <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">POST /api/goals</code> y copia el <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">goal.id</code> en el campo de arriba.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <h4 className="font-medium">Construir Plato</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Usa el Day Drawer para agregar ingredientes (PlateBuilder) para una fecha; llamará a <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">POST /api/day-entries</code>.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600">3</span>
                </div>
                <h4 className="font-medium">Ver Resultados</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                El calendario marcará los días como ✅ o ❌ basado en las reglas de evaluación y otorgará XP.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}