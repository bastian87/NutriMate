'use client';

/**
 * Weekly summary card component
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SUMMARY, formatMessage } from '@/lib/i18n/en';
import { Calendar, Target, CheckCircle, XCircle, Zap, RefreshCw } from 'lucide-react';

/**
 * Weekly summary data interface
 */
interface WeeklySummaryData {
  weekStart: string;
  goalId: string;
  totalKcal: number;
  targetKcalWeek: number;
  successDaysCount: number;
  daysWithData: number;
  isSuccess: boolean;
  xpAwarded: boolean;
  xpAmount?: number;
}

/**
 * Weekly summary card props
 */
interface WeeklySummaryCardProps {
  weekStart: string;
  goalId: string;
  onRefresh?: () => void;
}

/**
 * WeeklySummaryCard component
 */
export default function WeeklySummaryCard({ weekStart, goalId, onRefresh }: WeeklySummaryCardProps) {
  const { toast } = useToast();
  const [data, setData] = useState<WeeklySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch weekly summary data
   */
  const fetchWeeklySummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/summary/weekly?weekStart=${weekStart}&goalId=${goalId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weekly summary');
      }
      
      const summaryData = await response.json();
      setData(summaryData);
      
      // Show success toast if XP was awarded
      if (summaryData.xpAwarded && summaryData.xpAmount) {
        toast({
          title: SUMMARY.TOASTS.PERFECT_WEEK.title,
          description: formatMessage(SUMMARY.TOASTS.PERFECT_WEEK.description, { amount: summaryData.xpAmount }),
          variant: "default"
        });
      }
      
    } catch (err) {
      console.error('Error fetching weekly summary:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format week date range
   */
  const formatWeekRange = (weekStart: string): string => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
  };

  /**
   * Calculate progress percentage
   */
  const getProgressPercentage = (): number => {
    if (!data) return 0;
    return Math.min((data.totalKcal / data.targetKcalWeek) * 100, 100);
  };

  /**
   * Get progress color based on success
   */
  const getProgressColor = (): string => {
    if (!data) return 'bg-gray-200';
    if (data.isSuccess) return 'bg-green-500';
    if (data.totalKcal > data.targetKcalWeek) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  // Fetch data on mount and when props change
  useEffect(() => {
    fetchWeeklySummary();
  }, [weekStart, goalId]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {SUMMARY.LABELS.WEEKLY_SUMMARY}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">{SUMMARY.LABELS.LOADING_SUMMARY}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {SUMMARY.LABELS.WEEKLY_SUMMARY}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchWeeklySummary} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              {SUMMARY.LABELS.RETRY}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {SUMMARY.LABELS.WEEKLY_SUMMARY}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchWeeklySummary}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-sm text-gray-600">{formatWeekRange(weekStart)}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Success Status */}
        <div className="flex items-center justify-center">
          {data.isSuccess ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
                             <h3 className="text-lg font-semibold text-green-700">
                 {SUMMARY.LABELS.PERFECT_WEEK}
               </h3>
              {data.xpAwarded && data.xpAmount && (
                <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4" />
                  +{data.xpAmount} XP
                </p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-2" />
                             <h3 className="text-lg font-semibold text-red-700">
                 {SUMMARY.LABELS.INCOMPLETE_WEEK}
               </h3>
               <p className="text-sm text-red-600">
                 {data.successDaysCount}/{data.daysWithData} successful days
               </p>
            </div>
          )}
        </div>

        {/* Calorie Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-500" />
                             <span className="text-sm font-medium">{SUMMARY.LABELS.CALORIES}</span>
            </div>
            <span className="text-sm text-gray-600">
              {data.totalKcal.toLocaleString()} / {data.targetKcalWeek.toLocaleString()} kcal
            </span>
          </div>
          <Progress 
            value={getProgressPercentage()} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>{data.targetKcalWeek.toLocaleString()}</span>
          </div>
        </div>

        {/* Success Days */}
        <div className="flex items-center justify-between">
                     <span className="text-sm font-medium">{SUMMARY.LABELS.SUCCESSFUL_DAYS}</span>
          <Badge variant={data.isSuccess ? 'default' : 'secondary'}>
            {data.successDaysCount}/{data.daysWithData}
          </Badge>
        </div>

        {/* Success Criteria */}
        <div className="space-y-2">
                     <h4 className="text-sm font-medium text-gray-700">{SUMMARY.LABELS.SUCCESS_CRITERIA}</h4>
           <div className="space-y-1 text-xs">
             <div className="flex items-center gap-2">
               {data.successDaysCount === data.daysWithData ? (
                 <CheckCircle className="w-3 h-3 text-green-500" />
               ) : (
                 <XCircle className="w-3 h-3 text-red-500" />
               )}
               <span>{SUMMARY.LABELS.ALL_DAYS_SUCCESSFUL}</span>
             </div>
             <div className="flex items-center gap-2">
               {data.totalKcal <= data.targetKcalWeek ? (
                 <CheckCircle className="w-3 h-3 text-green-500" />
               ) : (
                 <XCircle className="w-3 h-3 text-red-500" />
               )}
               <span>{SUMMARY.LABELS.CALORIES_WITHIN_WEEKLY_GOAL}</span>
             </div>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
