import { NextRequest, NextResponse } from 'next/server';
import { GoalUpsertSchema } from '@/lib/validation/zod';
import { createServerClient } from '@/lib/supabase/server';
import { getUserId } from '@/lib/auth/getUserId';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req as unknown as Request);
    const supa = createServerClient();

    const { data: goals, error } = await supa
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ goals });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Invalid request' }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req as unknown as Request);
    const data = GoalUpsertSchema.parse(await req.json());

    const targetKcalWeek = data.targetKcalWeek ?? data.targetKcalDay * 7;
    const targetKcalMonth = data.targetKcalMonth ?? data.targetKcalDay * 30;

    const supa = createServerClient();

    await supa.from('goals')
      .update({ end_date: data.startDate })
      .eq('user_id', userId)
      .is('end_date', null);

    const { data: inserted, error } = await supa.from('goals').insert({
      user_id: userId,
      start_date: data.startDate,
      end_date: data.endDate ?? null,
      target_kcal_day: data.targetKcalDay,
      target_kcal_week: targetKcalWeek,
      target_kcal_month: targetKcalMonth,
      objective: data.objective,
    }).select('*').single();

    if (error) throw error;
    return NextResponse.json({ goal: inserted });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Invalid request' }, { status: 400 });
  }
}