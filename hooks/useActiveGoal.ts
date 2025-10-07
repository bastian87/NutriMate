import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/auth/simple-auth-provider';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: string;
  targetKcalDay: number;
  objective: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

export function useActiveGoal() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveGoal = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/goals', {
        headers: { 'x-user-id': user.id }
      });

      if (response.ok) {
        const data = await response.json();
        const goals = data.goals || [];
        
        console.log('useActiveGoal - Raw goals from API:', goals);
        
        // Transform goals to match interface
        const transformedGoals = goals.map((goal: any) => ({
          id: goal.id,
          targetKcalDay: goal.target_kcal_day,
          objective: goal.objective,
          startDate: goal.start_date,
          endDate: goal.end_date,
          isActive: !goal.end_date || new Date(goal.end_date) >= new Date()
        }));
        
        console.log('useActiveGoal - Transformed goals:', transformedGoals);
        
        // Find the most recent active goal
        const active = transformedGoals.find((goal: Goal) => {
          const now = new Date();
          const startDate = new Date(goal.startDate);
          const endDate = goal.endDate ? new Date(goal.endDate) : null;
          
          return startDate <= now && (!endDate || endDate >= now);
        });

        if (active) {
          console.log('useActiveGoal - Active goal found:', active);
          setActiveGoal(active);
        } else {
          // If no active goal, try to find the most recent one
          const mostRecent = transformedGoals.sort((a: Goal, b: Goal) => 
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          )[0];
          
          console.log('useActiveGoal - Most recent goal:', mostRecent);
          setActiveGoal(mostRecent || null);
        }
      } else {
        console.error('Failed to fetch goals');
      }
    } catch (error) {
      console.error('Error fetching active goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultGoal = async () => {
    if (!user?.id) return null;

    try {
      // First, check if there's already an active goal
      const existingGoalsResponse = await fetch('/api/goals', {
        headers: { 'x-user-id': user.id }
      });

      if (existingGoalsResponse.ok) {
        const existingData = await existingGoalsResponse.json();
        const goals = existingData.goals || [];
        
        // Check if there's already an active goal
        const hasActiveGoal = goals.some((goal: any) => {
          const now = new Date();
          const startDate = new Date(goal.start_date);
          const endDate = goal.end_date ? new Date(goal.end_date) : null;
          
          return startDate <= now && (!endDate || endDate >= now);
        });

        if (hasActiveGoal) {
          console.log('Active goal already exists, skipping default goal creation');
          // Refresh the active goal data
          await fetchActiveGoal();
          return null;
        }
      }

      // Only create default goal if no active goal exists
      const todayStr = new Date().toISOString().slice(0, 10);
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          targetKcalDay: 2000,
          objective: 'maintain',
          startDate: todayStr,
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.goal) {
          setActiveGoal(data.goal);
          toast({
            title: "¡Objetivo creado!",
            description: "Se ha creado un objetivo por defecto para ti"
          });
          return data.goal;
        }
      } else {
        // Handle specific error responses
        const errorData = await response.json();
        console.error('Error creating default goal:', errorData);
        
        if (response.status === 400 && errorData.error) {
          toast({
            title: "No se puede crear objetivo",
            description: errorData.error,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: "No se pudo crear el objetivo por defecto",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error creating default goal:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el objetivo por defecto",
        variant: "destructive"
      });
    }
    return null;
  };

  useEffect(() => {
    fetchActiveGoal();
  }, [user?.id]);

  return {
    activeGoal,
    loading,
    refetch: fetchActiveGoal,
    createDefaultGoal
  };
}
