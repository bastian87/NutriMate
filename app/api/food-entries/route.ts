import { NextRequest, NextResponse } from "next/server";
import { createServerClientWithCookies } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const response = NextResponse.next();
    const supa = createServerClientWithCookies(req, response);
    
    const { data: { session }, error: authError } = await supa.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;

    // Get query parameters for filtering
    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    const category = url.searchParams.get('category');
    const limit = url.searchParams.get('limit');

    // Build query
    let query = supa
      .from('food_diary_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    // Apply filters
    if (date) {
      query = query.eq('date', date);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: entries, error } = await query;

    if (error) {
      console.error('Error fetching food diary entries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch food diary entries' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      entries: entries || [],
      message: "Food diary entries fetched successfully"
    });

  } catch (error) {
    console.error("Error fetching food entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.next();
    const supa = createServerClientWithCookies(req, response);
    
    const { data: { session }, error: authError } = await supa.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;

    const body = await req.json();
    const { category, menu, amount, carb, protein, fats, sugar, calories, thoughts, image_url } = body;

    // Validate required fields
    if (!menu) {
      return NextResponse.json(
        { error: "Menu is required" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category. Must be one of: breakfast, lunch, dinner, snack" },
        { status: 400 }
      );
    }

    // Prepare data for insertion
    const entryData = {
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      category,
      menu,
      amount: amount || null,
      carb: parseFloat(carb) || 0,
      protein: parseFloat(protein) || 0,
      fats: parseFloat(fats) || 0,
      sugar: parseFloat(sugar) || 0,
      calories: parseFloat(calories),
      thoughts: thoughts || null,
      image_url: image_url || null
    };

    // Insert into database
    const { data: newEntry, error } = await supa
      .from('food_diary_entries')
      .insert(entryData)
      .select()
      .single();

    if (error) {
      console.error('Error creating food diary entry:', error);
      return NextResponse.json(
        { error: 'Failed to create food diary entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      entry: newEntry,
      message: "Food diary entry created successfully"
    });

  } catch (error) {
    console.error("Error creating food entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const response = NextResponse.next();
    const supa = createServerClientWithCookies(req, response);
    
    const { data: { session }, error: authError } = await supa.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;

    const body = await req.json();
    const { id, category, menu, amount, carb, protein, fats, sugar, calories, thoughts, image_url } = body;

    // Validate required fields
    if (!id || !menu) {
      return NextResponse.json(
        { error: "ID and menu are required" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (category && !validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category. Must be one of: breakfast, lunch, dinner, snack" },
        { status: 400 }
      );
    }

    // Prepare data for update
    const updateData = {
      category,
      menu,
      amount: amount || null,
      carb: parseFloat(carb) || 0,
      protein: parseFloat(protein) || 0,
      fats: parseFloat(fats) || 0,
      sugar: parseFloat(sugar) || 0,
      calories: parseFloat(calories),
      thoughts: thoughts || null,
      image_url: image_url || null,
      updated_at: new Date().toISOString()
    };

    // Update in database
    const { data: updatedEntry, error } = await supa
      .from('food_diary_entries')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating food diary entry:', error);
      return NextResponse.json(
        { error: 'Failed to update food diary entry' },
        { status: 500 }
      );
    }

    if (!updatedEntry) {
      return NextResponse.json(
        { error: 'Food diary entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      entry: updatedEntry,
      message: "Food diary entry updated successfully"
    });

  } catch (error) {
    console.error("Error updating food entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const response = NextResponse.next();
    const supa = createServerClientWithCookies(req, response);
    
    const { data: { session }, error: authError } = await supa.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    // Delete from database
    const { error } = await supa
      .from('food_diary_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting food diary entry:', error);
      return NextResponse.json(
        { error: 'Failed to delete food diary entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: "Food diary entry deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting food entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
