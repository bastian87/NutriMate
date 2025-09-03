import { NextRequest, NextResponse } from 'next/server';
import { DayEntryUpsertSchema } from '@/lib/validation/zod';
import { createServerClient } from '@/lib/supabase/server';
import { getUserId } from '@/lib/auth/getUserId';
import { evaluateDay } from '@/lib/nutri/evaluateDay';
import type { MacroGroup } from '@/types/nutri';

export async function POST(req: NextRequest) {
  const supa = createServerClient();
  try {
    const userId = await getUserId(req as unknown as Request);
    const body = DayEntryUpsertSchema.parse(await req.json());
    const { date, goalId, items } = body;

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
    const { data: dayRow, error: upErr } = await supa
      .from('day_entries')
      .upsert({
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
      }, { onConflict: 'user_id,date' })
      .select('id')
      .single();
    if (upErr) throw upErr;

    // Replace items
    await supa.from('day_entry_items').delete().eq('day_entry_id', dayRow.id);
    const toInsert = enriched.map(i => ({
      day_entry_id: dayRow.id,
      ingredient_id: i.ingredientId,
      quantity_grams: i.quantityGrams,
      kcal: i.kcal!,
      group: i.group!,
    }));
    const { error: insErr } = await supa.from('day_entry_items').insert(toInsert);
    if (insErr) throw insErr;

    // Streaks + XP
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);

    let current = 0;
    const { data: y, error: yErr } = await supa
      .from('day_entries')
      .select('is_success')
      .eq('user_id', userId)
      .eq('date', yStr)
      .maybeSingle();
    if (yErr) throw yErr;

    if (evalRes.isSuccess) {
      const { data: s, error: sErr } = await supa
        .from('streaks')
        .select('id,current,best')
        .eq('user_id', userId)
        .maybeSingle();
      if (sErr) throw sErr;

      const nextCurrent = (y?.is_success ? (s?.current ?? 0) + 1 : 1);
      const nextBest = Math.max(s?.best ?? 0, nextCurrent);

      if (s?.id) {
        await supa.from('streaks').update({ current: nextCurrent, best: nextBest }).eq('id', s.id);
      } else {
        await supa.from('streaks').insert({ user_id: userId, current: nextCurrent, best: nextBest });
      }
      current = nextCurrent;

      await supa.from('xp_ledger').insert({
        user_id: userId, date, reason: 'day', amount: 50, related_id: dayRow.id,
      });
      if (current >= 4) {
        await supa.from('xp_ledger').insert({
          user_id: userId, date, reason: 'streak', amount: 25, related_id: dayRow.id,
        });
      }
    }

    return NextResponse.json({
      id: dayRow.id,
      date,
      totalsKcal: evalRes.totalsKcal,
      flags: evalRes.flags,
      isSuccess: evalRes.isSuccess,
      goalId,
      streakCurrent: current,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 });
  }
}