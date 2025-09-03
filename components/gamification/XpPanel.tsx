'use client';

/**
 * XP panel component
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { GAMIFICATION } from '@/lib/i18n/en';
import { Zap, Star, RefreshCw, TrendingUp } from 'lucide-react';

/**
 * XP data interface
 */
interface XpData {
  totalXp: number;
  lastReasons: Array<{
    reason: string;
    amount: number;
    date: string;
  }>;
}

/**
 * XpPanel component
 */
export default function XpPanel() {
  const { toast } = useToast();
  const [xpData, setXpData] = useState<XpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch XP data
   */
  const fetchXpData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/gamification');
      
      if (!response.ok) {
        throw new Error('Failed to fetch XP data');
      }
      
      const data = await response.json();
      setXpData({
        totalXp: data.totalXp,
        lastReasons: data.lastReasons
      });
      
    } catch (err) {
      console.error('Error fetching XP data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get XP level based on total XP
   */
  const getXpLevel = (totalXp: number): { level: number; nextLevel: number; progress: number } => {
    const levels = [0, 100, 250, 500, 750, 1000, 1500, 2000, 3000, 5000];
    let level = 0;
    let nextLevel = 100;
    
    for (let i = 0; i < levels.length - 1; i++) {
      if (totalXp >= levels[i] && totalXp < levels[i + 1]) {
        level = i + 1;
        nextLevel = levels[i + 1];
        break;
      }
    }
    
    if (totalXp >= levels[levels.length - 1]) {
      level = levels.length;
      nextLevel = levels[levels.length - 1] + 1000;
    }
    
    const progress = level === levels.length ? 100 : 
      ((totalXp - levels[level - 1]) / (nextLevel - levels[level - 1])) * 100;
    
    return { level, nextLevel, progress };
  };

  /**
   * Get reason icon and color
   */
  const getReasonDisplay = (reason: string) => {
    switch (reason) {
      case 'day':
        return GAMIFICATION.XP_ACTIVITY.SUCCESSFUL_DAY;
      case 'streak':
        return GAMIFICATION.XP_ACTIVITY.STREAK;
      case 'week':
        return GAMIFICATION.XP_ACTIVITY.PERFECT_WEEK;
      case 'month':
        return GAMIFICATION.XP_ACTIVITY.LEGENDARY_MONTH;
      default:
        return GAMIFICATION.XP_ACTIVITY.DEFAULT;
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return GAMIFICATION.DATE_FORMATS.YESTERDAY;
    if (diffDays <= 7) return `${diffDays} ${GAMIFICATION.DATE_FORMATS.DAYS_AGO}`;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  // Fetch data on mount
  useEffect(() => {
    fetchXpData();
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
            <Button onClick={fetchXpData} variant="outline" size="sm">
              <RefreshCw className="w-3 h-3 mr-1" />
              {GAMIFICATION.LABELS.RETRY}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!xpData) {
    return null;
  }

  const { level, nextLevel, progress } = getXpLevel(xpData.totalXp);

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Total XP and Level */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">
                {xpData.totalXp.toLocaleString()} XP
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Star className="w-4 h-4 text-blue-500" />
                             <span className="text-sm font-medium text-blue-600">
                 {GAMIFICATION.LABELS.LEVEL} {level}
               </span>
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
                             <span>{GAMIFICATION.LABELS.PROGRESS_TO_LEVEL} {level + 1}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{xpData.totalXp.toLocaleString()}</span>
              <span>{nextLevel.toLocaleString()}</span>
            </div>
          </div>

          {/* Recent XP Activity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
                             <span className="text-sm font-medium text-gray-700">{GAMIFICATION.LABELS.RECENT_ACTIVITY}</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {xpData.lastReasons.map((entry, index) => {
                const display = getReasonDisplay(entry.reason);
                return (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span>{display.icon}</span>
                      <span className="text-gray-600">{display.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${display.color}`}>
                        +{entry.amount}
                      </span>
                      <span className="text-gray-400">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
