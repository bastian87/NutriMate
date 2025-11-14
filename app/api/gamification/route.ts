import { NextRequest, NextResponse } from 'next/server';
import { createServerClientWithCookies } from '@/lib/supabase/server';
import { getGamificationData } from '@/lib/gamification/gamification-service';

export async function GET(req: NextRequest) {
  const response = NextResponse.next();
  const supa = createServerClientWithCookies(req, response);
  
  try {
    const { data: { session }, error: authError } = await supa.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;

    // Get comprehensive gamification data using the service
    const gamificationData = await getGamificationData(supa, userId);

    return NextResponse.json({
      currentStreak: gamificationData.currentStreak,
      longestStreak: gamificationData.bestStreak,
      totalXp: gamificationData.totalXp,
      level: gamificationData.level,
      xpInCurrentLevel: gamificationData.xpInCurrentLevel,
      xpToNextLevel: gamificationData.xpToNextLevel,
      progressPercent: gamificationData.progressPercent,
      weeklyXp: gamificationData.weeklyXp,
      monthlyXp: gamificationData.monthlyXp,
      todayXp: gamificationData.todayXp,
      dailyXpGoal: 30,
      achievements: gamificationData.achievements,
      totalMeals: gamificationData.totalMeals
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 });
  }
}
