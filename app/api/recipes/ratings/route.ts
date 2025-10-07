import { NextRequest, NextResponse } from 'next/server';
import { createServerClientWithCookies } from '@/lib/supabase/server';
import type { Database } from '@/lib/types/database';

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit: 5 ratings per user per recipe per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5;

function getRateLimitKey(userId: string, recipeId: string): string {
  return `rating:${userId}:${recipeId}`;
}

function checkRateLimit(userId: string, recipeId: string): { allowed: boolean; remaining: number; resetTime: number } {
  const key = getRateLimitKey(userId, recipeId);
  const now = Date.now();
  const limit = rateLimitMap.get(key);

  if (!limit || now > limit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetTime: limit.resetTime };
  }

  // Increment count
  limit.count++;
  rateLimitMap.set(key, limit);
  return { allowed: true, remaining: RATE_LIMIT_MAX - limit.count, resetTime: limit.resetTime };
}

// GET - Get recipe ratings (Free)
export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.next();
    const supabase = createServerClientWithCookies(request, response);
    
    const { searchParams } = new URL(request.url);
    const rawRecipeId = searchParams.get('recipe_id');
    
    if (!rawRecipeId?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      return NextResponse.json({ error: 'Invalid recipe ID format' }, { status: 400 });
    }
    
    const recipe_id = rawRecipeId as Database['public']['Tables']['recipes']['Row']['id'];
    
    if (!recipe_id) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    const { data: ratings, error } = await supabase
      .from('recipe_ratings')
      .select(`
        id,
        rating,
        review,
        created_at,
        users!inner(
          id,
          username,
          full_name
        )
      `)
      .eq('recipe_id', recipe_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recipe ratings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ratings', details: error.message },
        { status: 500 }
      );
    }

    // Calculate average rating
    const totalRatings = ratings?.length || 0;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;

    return NextResponse.json({
      ratings: ratings || [],
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalRatings,
      success: true
    });

  } catch (error) {
    console.error('Error in recipe ratings GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Add/update recipe rating (Free with rate limit)
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
    
    const { recipe_id, rating, review } = body;
    
    if (!recipe_id || !rating) {
      return NextResponse.json(
        { error: 'Recipe ID and rating are required' },
        { status: 400 }
      );
    }
    
    if (!recipe_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      return NextResponse.json({ error: 'Invalid recipe ID format' }, { status: 400 });
    }
    
    const typedRecipeId = recipe_id as Database['public']['Tables']['recipes']['Row']['id'];
    
    if (!typedRecipeId || !rating) {
      return NextResponse.json(
        { error: 'Recipe ID and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(userId, recipe_id);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        error: 'rate_limited',
        feature: 'ratings',
        message: 'Too many requests',
        status: 429
      }, { status: 429 });
    }

    // Check if user already rated this recipe
    const { data: existingRating, error: checkError } = await supabase
      .from('recipe_ratings')
      .select('id')
      .eq('user_id', userId)
      .eq('recipe_id', recipe_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing rating:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing rating', details: checkError.message },
        { status: 500 }
      );
    }

    let ratingData;
    if (existingRating) {
      // Update existing rating
      const { data, error } = await supabase
        .from('recipe_ratings')
        .update({
          rating,
          review: review || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRating.id)
        .select(`
          id,
          rating,
          review,
          created_at,
          updated_at,
          users!inner(
            id,
            username,
            full_name
          )
        `)
        .single();

      if (error) {
        console.error('Error updating rating:', error);
        return NextResponse.json(
          { error: 'Failed to update rating', details: error.message },
          { status: 500 }
        );
      }
      ratingData = data;
    } else {
      // Create new rating
      const { data, error } = await supabase
        .from('recipe_ratings')
        .insert({
          user_id: userId,
          recipe_id,
          rating,
          review: review || null
        })
        .select(`
          id,
          rating,
          review,
          created_at,
          updated_at,
          users!inner(
            id,
            username,
            full_name
          )
        `)
        .single();

      if (error) {
        console.error('Error creating rating:', error);
        return NextResponse.json(
          { error: 'Failed to create rating', details: error.message },
          { status: 500 }
        );
      }
      ratingData = data;
    }

    // Update recipe's average rating
    const { data: allRatings, error: ratingsError } = await supabase
      .from('recipe_ratings')
      .select('rating')
      .eq('recipe_id', recipe_id);

    if (!ratingsError && allRatings) {
      const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      const roundedAverage = Math.round(averageRating * 10) / 10;

      await supabase
        .from('recipes')
        .update({
          average_rating: roundedAverage,
          rating_count: allRatings.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', recipe_id);
    }

    return NextResponse.json({
      rating: ratingData,
      success: true,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetTime: new Date(rateLimit.resetTime).toISOString()
      }
    }, { status: existingRating ? 200 : 201 });

  } catch (error) {
    console.error('Error in recipe ratings POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove recipe rating (Free)
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
    const rawRecipeId = searchParams.get('recipe_id');
    
    if (!rawRecipeId?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      return NextResponse.json({ error: 'Invalid recipe ID format' }, { status: 400 });
    }
    
    const recipe_id = rawRecipeId as Database['public']['Tables']['recipes']['Row']['id'];
    
    if (!recipe_id) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('recipe_ratings')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipe_id);

    if (error) {
      console.error('Error deleting rating:', error);
      return NextResponse.json(
        { error: 'Failed to remove rating', details: error.message },
        { status: 500 }
      );
    }

    // Update recipe's average rating
    const { data: allRatings, error: ratingsError } = await supabase
      .from('recipe_ratings')
      .select('rating')
      .eq('recipe_id', recipe_id);

    if (!ratingsError) {
      const averageRating = allRatings && allRatings.length > 0 
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length 
        : 0;
      const roundedAverage = Math.round(averageRating * 10) / 10;

      await supabase
        .from('recipes')
        .update({
          average_rating: roundedAverage,
          rating_count: allRatings?.length || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', recipe_id);
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Error in recipe ratings DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
