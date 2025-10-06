import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/types/database"
import { RetryableError, isRetryableError } from "./errors"

let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

// Rate limiting configuration
const RATE_LIMIT = {
  maxAttempts: 5,
  timeWindow: 5000, // 5 seconds
  retryDelay: 2000, // 2 seconds
  maxRetries: 3
}

// Keep track of API calls per endpoint
const apiCalls = new Map<string, { timestamp: number }[]>()

function isRateLimited(endpoint: string): boolean {
  const now = Date.now()
  const calls = apiCalls.get(endpoint) || []
  
  // Remove old calls outside the time window
  while (calls.length > 0 && calls[0].timestamp < now - RATE_LIMIT.timeWindow) {
    calls.shift()
  }
  
  // Update the calls list
  apiCalls.set(endpoint, calls)
  
  return calls.length >= RATE_LIMIT.maxAttempts
}

function addApiCall(endpoint: string) {
  const calls = apiCalls.get(endpoint) || []
  calls.push({ timestamp: Date.now() })
  apiCalls.set(endpoint, calls)
}

async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function createClientSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  if (typeof window !== "undefined") {
    supabaseClient = createClientComponentClient<Database>()

    // Wrap auth methods with retry and rate limiting logic
    const originalAuth = supabaseClient.auth
    supabaseClient.auth = new Proxy(originalAuth, {
      get(target, prop) {
        const original = target[prop as keyof typeof target]
        if (typeof original === 'function') {
          return async function(this: any, ...args: any[]) {
            let attempts = 0
            
            const endpoint = prop.toString()
            while (attempts < RATE_LIMIT.maxRetries) {
              try {
                // Check rate limiting
                if (isRateLimited(endpoint)) {
                  const waitTime = RATE_LIMIT.retryDelay * (attempts + 1)
                  console.log(`🚦 Rate limited for ${endpoint}, waiting ${waitTime}ms...`)
                  await wait(waitTime)
                  attempts++
                  continue
                }

                // Track this API call
                addApiCall(endpoint)

                // Make the actual call
                const result = await original.apply(this, args)
                
                // Clear rate limit tracking on success
                apiCalls.delete(endpoint)
                
                return result

              } catch (error) {
                attempts++
                
                // If it's a rate limit error (429)
                if (error instanceof RetryableError || isRetryableError(error)) {
                  if (attempts < RATE_LIMIT.maxAttempts) {
                    console.log(`🔄 Retrying auth operation (attempt ${attempts + 1}/${RATE_LIMIT.maxAttempts})`)
                    await wait(RATE_LIMIT.retryDelay * attempts) // Exponential backoff
                    continue
                  }
                }
                
                // For non-retryable errors or if we've exhausted retries
                throw error
              }
            }
            
            throw new Error('Max retry attempts reached')
          }
        }
        return original
      }
    })
  }

  return supabaseClient
}

export const supabase = createClientSupabaseClient()

// Also export as createClient for compatibility
export const createClient = createClientSupabaseClient