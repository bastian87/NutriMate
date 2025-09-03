import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUserId } from '@/lib/auth/getUserId';

export async function GET(req: NextRequest) {
  const supa = createServerClient();
  try {
    const userId = await getUserId(req as unknown as Request);

    const [{ data: s, error: sErr }, { data: xpRows, error: xErr }] = await Promise.all([
      supa.from('streaks').select('current,best').eq('user_id', userId).maybeSingle(),
      supa.from('xp_ledger').select('amount,reason,date').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    ]);
    if (sErr) throw sErr;
    if (xErr) throw xErr;

    const totalXp = (xpRows ?? []).reduce((a, r) => a + (r.amount ?? 0), 0);

    return NextResponse.json({
      streak: { current: s?.current ?? 0, best: s?.best ?? 0 },
      totalXp,
      lastReasons: xpRows ?? [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 });
  }
}