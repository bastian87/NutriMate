import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    if (adminError || !adminData) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get request body
    const body = await request.json()
    const { name, nutrition_data } = body

    // Validate input
    if (!name || !nutrition_data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert ingredient
    const { data, error } = await supabase
      .from('ingredients')
      .insert([
        {
          name,
          nutrition_data,
          created_by: user.id
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error inserting ingredient:', error)
      return NextResponse.json(
        { error: 'Failed to create ingredient' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in custom-ingredients API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { data: ingredients, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching ingredients:', error)
      return NextResponse.json(
        { error: 'Failed to fetch ingredients' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ingredients })

  } catch (error) {
    console.error('Error in ingredients API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}