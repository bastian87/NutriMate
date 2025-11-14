import { NextRequest, NextResponse } from 'next/server';
import { GoalUpsertSchema } from '@/lib/validation/zod';
import { createServerClientWithCookies } from '@/lib/supabase/server';
import type { Database } from '@/lib/types/database';

export async function GET(req: NextRequest) {
  try {
    const response = NextResponse.next();
    const supa = createServerClientWithCookies(req, response);
    
    const { data: { session }, error: authError } = await supa.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;

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
    const response = NextResponse.next();
    const supa = createServerClientWithCookies(req, response);
    
    const { data: { session }, error: authError } = await supa.auth.getSession();
    if (authError || !session) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    console.log('Authenticated user ID:', userId);
    console.log('Session details:', {
      user_id: session.user.id,
      email: session.user.email,
      aud: session.user.aud,
      role: session.user.role
    });
    
    const rawBody = await req.json();
    console.log('Raw request body:', rawBody);
    
    const data = GoalUpsertSchema.parse(rawBody);
    console.log('Parsed data:', data);

    const targetKcalWeek = data.targetKcalWeek ?? data.targetKcalDay * 7;
    const targetKcalMonth = data.targetKcalMonth ?? data.targetKcalDay * 30;
    
    console.log('Calculated values:', {
      targetKcalWeek,
      targetKcalMonth,
      startDate: data.startDate,
      endDate: data.endDate
    });

    // Validar que no exista un goal activo en la misma semana
    const startDate = new Date(data.startDate);
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() - startDate.getDay()); // Domingo de esa semana
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sábado de esa semana

    console.log('Checking for existing goals in week:', {
      weekStart: weekStart.toISOString().slice(0, 10),
      weekEnd: weekEnd.toISOString().slice(0, 10),
      userId
    });

    const { data: existingGoals, error: checkError } = await supa
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .gte('start_date', weekStart.toISOString().slice(0, 10))
      .lte('start_date', weekEnd.toISOString().slice(0, 10))
      .is('end_date', null);

    if (checkError) {
      console.error('Error checking existing goals:', checkError);
      throw checkError;
    }

    console.log('Existing goals found:', existingGoals);

    if (existingGoals && existingGoals.length > 0) {
      console.log('Active goal exists for this week, returning error');
      return NextResponse.json({ 
        error: 'Ya tienes un objetivo activo para esta semana. Termina el objetivo actual antes de crear uno nuevo.' 
      }, { status: 400 });
    }

    // Terminar goal anterior si existe
    await supa.from('goals')
      .update({ end_date: data.startDate })
      .eq('user_id', userId)
      .is('end_date', null);

    console.log('Creating goal with data:', {
      user_id: userId,
      start_date: data.startDate,
      end_date: data.endDate ?? null,
      target_kcal_day: data.targetKcalDay,
      target_kcal_week: targetKcalWeek,
      target_kcal_month: targetKcalMonth,
      objective: data.objective,
    });

    const { data: inserted, error } = await supa.from('goals').insert({
      user_id: userId,
      start_date: data.startDate,
      end_date: data.endDate ?? null,
      target_kcal_day: data.targetKcalDay,
      target_kcal_week: targetKcalWeek,
      target_kcal_month: targetKcalMonth,
      objective: data.objective,
    }).select('*').single();

    if (error) {
      console.error('Error inserting goal:', error);
      throw error;
    }
    
    console.log('Goal created successfully:', inserted);
    return NextResponse.json({ goal: inserted });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const response = NextResponse.next();
    const supa = createServerClientWithCookies(req, response);
    
    const { data: { session }, error: authError } = await supa.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const url = new URL(req.url);
    const rawGoalId = url.searchParams.get('id');
    
    if (!rawGoalId?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      return NextResponse.json({ error: 'Invalid goal ID format' }, { status: 400 });
    }
    
    const goalId = rawGoalId as Database['public']['Tables']['goals']['Row']['id'];

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }


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

    // Verificar si hay entradas diarias que referencian este goal
    const { data: dayEntries, error: entriesError } = await supa
      .from('day_entries')
      .select('id, date')
      .eq('goal_id', goalId)
      .eq('user_id', userId)
      .limit(1);

    if (entriesError) {
      console.error('Error checking day entries:', entriesError);
      return NextResponse.json({ error: 'Error checking dependencies' }, { status: 500 });
    }

    if (dayEntries && dayEntries.length > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar este objetivo porque tiene entradas diarias asociadas. Primero elimina las entradas del diario de comidas o crea un nuevo objetivo.' 
      }, { status: 400 });
    }

    // Verificar si hay resúmenes semanales que referencian este goal
    const { data: weeklySummaries, error: weeklyError } = await supa
      .from('weekly_summaries')
      .select('id')
      .eq('goal_id', goalId)
      .eq('user_id', userId)
      .limit(1);

    if (weeklyError) {
      console.error('Error checking weekly summaries:', weeklyError);
      return NextResponse.json({ error: 'Error checking dependencies' }, { status: 500 });
    }

    if (weeklySummaries && weeklySummaries.length > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar este objetivo porque tiene resúmenes semanales asociados.' 
      }, { status: 400 });
    }

    // Verificar si hay resúmenes mensuales que referencian este goal
    const { data: monthlySummaries, error: monthlyError } = await supa
      .from('monthly_summaries')
      .select('id')
      .eq('goal_id', goalId)
      .eq('user_id', userId)
      .limit(1);

    if (monthlyError) {
      console.error('Error checking monthly summaries:', monthlyError);
      return NextResponse.json({ error: 'Error checking dependencies' }, { status: 500 });
    }

    if (monthlySummaries && monthlySummaries.length > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar este objetivo porque tiene resúmenes mensuales asociados.' 
      }, { status: 400 });
    }

    // Si no hay dependencias, eliminar el goal
    const { error: deleteError } = await supa
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: 'Goal deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting goal:', err);
    return NextResponse.json({ error: err?.message ?? 'Invalid request' }, { status: 400 });
  }
}