import { createServerClient } from "@/lib/supabase/server"

async function testSignupError() {
  try {
    console.log("Testing signup with existing user...")
    
    const supabase = createServerClient()
    
    // Try to sign up with an existing email
    const { data, error } = await supabase.auth.signUp({
      email: "siacevedo26@gmail.com",
      password: "testpassword123"
    })
    
    console.log("Signup result:", { data, error })
    
    if (error) {
      console.log("Error details:")
      console.log("- Message:", error.message)
      console.log("- Status:", error.status)
      console.log("- Name:", error.name)
      console.log("- Full error:", JSON.stringify(error, null, 2))
      
      if (error.message && error.message.includes("User already registered")) {
        console.log("✅ Detected 'User already registered' error")
      } else {
        console.log("❌ Error message does not contain 'User already registered'")
      }
    }
    
  } catch (error) {
    console.error("Test error:", error)
  }
}

testSignupError()
