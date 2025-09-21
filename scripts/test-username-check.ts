import { createServerClient } from "@/lib/supabase/server"

async function testUsernameCheck() {
  try {
    console.log("Testing username check...")
    
    const supabase = createServerClient()
    
    // Test basic connection
    console.log("Testing basic connection...")
    const { data: testData, error: testError } = await supabase
      .from("users")
      .select("id")
      .limit(1)
    
    if (testError) {
      console.error("Basic connection error:", testError)
      return
    }
    
    console.log("Basic connection successful")
    
    // Test username column
    console.log("Testing username column...")
    const { data: usernameData, error: usernameError } = await supabase
      .from("users")
      .select("username")
      .eq("username", "testuser123")
      .maybeSingle()
    
    if (usernameError) {
      console.error("Username column error:", usernameError)
      return
    }
    
    console.log("Username column test successful:", usernameData)
    
    // Test with a real username
    const { data: realData, error: realError } = await supabase
      .from("users")
      .select("username")
      .eq("username", "sebita87")
      .maybeSingle()
    
    if (realError) {
      console.error("Real username check error:", realError)
      return
    }
    
    console.log("Real username check successful:", realData)
    console.log("Available:", !realData)
    
  } catch (error) {
    console.error("Test error:", error)
  }
}

testUsernameCheck()
