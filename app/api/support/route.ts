import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subject, message, priority } = await request.json()

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 })
    }

    // Get user's subscription status to determine priority
    const { data: subscription } = await supabase.from("subscriptions").select("plan").eq("user_id", user.id).single()

    const isPremium = subscription?.plan === "premium"
    const ticketPriority = isPremium ? "high" : priority || "normal"

    // Create support ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        user_id: user.id,
        subject,
        message,
        priority: ticketPriority,
        status: "open",
        is_premium: isPremium,
      })
      .select()
      .single()

    if (ticketError) {
      console.error("Error creating support ticket:", ticketError)
      return NextResponse.json({ error: "Failed to create support ticket" }, { status: 500 })
    }

    // Send notification email (in a real app, you'd integrate with an email service)
    console.log(`New support ticket created: ${ticket.id} (Priority: ${ticketPriority})`)

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      priority: ticketPriority,
      message: isPremium
        ? "Your premium support ticket has been created and will be prioritized."
        : "Your support ticket has been created.",
    })
  } catch (error) {
    console.error("Error in support API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
