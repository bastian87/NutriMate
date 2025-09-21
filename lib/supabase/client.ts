import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/types/database"

let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function createClientSupabaseClient() {
  if (!supabaseClient) {
    try {
      // Crear cliente simple sin interceptores complejos
      supabaseClient = createClientComponentClient<Database>()
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      throw new Error("Failed to initialize Supabase client")
    }
  }
  return supabaseClient
}

// Export the singleton instance as the default export
export const supabase = createClientSupabaseClient()

// Also export as createClient for compatibility
export const createClient = createClientSupabaseClient

// Export default
export default supabase
