"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/context";
import { Target, Calendar, Zap, Trash2, Plus, TrendingUp } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { motion } from "framer-motion";

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
  const { t } = useLanguage();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

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
        title: t("common.error"),
        description: t("goals.mustBeLoggedIn"),
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
          title: t("goals.goalCreated"),
          description: t("goals.goalCreated")
        });
        fetchGoals(); // Refresh goals list
        // Reset form
        setTargetKcalDay(2000);
        setObjective('maintain');
        setStartDate(new Date().toISOString().slice(0, 10));
        setEndDate('');
      } else {
        toast({
        title: t("common.error"),
        description: data.error || t("goals.failedToCreate"),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("goals.connectionError"),
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (goalId: string) => {
    setGoalToDelete(goalId);
    setDeleteDialogOpen(true);
  };

  // Delete goal
  const deleteGoal = async (forceDelete = false) => {
    if (!user?.id || !goalToDelete) {
      toast({
        title: t("common.error"),
        description: t("goals.mustBeLoggedIn"),
        variant: "destructive"
      });
      return;
    }

    setDeleting(goalToDelete);
    try {
      const endpoint = forceDelete ? `/api/goals/force-delete?id=${goalToDelete}` : `/api/goals?id=${goalToDelete}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id
        }
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: t("goals.goalDeleted"),
          description: forceDelete 
            ? "Objetivo y todos los datos asociados eliminados correctamente"
            : t("goals.goalDeletedSuccessfully")
        });
        fetchGoals(); // Refresh goals list
        setDeleteDialogOpen(false);
        setGoalToDelete(null);
      } else {
        // Si el error es por dependencias, ofrecer borrar con cascada
        if (data.error && data.error.includes('entradas diarias asociadas')) {
          toast({
            title: "No se puede eliminar",
            description: data.error + " ¿Deseas eliminar también todas las entradas asociadas?",
            variant: "destructive",
            action: (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => deleteGoal(true)}
              >
                Eliminar todo
              </Button>
            )
          });
        } else {
          toast({
            title: t("common.error"),
            description: data.error || t("goals.failedToDelete"),
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("goals.connectionError"),
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">{t("goals.accessRequired")}</h2>
            <p className="text-xl text-gray-600 mb-8">
              {t("goals.mustSignIn")}
            </p>
            <Button asChild className="bg-orange-600 hover:bg-orange-700" size="lg">
              <a href="/login">{t("goals.signIn")}</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getObjectiveLabel = (obj: string) => {
    switch (obj) {
      case 'lose': return t("goals.loseWeight");
      case 'maintain': return t("goals.maintainWeight");
      case 'gain': return t("goals.gainWeight");
      case 'muscle': return t("goals.gainMuscle");
      default: return obj;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-gray-900">{t("goals.title")}</h1>
          <p className="text-xl text-gray-600">
            {t("goals.manageGoals")}
          </p>
        </motion.div>

        {/* Create New Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-600" />
                {t("goals.createNewGoal")}
              </CardTitle>
            </CardHeader>
            <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetKcal">{t("goals.dailyCalories")}</Label>
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
              <Label htmlFor="objective">{t("goals.objective")}</Label>
              <Select value={objective} onValueChange={(value: any) => setObjective(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose">{t("goals.loseWeight")}</SelectItem>
                  <SelectItem value="maintain">{t("goals.maintainWeight")}</SelectItem>
                  <SelectItem value="gain">{t("goals.gainWeight")}</SelectItem>
                  <SelectItem value="muscle">{t("goals.gainMuscle")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">{t("goals.startDateLabel")}</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">{t("goals.endDateLabel")}</Label>
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
                  size="lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {creating ? t("goals.creating") : t("goals.createGoal")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Existing Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                {t("goals.myGoals")}
              </CardTitle>
            </CardHeader>
            <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t("goals.loadingGoals")}</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t("goals.noGoalsConfigured")}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {t("goals.createFirstGoal")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-gray-900">
                            {goal.target_kcal_day} kcal/día
                          </h3>
                          <p className="text-orange-700 font-medium">
                            {getObjectiveLabel(goal.objective)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 ml-13">
                        {new Date(goal.start_date).toLocaleDateString('es-ES')} - 
                        {goal.end_date ? new Date(goal.end_date).toLocaleDateString('es-ES') : t("goals.noEndDate")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-orange-200 rounded-full">
                        <Zap className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-700">{t("goals.activeGoal")}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(goal.id)}
                        disabled={deleting === goal.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        {deleting === goal.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title={t("goals.deleteGoalTitle")}
          description={t("goals.confirmDelete")}
          confirmText={t("goals.deleteConfirm")}
          cancelText={t("goals.cancel")}
          onConfirm={() => deleteGoal(false)}
          loading={deleting === goalToDelete}
          variant="destructive"
        />
      </div>
    </div>
  );
}
