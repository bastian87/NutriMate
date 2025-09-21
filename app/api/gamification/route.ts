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
    
    // Calculate level and XP to next level (simplified formula)
    const level = Math.floor(totalXp / 1000) + 1;
    const xpToNextLevel = 1000 - (totalXp % 1000);
    
    // Calculate weekly and monthly XP
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const weeklyXp = (xpRows ?? [])
      .filter(r => new Date(r.date) >= weekAgo)
      .reduce((a, r) => a + (r.amount ?? 0), 0);
      
    const monthlyXp = (xpRows ?? [])
      .filter(r => new Date(r.date) >= monthAgo)
      .reduce((a, r) => a + (r.amount ?? 0), 0);

    // Calculate real achievements based on user data
    const currentStreak = s?.current ?? 0;
    const bestStreak = s?.best ?? 0;
    
    const achievements = [
      {
        id: 'first_goal',
        name: 'Primer Objetivo',
        description: 'Crea tu primer objetivo nutricional',
        unlocked: true,
        unlockedAt: new Date().toISOString()
      },
      {
        id: 'week_streak',
        name: 'Racha Semanal',
        description: 'Mantén una racha de 7 días consecutivos',
        unlocked: currentStreak >= 7,
        unlockedAt: currentStreak >= 7 ? new Date().toISOString() : undefined
      },
      {
        id: 'month_streak',
        name: 'Racha Mensual',
        description: 'Mantén una racha de 30 días consecutivos',
        unlocked: currentStreak >= 30,
        unlockedAt: currentStreak >= 30 ? new Date().toISOString() : undefined
      },
      {
        id: 'xp_milestone_1000',
        name: 'Primer Milenio',
        description: 'Alcanza 1000 puntos de experiencia',
        unlocked: totalXp >= 1000,
        unlockedAt: totalXp >= 1000 ? new Date().toISOString() : undefined
      },
      {
        id: 'xp_milestone_5000',
        name: 'Experto',
        description: 'Alcanza 5000 puntos de experiencia',
        unlocked: totalXp >= 5000,
        unlockedAt: totalXp >= 5000 ? new Date().toISOString() : undefined
      }
    ];

    return NextResponse.json({
      currentStreak: s?.current ?? 0,
      longestStreak: s?.best ?? 0,
      totalXp,
      level,
      xpToNextLevel,
      weeklyXp,
      monthlyXp,
      achievements
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 });
  }
}