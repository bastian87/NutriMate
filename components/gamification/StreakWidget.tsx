'use client';

/**
 * Streak widget component
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { GAMIFICATION } from '@/lib/i18n/en';
import { Flame, Trophy, RefreshCw } from 'lucide-react';

/**
 * Streak data interface
 */
interface StreakData {
  current: number;
  best: number;
}

/**
 * StreakWidget component
 */
export default function StreakWidget() {
  const { toast } = useToast();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch streak data
   */
  const fetchStreakData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/gamification');
      
      if (!response.ok) {
        throw new Error('Failed to fetch streak data');
      }
      
      const data = await response.json();
      setStreak(data.streak);
      
    } catch (err) {
      console.error('Error fetching streak data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get streak color based on current streak
   */
  const getStreakColor = (current: number): string => {
    if (current >= 7) return 'text-orange-600';
    if (current >= 4) return 'text-yellow-600';
    if (current >= 2) return 'text-blue-600';
    return 'text-gray-600';
  };

  /**
   * Get streak badge variant
   */
  const getStreakBadgeVariant = (current: number): "default" | "secondary" | "destructive" => {
    if (current >= 7) return 'default';
    if (current >= 4) return 'secondary';
    return 'secondary';
  };

  /**
   * Get streak message
   */
  const getStreakMessage = (current: number): string => {
    if (current === 0) return GAMIFICATION.STREAK.START_STREAK;
    if (current === 1) return GAMIFICATION.STREAK.GOOD_START;
    if (current >= 2 && current < 4) return GAMIFICATION.STREAK.KEEP_GOING;
    if (current >= 4 && current < 7) return GAMIFICATION.STREAK.EXCELLENT_STREAK;
    if (current >= 7) return GAMIFICATION.STREAK.LEGENDARY_STREAK;
    return GAMIFICATION.STREAK.MAINTAIN_STREAK;
  };

  // Fetch data on mount
  useEffect(() => {
    fetchStreakData();
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">{GAMIFICATION.LABELS.LOADING}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <Button onClick={fetchStreakData} variant="outline" size="sm">
              <RefreshCw className="w-3 h-3 mr-1" />
              {GAMIFICATION.LABELS.RETRY}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!streak) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Current Streak */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className={`w-5 h-5 ${getStreakColor(streak.current)}`} />
                             <span className="text-sm font-medium">{GAMIFICATION.LABELS.CURRENT_STREAK}</span>
            </div>
            <Badge variant={getStreakBadgeVariant(streak.current)}>
              {streak.current} {GAMIFICATION.LABELS.DAYS}
            </Badge>
          </div>

          {/* Best Streak */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
                             <span className="text-sm font-medium">{GAMIFICATION.LABELS.BEST_STREAK}</span>
            </div>
            <Badge variant="secondary">
              {streak.best} {GAMIFICATION.LABELS.DAYS}
            </Badge>
          </div>

          {/* Streak Message */}
          <div className="text-center">
            <p className="text-xs text-gray-600">
              {getStreakMessage(streak.current)}
            </p>
          </div>

          {/* Progress to next milestone */}
          {streak.current > 0 && (
            <div className="space-y-1">
                             <div className="flex justify-between text-xs text-gray-500">
                 <span>{GAMIFICATION.STREAK.PROGRESS}</span>
                 <span>
                   {streak.current >= 7 ? GAMIFICATION.STREAK.LEGENDARY : 
                    streak.current >= 4 ? GAMIFICATION.STREAK.TOWARDS_7_DAYS :
                    streak.current >= 2 ? GAMIFICATION.STREAK.TOWARDS_4_DAYS : GAMIFICATION.STREAK.TOWARDS_2_DAYS}
                 </span>
               </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    streak.current >= 7 ? 'bg-orange-500' :
                    streak.current >= 4 ? 'bg-yellow-500' :
                    streak.current >= 2 ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                  style={{
                    width: `${Math.min((streak.current / 7) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
