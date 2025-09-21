import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

interface UseSupabaseQueryOptions {
  enabled?: boolean
  retryOnError?: boolean
  maxRetries?: number
}

interface UseSupabaseQueryResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: UseSupabaseQueryOptions = {}
) {
  const { enabled = true, retryOnError = true, maxRetries = 3 } = options
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  const isMountedRef = useRef(true)
  const queryIdRef = useRef(0)

  const executeQuery = useCallback(async () => {
    if (!enabled) return

    const currentQueryId = ++queryIdRef.current
    setLoading(true)
    setError(null)

    try {
      const result = await queryFn()
      
      // Solo actualizar si este es el query más reciente
      if (currentQueryId === queryIdRef.current && isMountedRef.current) {
        if (result.error) {
          throw result.error
        }
        
        setData(result.data)
        setRetryCount(0)
      }
    } catch (err) {
      if (currentQueryId === queryIdRef.current && isMountedRef.current) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        
        // Reintentar si está habilitado y no hemos excedido el máximo
        if (retryOnError && retryCount < maxRetries) {
          setRetryCount(prev => prev + 1)
          setTimeout(() => {
            if (isMountedRef.current) {
              executeQuery()
            }
          }, 1000 * Math.pow(2, retryCount)) // Backoff exponencial
        }
      }
    } finally {
      if (currentQueryId === queryIdRef.current && isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [queryFn, enabled, retryOnError, maxRetries, retryCount])

  const refetch = useCallback(async () => {
    setRetryCount(0)
    await executeQuery()
  }, [executeQuery])

  useEffect(() => {
    executeQuery()
  }, [executeQuery])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return { data, loading, error, refetch }
}

// Hook específico para consultas de usuario
export function useUserQuery(userId: string | null) {
  return useSupabaseQuery(
    async () => {
      if (!userId) return { data: null, error: null }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      return { data, error }
    },
    { enabled: !!userId }
  )
}

// Hook específico para preferencias de usuario
export function useUserPreferencesQuery(userId: string | null) {
  return useSupabaseQuery(
    async () => {
      if (!userId) return { data: null, error: null }
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      return { data, error }
    },
    { enabled: !!userId }
  )
}

// Hook específico para suscripciones de usuario
export function useUserSubscriptionsQuery(userId: string | null) {
  return useSupabaseQuery(
    async () => {
      if (!userId) return { data: null, error: null }
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(plan_name)')
        .eq('user_id', userId)
        .eq('status', 'active')
      
      return { data, error }
    },
    { enabled: !!userId }
  )
}
