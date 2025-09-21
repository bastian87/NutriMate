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

    // Validar que no exista un goal activo en la misma semana
    const startDate = new Date(data.startDate);
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() - startDate.getDay()); // Domingo de esa semana
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sábado de esa semana

    const { data: existingGoals, error: checkError } = await supa
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .gte('start_date', weekStart.toISOString().slice(0, 10))
      .lte('start_date', weekEnd.toISOString().slice(0, 10))
      .is('end_date', null);

    if (checkError) throw checkError;

    if (existingGoals && existingGoals.length > 0) {
      return NextResponse.json({ 
        error: 'Ya tienes un objetivo activo para esta semana. Termina el objetivo actual antes de crear uno nuevo.' 
      }, { status: 400 });
    }

    // Terminar goal anterior si existe
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

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId(req as unknown as Request);
    const url = new URL(req.url);
    const goalId = url.searchParams.get('id');

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }

    const supa = createServerClient();

    // Verificar que el goal pertenece al usuario
    const { data: goal, error: fetchError } = await supa
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Eliminar el goal
    const { error: deleteError } = await supa
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: 'Goal deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Invalid request' }, { status: 400 });
  }
}