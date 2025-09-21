import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/types/database"

// Configuración de Supabase con headers optimizados
export const createSupabaseClient = () => {
  const client = createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })

  // Interceptor para agregar headers correctos
  const originalFrom = client.from.bind(client)
  client.from = (table: string) => {
    const query = originalFrom(table)
    
    // Interceptar las consultas para agregar headers
    const originalSelect = query.select.bind(query)
    query.select = (columns?: string) => {
      const result = originalSelect(columns)
      
      // Agregar headers para evitar errores 406
      if (result.headers) {
        result.headers = {
          ...result.headers,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
      
      return result
    }
    
    return query
  }

  return client
}

// Singleton del cliente
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient()
  }
  return supabaseClient
}
