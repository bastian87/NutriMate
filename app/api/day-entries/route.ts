import { NextRequest, NextResponse } from 'next/server';
import { DayEntryUpsertSchema } from '@/lib/validation/zod';
import { createServerClientWithCookies } from '@/lib/supabase/server';
import { evaluateDay } from '@/lib/nutri/evaluateDay';
import type { MacroGroup } from '@/types/nutri';
import { updateStreakForDayCompletion, awardXpForDayCompletion } from '@/lib/gamification/gamification-service';

export async function GET(req: NextRequest) {
  const response = NextResponse.next();
  const supa = createServerClientWithCookies(req, response);
  
  try {
    const { data: { session }, error: authError } = await supa.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    const goalId = url.searchParams.get('goalId');

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    console.log('Day Entries GET - Fetching entries for:', { userId, date, goalId });

    // Get day entry
    const { data: dayEntry, error: dayError } = await supa
      .from('day_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (dayError) {
      console.error('Day Entries GET - Error fetching day entry:', dayError);
      throw dayError;
    }

    if (!dayEntry) {
      return NextResponse.json({ dayEntry: null, items: [] });
    }

    // Get day entry items with ingredient details
    const { data: items, error: itemsError } = await supa
      .from('day_entry_items')
      .select(`
        id,
        ingredient_id,
        quantity_grams,
        kcal,
        group,
        ingredients (
          id,
          name,
          locale,
          group,
          kcal_per_100g
        )
      `)
      .eq('day_entry_id', dayEntry.id);

    if (itemsError) {
      console.error('Day Entries GET - Error fetching items:', itemsError);
      throw itemsError;
    }

    // Transform items to match expected format
    const transformedItems = items?.map(item => ({
      id: item.id,
      ingredientId: item.ingredient_id,
      quantityGrams: item.quantity_grams,
      kcal: item.kcal,
      group: item.group,
      ingredient: item.ingredients
    })) || [];

    console.log('Day Entries GET - Success:', { dayEntry, itemsCount: transformedItems.length });

    return NextResponse.json({
      dayEntry,
      items: transformedItems
    });

  } catch (err: any) {
    console.error('Day Entries GET - Error:', err);
    return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const response = NextResponse.next();
  const supa = createServerClientWithCookies(req, response);
  
  try {
    const { data: { session }, error: authError } = await supa.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const rawBody = await req.json();
    console.log('Day Entries API - Raw body received:', rawBody);
    
    let body;
    try {
      body = DayEntryUpsertSchema.parse(rawBody);
    } catch (validationError) {
      console.error('Day Entries API - Validation error:', validationError);
      throw validationError;
    }
    
    const { date, goalId, items } = body;
    
    console.log('Day Entries API - Received data:', { userId, date, goalId, items });

    // Test Supabase connection
    const { data: testData, error: testError } = await supa
      .from('ingredients')
      .select('count')
      .limit(1);
    console.log('Day Entries API - Supabase connection test:', { testData, testError });

    // Fetch ingredients to compute kcal + group
    const ingredientIds = items.map(i => i.ingredientId);
    const { data: ing, error: ingErr } = await supa
      .from('ingredients')
      .select('id, "group", kcal_per_100g')
      .in('id', ingredientIds);
    if (ingErr) throw ingErr;
    if (!ing || ing.length !== ingredientIds.length) {
      throw new Error('Some ingredients not found');
    }

    const enriched = items.map(i => {
      const found = ing.find(g => g.id === i.ingredientId)!;
      const kcal = Math.round((found.kcal_per_100g * i.quantityGrams) / 100);
      return { ...i, kcal, group: found.group as MacroGroup };
    });

    // Get target kcal from goal
    const { data: goal, error: goalErr } = await supa
      .from('goals')
      .select('id, target_kcal_day')
      .eq('id', goalId)
      .single();
    if (goalErr) throw goalErr;

    const evalRes = evaluateDay(enriched, goal.target_kcal_day);

    // Upsert day_entries
    const dayEntryData = {
      user_id: userId,
      date,
      goal_id: goalId,
      total_kcal: evalRes.totalsKcal,
      has_carb: evalRes.flags.hasCarb,
      has_protein: evalRes.flags.hasProtein,
      has_fat: evalRes.flags.hasFat,
      has_vegfruit: evalRes.flags.hasVegFruit,
      extras_count: evalRes.flags.extrasCount,
      is_success: evalRes.isSuccess,
    };
    
    console.log('Day Entries API - Upserting day entry:', dayEntryData);
    
    const { data: dayRow, error: upErr } = await supa
      .from('day_entries')
      .upsert(dayEntryData, { onConflict: 'user_id,date' })
      .select('id')
      .single();
    if (upErr) throw upErr;
    
    console.log('Day Entries API - Day entry upserted successfully:', dayRow);

    // Test if we can query day_entries
    const { data: testDayEntries, error: testDayError } = await supa
      .from('day_entries')
      .select('id, date, user_id')
      .eq('user_id', userId)
      .limit(1);
    console.log('Day Entries API - Test query day_entries:', { testDayEntries, testDayError });

    // Replace items
    await supa.from('day_entry_items').delete().eq('day_entry_id', dayRow.id);
    const toInsert = enriched.map(i => ({
      day_entry_id: dayRow.id,
      ingredient_id: i.ingredientId,
      quantity_grams: i.quantityGrams,
      kcal: i.kcal!,
      group: i.group!,
    }));
    console.log('Day Entries API - Inserting items:', toInsert);
    
    // Test if we can query day_entry_items
    const { data: testItems, error: testItemsError } = await supa
      .from('day_entry_items')
      .select('id')
      .limit(1);
    console.log('Day Entries API - Test query day_entry_items:', { testItems, testItemsError });
    
    const { data: insertedItems, error: insErr } = await supa.from('day_entry_items').insert(toInsert).select('id');
    if (insErr) {
      console.error('Day Entries API - Error inserting items:', insErr);
      throw insErr;
    }
    
    console.log('Day Entries API - Items inserted successfully:', insertedItems);

    // Update streaks and award XP using gamification service
    let currentStreak = 0;
    
    if (evalRes.isSuccess) {
      // Update streak for day completion
      const streakResult = await updateStreakForDayCompletion(supa, userId, date);
      currentStreak = streakResult.current;

      // Award XP for completing a day (includes streak bonuses)
      await awardXpForDayCompletion(supa, userId, dayRow.id, date, currentStreak);
    }

    return NextResponse.json({
      id: dayRow.id,
      date,
      totalsKcal: evalRes.totalsKcal,
      flags: evalRes.flags,
      isSuccess: evalRes.isSuccess,
      goalId,
      streakCurrent: currentStreak,
    });
  } catch (err: any) {
    console.error('Day Entries API - Error:', err);
    return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 });
  }
}