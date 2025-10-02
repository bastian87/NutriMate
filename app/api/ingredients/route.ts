import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Ingredients API called');
    
    // Check environment variables
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
    console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');
    
    const supabase = createServerClient();
    console.log('Supabase client created');
    
    // Get ingredients from database
    console.log('Querying ingredients table...');
    const { data: ingredients, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name', { ascending: true });

    console.log('Query result:', { ingredients, error });

    if (error) {
      console.error('Error fetching ingredients:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ingredients', details: error.message },
        { status: 500 }
      );
    }

    console.log('Returning ingredients:', ingredients?.length || 0);
    return NextResponse.json({
      ingredients: ingredients || [],
      success: true
    });

  } catch (error) {
    console.error('Error in ingredients API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}