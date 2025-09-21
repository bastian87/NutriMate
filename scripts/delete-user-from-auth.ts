import { createServerClient } from "@/lib/supabase/server"

async function deleteUserFromAuth() {
  try {
    console.log("Deleting user from Supabase Auth...")
    
    const supabase = createServerClient()
    const email = "siacevedo26@gmail.com"
    
    // Get user by email first
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error("Error listing users:", listError)
      return
    }
    
    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      console.log(`User with email ${email} not found in auth.users`)
      return
    }
    
    console.log(`Found user: ${user.id} - ${user.email}`)
    
    // Delete the user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
    
    if (deleteError) {
      console.error("Error deleting user:", deleteError)
      return
    }
    
    console.log(`Successfully deleted user ${email} from auth.users`)
    
  } catch (error) {
    console.error("Script error:", error)
  }
}

deleteUserFromAuth()
