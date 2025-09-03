import { NextRequest, NextResponse } from 'next/server';
import { CalendarQuerySchema } from '@/lib/validation/zod';
import { createServerClient } from '@/lib/supabase/server';
import { getUserId } from '@/lib/auth/getUserId';

export async function GET(req: NextRequest) {
  const supa = createServerClient();
  try {
    const userId = await getUserId(req as unknown as Request);
    const { searchParams } = new URL(req.url);
    const input = CalendarQuerySchema.parse({
      range: searchParams.get('range'),
      from: searchParams.get('from'),
    });

    const from = new Date(input.from);
    const days = input.range === 'week'
      ? 7
      : new Date(from.getFullYear(), from.getMonth() + 1, 0).getDate();

    const to = new Date(from);
    to.setDate(from.getDate() + (input.range === 'week' ? 6 : (days - 1)));
    const toStr = to.toISOString().slice(0, 10);

    const { data, error } = await supa
      .from('day_entries')
      .select('date,total_kcal,is_success,has_carb,has_protein,has_fat,has_vegfruit,extras_count,goal_id')
      .eq('user_id', userId)
      .gte('date', input.from)
      .lte('date', toStr);
    if (error) throw error;

    const { data: goal, error: gErr } = await supa
      .from('goals')
      .select('id,target_kcal_day,start_date,end_date')
      .eq('user_id', userId)
      .lte('start_date', toStr)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (gErr) throw gErr;

    return NextResponse.json({
      range: input.range,
      from: input.from,
      targetKcalDay: goal?.target_kcal_day ?? null,
      days: data ?? [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 });
  }
}