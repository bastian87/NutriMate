'use client';

/**
 * Monthly summary card component
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SUMMARY, formatMessage } from '@/lib/i18n/en';
import { Calendar, Target, CheckCircle, XCircle, Zap, RefreshCw, Crown } from 'lucide-react';

/**
 * Monthly summary data interface
 */
interface MonthlySummaryData {
  month: string;
  goalId: string;
  totalKcal: number;
  targetKcalMonth: number;
  successWeeksCount: number;
  totalWeeks: number;
  isSuccess: boolean;
  xpAwarded: boolean;
  xpAmount?: number;
}

/**
 * Monthly summary card props
 */
interface MonthlySummaryCardProps {
  month: string;
  goalId: string;
  onRefresh?: () => void;
}

/**
 * MonthlySummaryCard component
 */
export default function MonthlySummaryCard({ month, goalId, onRefresh }: MonthlySummaryCardProps) {
  const { toast } = useToast();
  const [data, setData] = useState<MonthlySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch monthly summary data
   */
  const fetchMonthlySummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/summary/monthly?month=${month}&goalId=${goalId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch monthly summary');
      }
      
      const summaryData = await response.json();
      setData(summaryData);
      
      // Show success toast if XP was awarded
      if (summaryData.xpAwarded && summaryData.xpAmount) {
        toast({
          title: SUMMARY.TOASTS.LEGENDARY_MONTH.title,
          description: formatMessage(SUMMARY.TOASTS.LEGENDARY_MONTH.description, { amount: summaryData.xpAmount }),
          variant: "default"
        });
      }
      
    } catch (err) {
      console.error('Error fetching monthly summary:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format month for display
   */
  const formatMonth = (month: string): string => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  /**
   * Calculate progress percentage
   */
  const getProgressPercentage = (): number => {
    if (!data) return 0;
    return Math.min((data.totalKcal / data.targetKcalMonth) * 100, 100);
  };

  /**
   * Get progress color based on success
   */
  const getProgressColor = (): string => {
    if (!data) return 'bg-gray-200';
    if (data.isSuccess) return 'bg-purple-500';
    if (data.totalKcal > data.targetKcalMonth) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  // Fetch data on mount and when props change
  useEffect(() => {
    fetchMonthlySummary();
  }, [month, goalId]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {SUMMARY.LABELS.MONTHLY_SUMMARY}
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
            {SUMMARY.LABELS.MONTHLY_SUMMARY}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchMonthlySummary} variant="outline">
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
            {SUMMARY.LABELS.MONTHLY_SUMMARY}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchMonthlySummary}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-sm text-gray-600">{formatMonth(month)}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Success Status */}
        <div className="flex items-center justify-center">
          {data.isSuccess ? (
            <div className="text-center">
              <div className="relative">
                <Crown className="w-16 h-16 text-purple-500 mx-auto mb-2" />
                <CheckCircle className="w-8 h-8 text-green-500 absolute -top-1 -right-1" />
              </div>
                             <h3 className="text-lg font-semibold text-purple-700">
                 {SUMMARY.LABELS.LEGENDARY_MONTH}
               </h3>
              {data.xpAwarded && data.xpAmount && (
                <p className="text-sm text-purple-600 flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4" />
                  +{data.xpAmount} XP
                </p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-2" />
                             <h3 className="text-lg font-semibold text-red-700">
                 {SUMMARY.LABELS.INCOMPLETE_MONTH}
               </h3>
               <p className="text-sm text-red-600">
                 {data.successWeeksCount}/{data.totalWeeks} successful weeks
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
              {data.totalKcal.toLocaleString()} / {data.targetKcalMonth.toLocaleString()} kcal
            </span>
          </div>
          <Progress 
            value={getProgressPercentage()} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>{data.targetKcalMonth.toLocaleString()}</span>
          </div>
        </div>

        {/* Success Weeks */}
        <div className="flex items-center justify-between">
                     <span className="text-sm font-medium">{SUMMARY.LABELS.SUCCESSFUL_WEEKS}</span>
          <Badge variant={data.isSuccess ? 'default' : 'secondary'}>
            {data.successWeeksCount}/{data.totalWeeks}
          </Badge>
        </div>

        {/* Success Criteria */}
        <div className="space-y-2">
                     <h4 className="text-sm font-medium text-gray-700">{SUMMARY.LABELS.SUCCESS_CRITERIA}</h4>
           <div className="space-y-1 text-xs">
             <div className="flex items-center gap-2">
               {data.successWeeksCount === data.totalWeeks ? (
                 <CheckCircle className="w-3 h-3 text-green-500" />
               ) : (
                 <XCircle className="w-3 h-3 text-red-500" />
               )}
               <span>{SUMMARY.LABELS.ALL_WEEKS_SUCCESSFUL}</span>
             </div>
             <div className="flex items-center gap-2">
               {data.totalKcal <= data.targetKcalMonth ? (
                 <CheckCircle className="w-3 h-3 text-green-500" />
               ) : (
                 <XCircle className="w-3 h-3 text-red-500" />
               )}
               <span>{SUMMARY.LABELS.CALORIES_WITHIN_MONTHLY_GOAL}</span>
             </div>
           </div>
        </div>

        {/* Weekly Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">{SUMMARY.LABELS.WEEKLY_BREAKDOWN}</h4>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: data.totalWeeks }, (_, i) => (
              <div
                key={i}
                className={`h-8 rounded flex items-center justify-center text-xs font-medium ${
                  i < data.successWeeksCount
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-red-100 text-red-700 border border-red-300'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
                     <div className="flex justify-between text-xs text-gray-500">
             <span>{SUMMARY.LABELS.WEEK_1}</span>
             <span>Week {data.totalWeeks}</span>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
