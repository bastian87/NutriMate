import { type NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "7d"
    const metric = searchParams.get("metric") || "overview"

    console.log("Fetching metrics:", { period, metric })

    // Calculate date range
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // First, check if the analytics_events table exists using direct API call
    const tableCheckResponse = await fetch(`${supabaseUrl}/rest/v1/analytics_events?select=id&limit=1`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    })

    if (!tableCheckResponse.ok) {
      console.log("Analytics table doesn't exist yet, returning mock data")

      // Return mock data if table doesn't exist
      return NextResponse.json({
        overview: {
          totalUsers: 0,
          activeUsers: 0,
          totalRecipes: 0,
          totalGroceryLists: 0,
          premiumUsers: 0,
          period: period,
        },
        events: {
          page_view: 0,
          recipe_view: 0,
          user_signup: 0,
          grocery_list_create: 0,
        },
        recentActivity: [],
        message: "Analytics table not found. Please run the database setup script.",
      })
    }

    if (metric === "overview") {
      // Get overview metrics using direct API calls
      const [eventsResponse, usersResponse, recentActivityResponse] = await Promise.all([
        // Get event counts
        fetch(`${supabaseUrl}/rest/v1/analytics_events?select=event_name&created_at=gte.${startDate.toISOString()}`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          }
        }),

        // Get user count (from users table if it exists)
        fetch(`${supabaseUrl}/rest/v1/users?select=id&limit=0`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Prefer': 'count=exact'
          }
        }),

        // Get recent activity
        fetch(`${supabaseUrl}/rest/v1/analytics_events?select=event_name,created_at,properties&order=created_at.desc&limit=10`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          }
        }),
      ])

      // Process events
      const events: Record<string, number> = {}
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        eventsData.forEach((event: any) => {
          events[event.event_name] = (events[event.event_name] || 0) + 1
        })
      }

      // Get user count from response headers
      const totalUsers = usersResponse.ok ? parseInt(usersResponse.headers.get('content-range')?.split('/')[1] || '0') : 0
      const activeUsers = events.user_signin || events.session_start || 0
      const totalRecipes = events.recipe_view || 0
      const totalGroceryLists = events.grocery_list_create || 0
      const premiumUsers = events.subscription_start || 0

      // Get recent activity data
      const recentActivity = recentActivityResponse.ok ? await recentActivityResponse.json() : []

      return NextResponse.json({
        overview: {
          totalUsers,
          activeUsers,
          totalRecipes,
          totalGroceryLists,
          premiumUsers,
          period,
        },
        events,
        recentActivity,
      })
    }

    // Default response
    return NextResponse.json({
      overview: {
        totalUsers: 0,
        activeUsers: 0,
        totalRecipes: 0,
        totalGroceryLists: 0,
        premiumUsers: 0,
        period,
      },
      events: {},
      recentActivity: [],
    })
  } catch (error) {
    console.error("Metrics API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch metrics",
        details: error instanceof Error ? error.message : "Unknown error",
        overview: {
          totalUsers: 0,
          activeUsers: 0,
          totalRecipes: 0,
          totalGroceryLists: 0,
          premiumUsers: 0,
          period: "7d",
        },
        events: {},
        recentActivity: [],
      },
      { status: 500 },
    )
  }
}
