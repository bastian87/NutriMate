import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    console.log("Setting up analytics table...")

    // First, try to create the table
    const { error: createTableError } = await supabase.rpc("exec_sql", {
      query: `
        CREATE TABLE IF NOT EXISTS public.analytics_events (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          event_name TEXT NOT NULL,
          user_id UUID,
          properties JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    // If exec_sql doesn't work, let's try direct table creation
    if (createTableError) {
      console.log("exec_sql not available, trying direct table creation...")

      // Try to insert a test record to see if table exists
      const { error: testError } = await supabase.from("analytics_events").select("id").limit(1)

      if (testError && testError.message.includes("does not exist")) {
        // Table doesn't exist, we need to create it manually
        // Since we can't create tables directly via the client, let's return instructions
        return NextResponse.json(
          {
            error: "Table creation required",
            message: "Please create the analytics_events table manually",
            sql: `
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id UUID,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);

INSERT INTO public.analytics_events (event_name, properties, created_at) VALUES
('page_view', '{"path": "/dashboard"}', NOW() - INTERVAL '1 hour'),
('recipe_view', '{"recipe_id": "test-123", "recipe_name": "Test Recipe"}', NOW() - INTERVAL '2 hours'),
('user_signup', '{"method": "email"}', NOW() - INTERVAL '1 day'),
('grocery_list_create', '{}', NOW() - INTERVAL '3 hours');
          `,
            instructions: [
              "1. Go to your Supabase dashboard",
              "2. Navigate to SQL Editor",
              "3. Copy and paste the SQL above",
              "4. Click 'Run' to execute",
              "5. Come back and test again",
            ],
          },
          { status: 400 },
        )
      }
    }

    // Try to add some test data
    const { error: insertError } = await supabase.from("analytics_events").upsert(
      [
        {
          event_name: "page_view",
          properties: { path: "/dashboard" },
          created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
        {
          event_name: "recipe_view",
          properties: { recipe_id: "test-123", recipe_name: "Test Recipe" },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          event_name: "user_signup",
          properties: { method: "email" },
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          event_name: "grocery_list_create",
          properties: {},
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
      ],
      {
        onConflict: "id",
        ignoreDuplicates: true,
      },
    )

    if (insertError) {
      console.log("Insert error (this might be OK if data already exists):", insertError)
    }

    // Test if we can query the table
    const { data, error: queryError } = await supabase.from("analytics_events").select("*").limit(5)

    if (queryError) {
      throw new Error(`Query test failed: ${queryError.message}`)
    }

    console.log("Analytics table setup completed successfully")
    return NextResponse.json({
      success: true,
      message: "Analytics table is ready",
      testData: data,
    })
  } catch (error) {
    console.error("Setup analytics error:", error)
    return NextResponse.json(
      {
        error: "Failed to setup analytics",
        details: error instanceof Error ? error.message : "Unknown error",
        message: "Please create the table manually using the SQL provided",
      },
      { status: 500 },
    )
  }
}
