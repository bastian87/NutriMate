"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthContext } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Target, Calendar, Zap } from "lucide-react";

interface Goal {
  id: string;
  target_kcal_day: number;
  target_kcal_week?: number;
  target_kcal_month?: number;
  objective: 'lose' | 'maintain' | 'gain' | 'muscle';
  start_date: string;
  end_date?: string;
  created_at: string;
}

export default function GoalsPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form state
  const [targetKcalDay, setTargetKcalDay] = useState(2000);
  const [objective, setObjective] = useState<'lose' | 'maintain' | 'gain' | 'muscle'>('maintain');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');

  // Fetch goals
  const fetchGoals = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/goals', {
        headers: { 'x-user-id': user.id }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new goal
  const createGoal = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes estar logueado para crear objetivos",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          targetKcalDay,
          objective,
          startDate,
          endDate: endDate || null
        })
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "¡Objetivo creado!",
          description: "Tu objetivo nutricional ha sido configurado correctamente"
        });
        fetchGoals(); // Refresh goals list
        // Reset form
        setTargetKcalDay(2000);
        setObjective('maintain');
        setStartDate(new Date().toISOString().slice(0, 10));
        setEndDate('');
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo crear el objetivo",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al crear el objetivo",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Acceso Requerido</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Necesitas iniciar sesión para gestionar tus objetivos nutricionales
          </p>
          <Button asChild>
            <a href="/login">Iniciar Sesión</a>
          </Button>
        </div>
      </div>
    );
  }

  const getObjectiveLabel = (obj: string) => {
    switch (obj) {
      case 'lose': return 'Perder peso';
      case 'maintain': return 'Mantener peso';
      case 'gain': return 'Ganar peso';
      case 'muscle': return 'Ganar músculo';
      default: return obj;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Objetivos Nutricionales</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tus objetivos de calorías y macronutrientes
        </p>
      </div>

      {/* Create New Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Crear Nuevo Objetivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetKcal">Calorías Diarias</Label>
              <Input
                id="targetKcal"
                type="number"
                value={targetKcalDay}
                onChange={(e) => setTargetKcalDay(Number(e.target.value))}
                min="800"
                max="6000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo</Label>
              <Select value={objective} onValueChange={(value: any) => setObjective(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose">Perder peso</SelectItem>
                  <SelectItem value="maintain">Mantener peso</SelectItem>
                  <SelectItem value="gain">Ganar peso</SelectItem>
                  <SelectItem value="muscle">Ganar músculo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de Fin (opcional)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6">
            <Button 
              onClick={createGoal}
              disabled={creating}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {creating ? "Creando..." : "Crear Objetivo"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Mis Objetivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando objetivos...</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No tienes objetivos configurados aún
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Crea tu primer objetivo para comenzar el seguimiento nutricional
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {goal.target_kcal_day} kcal/día
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {getObjectiveLabel(goal.objective)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(goal.start_date).toLocaleDateString('es-ES')} - 
                        {goal.end_date ? new Date(goal.end_date).toLocaleDateString('es-ES') : 'Sin fecha límite'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Zap className="w-4 h-4" />
                        <span>Objetivo activo</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
