import { NextRequest, NextResponse } from 'next/server';
import { createServerClientWithCookies } from '@/lib/supabase/server';
import { requirePremiumFeature } from '@/lib/api-guards';
import type { Database } from '@/lib/types/database';

// GET - List user's private recipes (Premium)
export async function GET(request: NextRequest) {
  try {
    // Check premium access for private recipes
    const guardResult = await requirePremiumFeature(request, "recipes.private_edit");
    if (!guardResult.success) {
      return guardResult.response;
    }

    const response = NextResponse.next();
    const supabase = createServerClientWithCookies(request, response);
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        *,
        ingredients (
          id,
          name,
          amount
        ),
        tags (
          id,
          name
        )
      `)
      .eq('created_by', userId)
      .eq('is_private', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching private recipes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch private recipes', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      recipes: recipes || [],
      success: true
    });

  } catch (error) {
    console.error('Error in private recipes GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create private recipe (Premium)
export async function POST(request: NextRequest) {
  try {
    // Check premium access for private recipes
    const guardResult = await requirePremiumFeature(request, "recipes.private_edit");
    if (!guardResult.success) {
      return guardResult.response;
    }

    const response = NextResponse.next();
    const supabase = createServerClientWithCookies(request, response);
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    const { name, description, instructions, ingredients, tags, ...recipeData } = body;
    
    if (!name || !instructions) {
      return NextResponse.json(
        { error: 'Recipe name and instructions are required' },
        { status: 400 }
      );
    }

    // Create the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        ...recipeData,
        name,
        description: description || '',
        instructions,
        created_by: userId,
        is_private: true
      })
      .select()
      .single();

    if (recipeError) {
      console.error('Error creating private recipe:', recipeError);
      return NextResponse.json(
        { error: 'Failed to create private recipe', details: recipeError.message },
        { status: 500 }
      );
    }

    // Add ingredients if provided
    if (ingredients && ingredients.length > 0) {
      const ingredientInserts = ingredients.map((ing: any) => ({
        recipe_id: recipe.id,
        name: ing.name,
        amount: ing.amount
      }));

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredientInserts);

      if (ingredientsError) {
        console.error('Error adding ingredients:', ingredientsError);
        // Continue without failing the request
      }
    }

    // Add tags if provided
    if (tags && tags.length > 0) {
      const tagInserts = tags.map((tag: any) => ({
        recipe_id: recipe.id,
        name: tag.name
      }));

      const { error: tagsError } = await supabase
        .from('recipe_tags')
        .insert(tagInserts);

      if (tagsError) {
        console.error('Error adding tags:', tagsError);
        // Continue without failing the request
      }
    }

    return NextResponse.json({
      recipe,
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error('Error in private recipes POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update private recipe (Premium)
export async function PUT(request: NextRequest) {
  try {
    // Check premium access for private recipes
    const guardResult = await requirePremiumFeature(request, "recipes.private_edit");
    if (!guardResult.success) {
      return guardResult.response;
    }

    const response = NextResponse.next();
    const supabase = createServerClientWithCookies(request, response);
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    const { id, name, description, instructions, ingredients, tags, ...recipeData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }
    
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      return NextResponse.json({ error: 'Invalid recipe ID format' }, { status: 400 });
    }
    
    const typedId = id as Database['public']['Tables']['recipes']['Row']['id'];
    
    if (!typedId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existingRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select('created_by, is_private, name, description, instructions')
      .eq('id', id)
      .single();

    if (fetchError || !existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    if (existingRecipe.created_by !== userId || !existingRecipe.is_private) {
      return NextResponse.json(
        { error: 'You can only update your own private recipes' },
        { status: 403 }
      );
    }

    // Update the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .update({
        ...recipeData,
        name: name || existingRecipe.name,
        description: description || existingRecipe.description,
        instructions: instructions || existingRecipe.instructions,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single();

    if (recipeError) {
      console.error('Error updating private recipe:', recipeError);
      return NextResponse.json(
        { error: 'Failed to update private recipe', details: recipeError.message },
        { status: 500 }
      );
    }

    // Update ingredients if provided
    if (ingredients) {
      // Delete existing ingredients
      await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', id);

      // Insert new ingredients
      if (ingredients.length > 0) {
        const ingredientInserts = ingredients.map((ing: any) => ({
          recipe_id: id,
          name: ing.name,
          amount: ing.amount
        }));

        await supabase
          .from('recipe_ingredients')
          .insert(ingredientInserts);
      }
    }

    // Update tags if provided
    if (tags) {
      // Delete existing tags
      await supabase
        .from('recipe_tags')
        .delete()
        .eq('recipe_id', id);

      // Insert new tags
      if (tags.length > 0) {
        const tagInserts = tags.map((tag: any) => ({
          recipe_id: id,
          name: tag.name
        }));

        await supabase
          .from('recipe_tags')
          .insert(tagInserts);
      }
    }

    return NextResponse.json({
      recipe,
      success: true
    });

  } catch (error) {
    console.error('Error in private recipes PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete private recipe (Premium)
export async function DELETE(request: NextRequest) {
  try {
    // Check premium access for private recipes
    const guardResult = await requirePremiumFeature(request, "recipes.private_edit");
    if (!guardResult.success) {
      return guardResult.response;
    }

    const response = NextResponse.next();
    const supabase = createServerClientWithCookies(request, response);
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const rawId = searchParams.get('id');
    
    if (!rawId?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      return NextResponse.json({ error: 'Invalid recipe ID format' }, { status: 400 });
    }
    
    const id = rawId as Database['public']['Tables']['recipes']['Row']['id'];
    
    if (!id) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existingRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select('created_by, is_private')
      .eq('id', id)
      .single();

    if (fetchError || !existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    if (existingRecipe.created_by !== userId || !existingRecipe.is_private) {
      return NextResponse.json(
        { error: 'You can only delete your own private recipes' },
        { status: 403 }
      );
    }

    // Delete related data first
    await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', id);

    await supabase
      .from('recipe_tags')
      .delete()
      .eq('recipe_id', id);

    // Delete the recipe
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('created_by', userId);

    if (error) {
      console.error('Error deleting private recipe:', error);
      return NextResponse.json(
        { error: 'Failed to delete private recipe', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Error in private recipes DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
