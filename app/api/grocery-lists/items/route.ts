import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUserId } from '@/lib/auth/getUserId';

// GET - List items in a grocery list (Free if owned)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const userId = await getUserId(request as unknown as Request);
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId');
    
    if (!listId) {
      return NextResponse.json(
        { error: 'List ID is required' },
        { status: 400 }
      );
    }

    // Verify list ownership
    const { data: list, error: listError } = await supabase
      .from('grocery_lists')
      .select('user_id')
      .eq('id', listId)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    if (list.user_id !== userId) {
      return NextResponse.json(
        { error: 'You can only view items from your own grocery lists' },
        { status: 403 }
      );
    }

    const { data: items, error } = await supabase
      .from('grocery_list_items')
      .select('*')
      .eq('grocery_list_id', listId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching grocery list items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch grocery list items', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: items || [],
      success: true
    });

  } catch (error) {
    console.error('Error in grocery list items GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Add item to grocery list (Free if owned)
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const userId = await getUserId(request as unknown as Request);
    const body = await request.json();
    
    const { grocery_list_id, name, quantity, unit, category, recipe_id } = body;
    
    if (!grocery_list_id || !name) {
      return NextResponse.json(
        { error: 'List ID and item name are required' },
        { status: 400 }
      );
    }

    // Verify list ownership
    const { data: list, error: listError } = await supabase
      .from('grocery_lists')
      .select('user_id')
      .eq('id', grocery_list_id)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    if (list.user_id !== userId) {
      return NextResponse.json(
        { error: 'You can only add items to your own grocery lists' },
        { status: 403 }
      );
    }

    const { data: item, error } = await supabase
      .from('grocery_list_items')
      .insert({
        grocery_list_id,
        name,
        quantity: quantity || null,
        unit: unit || null,
        category: category || null,
        recipe_id: recipe_id || null,
        is_checked: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating grocery list item:', error);
      return NextResponse.json(
        { error: 'Failed to create grocery list item', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      item,
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error('Error in grocery list items POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update grocery list item (Free if owned)
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const userId = await getUserId(request as unknown as Request);
    const body = await request.json();
    
    const { id, name, quantity, unit, category, is_checked } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership through the grocery list
    const { data: item, error: fetchError } = await supabase
      .from('grocery_list_items')
      .select(`
        *,
        grocery_lists!inner(user_id)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    if (item.grocery_lists.user_id !== userId) {
      return NextResponse.json(
        { error: 'You can only update items from your own grocery lists' },
        { status: 403 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (unit !== undefined) updateData.unit = unit;
    if (category !== undefined) updateData.category = category;
    if (is_checked !== undefined) updateData.is_checked = is_checked;

    const { data: updatedItem, error } = await supabase
      .from('grocery_list_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating grocery list item:', error);
      return NextResponse.json(
        { error: 'Failed to update grocery list item', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      item: updatedItem,
      success: true
    });

  } catch (error) {
    console.error('Error in grocery list items PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete grocery list item (Free if owned)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const userId = await getUserId(request as unknown as Request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership through the grocery list
    const { data: item, error: fetchError } = await supabase
      .from('grocery_list_items')
      .select(`
        *,
        grocery_lists!inner(user_id)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    if (item.grocery_lists.user_id !== userId) {
      return NextResponse.json(
        { error: 'You can only delete items from your own grocery lists' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('grocery_list_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting grocery list item:', error);
      return NextResponse.json(
        { error: 'Failed to delete grocery list item', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Error in grocery list items DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
