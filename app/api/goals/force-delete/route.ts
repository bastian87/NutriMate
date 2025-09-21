import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUserId } from '@/lib/auth/getUserId';

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
