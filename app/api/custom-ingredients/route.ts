import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUserId } from '@/lib/auth/getUserId';
import { requirePremiumFeature } from '@/lib/api-guards';

// GET - List custom ingredients (Free)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const userId = await getUserId(request as unknown as Request);
    
    const { data: ingredients, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('created_by', userId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching custom ingredients:', error);
      return NextResponse.json(
        { error: 'Failed to fetch custom ingredients', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ingredients: ingredients || [],
      success: true
    });

  } catch (error) {
    console.error('Error in custom ingredients GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create custom ingredient (Premium)
export async function POST(request: NextRequest) {
  try {
    // Check premium access for custom ingredients
    const guardResult = await requirePremiumFeature(request, "custom_ingredients");
    if (!guardResult.success) {
      return guardResult.response;
    }

    const supabase = createServerClient();
    const userId = await getUserId(request as unknown as Request);
    const body = await request.json();
    
    const { name, nutrition_data } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Ingredient name is required' },
        { status: 400 }
      );
    }

    const { data: ingredient, error } = await supabase
      .from('ingredients')
      .insert({
        name,
        nutrition_data: nutrition_data || {},
        created_by: userId,
        is_custom: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating custom ingredient:', error);
      return NextResponse.json(
        { error: 'Failed to create custom ingredient', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ingredient,
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error('Error in custom ingredients POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update custom ingredient (Premium)
export async function PUT(request: NextRequest) {
  try {
    // Check premium access for custom ingredients
    const guardResult = await requirePremiumFeature(request, "custom_ingredients");
    if (!guardResult.success) {
      return guardResult.response;
    }

    const supabase = createServerClient();
    const userId = await getUserId(request as unknown as Request);
    const body = await request.json();
    
    const { id, name, nutrition_data } = body;
    
    if (!id || !name) {
      return NextResponse.json(
        { error: 'Ingredient ID and name are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existingIngredient, error: fetchError } = await supabase
      .from('ingredients')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existingIngredient) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    if (existingIngredient.created_by !== userId) {
      return NextResponse.json(
        { error: 'You can only update your own custom ingredients' },
        { status: 403 }
      );
    }

    const { data: ingredient, error } = await supabase
      .from('ingredients')
      .update({
        name,
        nutrition_data: nutrition_data || {},
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating custom ingredient:', error);
      return NextResponse.json(
        { error: 'Failed to update custom ingredient', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ingredient,
      success: true
    });

  } catch (error) {
    console.error('Error in custom ingredients PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete custom ingredient (Premium)
export async function DELETE(request: NextRequest) {
  try {
    // Check premium access for custom ingredients
    const guardResult = await requirePremiumFeature(request, "custom_ingredients");
    if (!guardResult.success) {
      return guardResult.response;
    }

    const supabase = createServerClient();
    const userId = await getUserId(request as unknown as Request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Ingredient ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existingIngredient, error: fetchError } = await supabase
      .from('ingredients')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existingIngredient) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    if (existingIngredient.created_by !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own custom ingredients' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', id)
      .eq('created_by', userId);

    if (error) {
      console.error('Error deleting custom ingredient:', error);
      return NextResponse.json(
        { error: 'Failed to delete custom ingredient', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Error in custom ingredients DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
