import { NextRequest, NextResponse } from 'next/server';
import { MonthlySummaryQuerySchema } from '@/lib/validation/zod';
import { createServerClient } from '@/lib/supabase/server';
import { getUserId } from '@/lib/auth/getUserId';

export async function GET(req: NextRequest) {
  const supa = createServerClient();
  try {
    const userId = await getUserId(req as unknown as Request);
    const { searchParams } = new URL(req.url);
    const input = MonthlySummaryQuerySchema.parse({
      month: searchParams.get('month'),
      goalId: searchParams.get('goalId') ?? undefined,
    });

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
    const isSuccess =
      !!(days && days.length > 0 &&
         successDays === days.length &&
         targetMonth !== null &&
         totalKcal <= targetMonth);

    if (isSuccess) {
      await supa.from('xp_ledger').insert({
        user_id: userId,
        date: startStr,
        reason: 'month',
        amount: 800,
      });
    }

    return NextResponse.json({
      month: input.month,
      totalKcal,
      daysWithData: days?.length ?? 0,
      targetKcalMonth: targetMonth,
      isSuccess,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 });
  }
}