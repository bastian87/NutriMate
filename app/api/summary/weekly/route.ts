import { NextRequest, NextResponse } from 'next/server';
import { WeeklySummaryQuerySchema } from '@/lib/validation/zod';
import { createServerClient } from '@/lib/supabase/server';
import { getUserId } from '@/lib/auth/getUserId';

export async function GET(req: NextRequest) {
  const supa = createServerClient();
  try {
    const userId = await getUserId(req as unknown as Request);
    const { searchParams } = new URL(req.url);
    
    const weekStartParam = searchParams.get('weekStart');
    const goalIdParam = searchParams.get('goalId');
    
    console.log('Weekly Summary API - Params:', { weekStartParam, goalIdParam });
    
    const input = WeeklySummaryQuerySchema.parse({
      weekStart: weekStartParam,
      goalId: goalIdParam ?? undefined,
    });
    
    console.log('Weekly Summary API - Parsed input:', input);

    const start = new Date(input.weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const endStr = end.toISOString().slice(0, 10);
    
    console.log('Weekly Summary API - Date range:', { start: start.toISOString().slice(0, 10), end: endStr });

    // Determine target kcal/day
    let targetDay: number | null = null;
    if (input.goalId) {
      const { data: g, error: gErr } = await supa
        .from('goals')
        .select('target_kcal_day')
        .eq('id', input.goalId)
        .single();
      if (gErr) throw gErr;
      targetDay = g.target_kcal_day;
    } else {
      const { data: g, error: gErr } = await supa
        .from('goals')
        .select('target_kcal_day')
        .eq('user_id', userId)
        .lte('start_date', endStr)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (gErr) throw gErr;
      targetDay = g?.target_kcal_day ?? null;
    }

    const { data: days, error } = await supa
      .from('day_entries')
      .select('date,total_kcal,is_success')
      .eq('user_id', userId)
      .gte('date', input.weekStart)
      .lte('date', endStr);
    if (error) throw error;

    const successDays = (days ?? []).filter(d => d.is_success).length;
    const totalKcal = (days ?? []).reduce((a, d) => a + (d.total_kcal ?? 0), 0);
    const daysWithData = (days ?? []).length;
    const targetWeek = targetDay ? targetDay * daysWithData : null;
    const averageKcalPerDay = daysWithData > 0 ? totalKcal / daysWithData : 0;

    // Calculate XP earned this week
    const { data: xpRows, error: xpErr } = await supa
      .from('xp_ledger')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', input.weekStart)
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

    const isSuccess =
      !!(daysWithData > 0 &&
         successDays === daysWithData &&
         targetWeek !== null &&
         totalKcal <= targetWeek);

    if (isSuccess) {
      await supa.from('xp_ledger').insert({
        user_id: userId,
        date: input.weekStart,
        reason: 'week',
        amount: 200,
      });
    }
    
    // Generate daily breakdown
    const dailyBreakdown = (days ?? []).map(d => ({
      date: d.date,
      isSuccess: d.is_success ?? false,
      totalKcal: d.total_kcal ?? 0,
      targetKcal: targetDay ?? 0,
      flags: {
        hasCarb: true, // This would need to be calculated from day_entry_items
        hasProtein: true,
        hasFat: true,
        hasVegFruit: true,
        extrasCount: 0
      }
    }));

    return NextResponse.json({
      weekStart: input.weekStart,
      totalKcal,
      successfulDays: successDays,
      totalDays: daysWithData,
      targetKcal: targetWeek ?? 0,
      averageKcalPerDay,
      xpEarned,
      streak,
      goals: {
        kcalGoal: targetWeek !== null && totalKcal <= targetWeek,
        macroGoals: successDays === daysWithData && daysWithData > 0,
        consistencyGoal: successDays >= Math.floor(daysWithData * 0.8)
      },
      dailyBreakdown
    });
  } catch (err: any) {
    console.error('Weekly Summary API Error:', err);
    return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 });
  }
}