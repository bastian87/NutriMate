import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/auth/auth-provider';
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
        
        // Find the most recent active goal
        const active = goals.find((goal: Goal) => {
          const now = new Date();
          const startDate = new Date(goal.startDate);
          const endDate = goal.endDate ? new Date(goal.endDate) : null;
          
          return startDate <= now && (!endDate || endDate >= now);
        });

        if (active) {
          setActiveGoal(active);
        } else {
          // If no active goal, try to find the most recent one
          const mostRecent = goals.sort((a: Goal, b: Goal) => 
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          )[0];
          
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
