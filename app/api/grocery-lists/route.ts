import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUserId } from '@/lib/auth/getUserId';
import { getUserSubscription } from '@/lib/subscription-service';
import { getLimit } from '@/lib/entitlements';

// GET - List user's grocery lists (Free)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const userId = await getUserId(request as unknown as Request);
    
    const { data: lists, error } = await supabase
      .from('grocery_lists')
      .select(`
        *,
        grocery_list_items (
          id,
          name,
          quantity,
          unit,
          category,
          is_checked,
          recipe_id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching grocery lists:', error);
      return NextResponse.json(
        { error: 'Failed to fetch grocery lists', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      lists: lists || [],
      success: true
    });

  } catch (error) {
    console.error('Error in grocery lists GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create grocery list (with limit check)
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const userId = await getUserId(request as unknown as Request);
    const body = await request.json();
    
    const { name } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'List name is required' },
        { status: 400 }
      );
    }

    // Check user's subscription status
    const subscription = await getUserSubscription(userId);
    const isPremium = !!(subscription && subscription.plan === 'premium' && 
                        (subscription.status === 'active' || subscription.status === 'trialing'));

    // Get current list count
    const { count: currentCount, error: countError } = await supabase
      .from('grocery_lists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Error counting grocery lists:', countError);
      return NextResponse.json(
        { error: 'Failed to check list count', details: countError.message },
        { status: 500 }
      );
    }

    // Check limit for free users only
    if (!isPremium) {
      const maxLists = getLimit('grocery_lists.lists', false);
      if (currentCount && currentCount >= maxLists) {
        return NextResponse.json({
          error: 'limit_reached',
          feature: 'grocery_lists',
          message: 'Free plan limit reached',
          current: currentCount,
          max: maxLists,
          plan: 'free',
          status: 403
        }, { status: 403 });
      }
    }

    const { data: list, error } = await supabase
      .from('grocery_lists')
      .insert({
        name,
        user_id: userId
      })
      .select(`
        *,
        grocery_list_items (
          id,
          name,
          quantity,
          unit,
          category,
          is_checked,
          recipe_id
        )
      `)
      .single();

    if (error) {
      console.error('Error creating grocery list:', error);
      return NextResponse.json(
        { error: 'Failed to create grocery list', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      list,
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error('Error in grocery lists POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update grocery list (Free if owned)
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const userId = await getUserId(request as unknown as Request);
    const body = await request.json();
    
    const { id, name } = body;
    
    if (!id || !name) {
      return NextResponse.json(
        { error: 'List ID and name are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existingList, error: fetchError } = await supabase
      .from('grocery_lists')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingList) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    if (existingList.user_id !== userId) {
      return NextResponse.json(
        { error: 'You can only update your own grocery lists' },
        { status: 403 }
      );
    }

    const { data: list, error } = await supabase
      .from('grocery_lists')
      .update({
        name,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        *,
        grocery_list_items (
          id,
          name,
          quantity,
          unit,
          category,
          is_checked,
          recipe_id
        )
      `)
      .single();

    if (error) {
      console.error('Error updating grocery list:', error);
      return NextResponse.json(
        { error: 'Failed to update grocery list', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      list,
      success: true
    });

  } catch (error) {
    console.error('Error in grocery lists PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete grocery list (Free if owned)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const userId = await getUserId(request as unknown as Request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'List ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existingList, error: fetchError } = await supabase
      .from('grocery_lists')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingList) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    if (existingList.user_id !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own grocery lists' },
        { status: 403 }
      );
    }

    // Delete items first
    const { error: itemsError } = await supabase
      .from('grocery_list_items')
      .delete()
      .eq('grocery_list_id', id);

    if (itemsError) {
      console.error('Error deleting grocery list items:', itemsError);
      // Continue with list deletion
    }

    // Delete the list
    const { error } = await supabase
      .from('grocery_lists')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting grocery list:', error);
      return NextResponse.json(
        { error: 'Failed to delete grocery list', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Error in grocery lists DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
