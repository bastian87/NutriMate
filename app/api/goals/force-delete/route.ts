import { NextRequest, NextResponse } from 'next/server';
import { createServerClientWithCookies } from '@/lib/supabase/server';
import type { Database } from '@/lib/types/database';

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

    console.log(`🗑️ Force deleting goal ${goalId} for user ${userId}`);

    // Eliminar en cascada: primero las dependencias, luego el goal
    // 1. Eliminar day_entry_items que referencian day_entries de este goal
    const { data: dayEntries, error: dayEntriesError } = await supa
      .from('day_entries')
      .select('id')
      .eq('goal_id', goalId)
      .eq('user_id', userId);

    if (dayEntriesError) {
      console.error('Error fetching day entries:', dayEntriesError);
      return NextResponse.json({ error: 'Error fetching dependencies' }, { status: 500 });
    }

    if (dayEntries && dayEntries.length > 0) {
      const dayEntryIds = dayEntries.map(entry => entry.id);
      
      // Eliminar day_entry_items
      const { error: itemsError } = await supa
        .from('day_entry_items')
        .delete()
        .in('day_entry_id', dayEntryIds);

      if (itemsError) {
        console.error('Error deleting day entry items:', itemsError);
        return NextResponse.json({ error: 'Error deleting day entry items' }, { status: 500 });
      }

      // Eliminar day_entries
      const { error: entriesError } = await supa
        .from('day_entries')
        .delete()
        .eq('goal_id', goalId)
        .eq('user_id', userId);

      if (entriesError) {
        console.error('Error deleting day entries:', entriesError);
        return NextResponse.json({ error: 'Error deleting day entries' }, { status: 500 });
      }

      console.log(`✅ Deleted ${dayEntries.length} day entries and their items`);
    }

    // 2. Eliminar resúmenes semanales
    const { error: weeklyError } = await supa
      .from('weekly_summaries')
      .delete()
      .eq('goal_id', goalId)
      .eq('user_id', userId);

    if (weeklyError) {
      console.error('Error deleting weekly summaries:', weeklyError);
      return NextResponse.json({ error: 'Error deleting weekly summaries' }, { status: 500 });
    }

    // 3. Eliminar resúmenes mensuales
    const { error: monthlyError } = await supa
      .from('monthly_summaries')
      .delete()
      .eq('goal_id', goalId)
      .eq('user_id', userId);

    if (monthlyError) {
      console.error('Error deleting monthly summaries:', monthlyError);
      return NextResponse.json({ error: 'Error deleting monthly summaries' }, { status: 500 });
    }

    // 4. Finalmente, eliminar el goal
    const { error: deleteError } = await supa
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting goal:', deleteError);
      return NextResponse.json({ error: 'Error deleting goal' }, { status: 500 });
    }

    console.log(`✅ Successfully force deleted goal ${goalId}`);

    return NextResponse.json({ 
      message: 'Goal and all associated data deleted successfully',
      deletedData: {
        dayEntries: dayEntries?.length || 0,
        weeklySummaries: 'deleted',
        monthlySummaries: 'deleted'
      }
    });
  } catch (err: any) {
    console.error('Error force deleting goal:', err);
    return NextResponse.json({ error: err?.message ?? 'Invalid request' }, { status: 400 });
  }
}
