import { NextRequest, NextResponse } from 'next/server';
import { WeeklySummaryQuerySchema } from '@/lib/validation/zod';
import { createServerClient } from '@/lib/supabase/server';
import { getUserId } from '@/lib/auth/getUserId';

export async function GET(req: NextRequest) {
  const supa = createServerClient();
  try {
    const userId = await getUserId(req as unknown as Request);
    const { searchParams } = new URL(req.url);
    const input = WeeklySummaryQuerySchema.parse({
      weekStart: searchParams.get('weekStart'),
      goalId: searchParams.get('goalId') ?? undefined,
    });

    const start = new Date(input.weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const endStr = end.toISOString().slice(0, 10);

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

    return NextResponse.json({
      weekStart: input.weekStart,
      totalKcal,
      successDaysCount: successDays,
      daysWithData,
      targetKcalWeek: targetWeek,
      isSuccess,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 });
  }
}