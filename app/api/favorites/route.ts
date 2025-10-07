import { NextRequest, NextResponse } from 'next/server';
import { createServerClientWithCookies } from '@/lib/supabase/server';
import { getUserSubscription } from '@/lib/subscription-service';
import { getLimit } from '@/lib/entitlements';

// GET - List user's favorite recipes (Free)
export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.next();
    const supabase = createServerClientWithCookies(request, response);
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Try to get favorites, but handle the case where recipes table is empty
    let { data: favorites, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // If there's an error, it might be because the table doesn't exist or is empty
    if (error) {
      console.log('Favorites GET: Error occurred, returning empty list:', error);
      favorites = [];
      error = null;
    }

    if (error) {
      console.error('Error fetching favorites:', error);
      return NextResponse.json(
        { error: 'Failed to fetch favorites', details: String(error) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      favorites: favorites || [],
      success: true
    });

  } catch (error) {
    console.error('Error in favorites GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Add recipe to favorites (with limit check)
export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.next();
    const supabase = createServerClientWithCookies(request, response);
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    const { recipe_id } = body;
    
    if (!recipe_id) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Check if already favorited
    const { data: existingFavorite, error: checkError } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('recipe_id', recipe_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing favorite:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing favorite', details: checkError.message },
        { status: 500 }
      );
    }

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Recipe is already in favorites' },
        { status: 409 }
      );
    }

    // Check user's subscription status
    const subscription = await getUserSubscription(userId);
    const isPremium = !!(subscription && subscription.plan === 'premium' && 
                        (subscription.status === 'active' || subscription.status === 'trialing'));

    // Get current favorites count
    const { count: currentCount, error: countError } = await supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Error counting favorites:', countError);
      return NextResponse.json(
        { error: 'Failed to check favorites count', details: countError.message },
        { status: 500 }
      );
    }

    // Check limit for free users
    if (!isPremium) {
      const maxFavorites = getLimit('favorites', false);
      if (currentCount && currentCount >= maxFavorites) {
        return NextResponse.json({
          error: 'limit_reached',
          feature: 'favorites',
          message: 'Free plan limit reached',
          current: currentCount,
          max: maxFavorites,
          plan: 'free',
          status: 403
        }, { status: 403 });
      }
    }

    const { data: favorite, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        recipe_id
      })
      .select(`
        *,
        recipes (
          id,
          name,
          description,
          image_url,
          prep_time_minutes,
          cook_time_minutes,
          servings,
          calories,
          protein,
          carbs,
          fat,
          fiber,
          sugar,
          sodium,
          difficulty_level,
          cuisine_type,
          meal_type,
          instructions,
          created_at,
          updated_at,
          created_by,
          average_rating,
          rating_count
        )
      `)
      .single();

    if (error) {
      console.error('Error creating favorite:', error);
      return NextResponse.json(
        { error: 'Failed to add to favorites', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      favorite,
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error('Error in favorites POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove recipe from favorites (Free)
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.next();
    const supabase = createServerClientWithCookies(request, response);
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const recipe_id = searchParams.get('recipe_id');
    
    if (!recipe_id) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipe_id);

    if (error) {
      console.error('Error deleting favorite:', error);
      return NextResponse.json(
        { error: 'Failed to remove from favorites', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Error in favorites DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
