import { NextRequest, NextResponse } from 'next/server';
import { MonthlySummaryQuerySchema } from '@/lib/validation/zod';
import { createServerClient } from '@/lib/supabase/server';
import { getUserId } from '@/lib/auth/getUserId';

export async function GET(req: NextRequest) {
  const supa = createServerClient();
  try {
    const userId = await getUserId(req as unknown as Request);
    const { searchParams } = new URL(req.url);
    
    const monthParam = searchParams.get('month');
    const goalIdParam = searchParams.get('goalId');
    
    console.log('Monthly Summary API - Params:', { monthParam, goalIdParam });
    
    const input = MonthlySummaryQuerySchema.parse({
      month: monthParam,
      goalId: goalIdParam ?? undefined,
    });
    
    console.log('Monthly Summary API - Parsed input:', input);

    // month: 'YYYY-MM'
    const [y, m] = input.month.split('-').map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 0));
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    const { data: days, error } = await supa
      .from('day_entries')
      .select('date,total_kcal,is_success')
      .eq('user_id', userId)
      .gte('date', startStr)
      .lte('date', endStr);
    if (error) throw error;

    const totalKcal = (days ?? []).reduce((a, d) => a + (d.total_kcal ?? 0), 0);

    const { data: g, error: gErr } = await supa
      .from('goals')
      .select('target_kcal_day')
      .eq('user_id', userId)
      .lte('start_date', endStr)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (gErr) throw gErr;

    const targetMonth = g?.target_kcal_day ? g.target_kcal_day * (days?.length ?? 0) : null;

    const successDays = (days ?? []).filter(d => d.is_success).length;
    const totalDays = days?.length ?? 0;
    const averageKcalPerDay = totalDays > 0 ? totalKcal / totalDays : 0;
    
    // Calculate XP earned this month
    const { data: xpRows, error: xpErr } = await supa
      .from('xp_ledger')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', startStr)
      .lte('date', endStr);
    if (xpErr) throw xpErr;
    
    const xpEarned = (xpRows ?? []).reduce((a, r) => a + (r.amount ?? 0), 0);
    
    // Get current streak
    const { data: streakData, error: streakErr } = await supa
      .from('streaks')
      .select('current')
      .eq('user_id', userId)
      .maybeSingle();
    if (streakErr) throw streakErr;
    
    const streak = streakData?.current ?? 0;
    
    // Calculate goals status
    const kcalGoal = targetMonth !== null && totalKcal <= targetMonth;
    const macroGoals = successDays === totalDays && totalDays > 0;
    const consistencyGoal = successDays >= Math.floor(totalDays * 0.8); // 80% success rate
    
    const isSuccess = kcalGoal && macroGoals && consistencyGoal;

    if (isSuccess) {
      await supa.from('xp_ledger').insert({
        user_id: userId,
        date: startStr,
        reason: 'month',
        amount: 800,
      });
    }
    
    // Generate weekly breakdown
    const weeklyBreakdown = [];
    const weeksInMonth = Math.ceil(totalDays / 7);
    for (let week = 0; week < weeksInMonth; week++) {
      const weekStart = new Date(start);
      weekStart.setDate(weekStart.getDate() + (week * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekDays = (days ?? []).filter(d => {
        const dayDate = new Date(d.date);
        return dayDate >= weekStart && dayDate <= weekEnd;
      });
      
      const weekSuccessDays = weekDays.filter(d => d.is_success).length;
      const weekTotalKcal = weekDays.reduce((a, d) => a + (d.total_kcal ?? 0), 0);
      const weekXp = Math.floor(weekSuccessDays * 50); // 50 XP per successful day
      
      weeklyBreakdown.push({
        weekStart: weekStart.toISOString().slice(0, 10),
        weekEnd: weekEnd.toISOString().slice(0, 10),
        successfulDays: weekSuccessDays,
        totalDays: weekDays.length,
        totalKcal: weekTotalKcal,
        xpEarned: weekXp
      });
    }
    
    // Get top performing days
    const topPerformingDays = (days ?? [])
      .sort((a, b) => (b.total_kcal ?? 0) - (a.total_kcal ?? 0))
      .slice(0, 5)
      .map(d => ({
        date: d.date,
        totalKcal: d.total_kcal ?? 0,
        isSuccess: d.is_success ?? false
      }));

    return NextResponse.json({
      month: input.month,
      year: y,
      totalDays,
      successfulDays: successDays,
      totalKcal,
      targetKcal: targetMonth ?? 0,
      averageKcalPerDay,
      xpEarned,
      streak,
      goals: {
        kcalGoal,
        macroGoals,
        consistencyGoal
      },
      weeklyBreakdown,
      topPerformingDays
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 });
  }
}