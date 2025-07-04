"use client"

import { useEffect, useState } from "react"
import { useAuthContext } from "./auth-provider"
import { supabase } from "@/lib/supabase/client"

export function AuthDebug() {
  const { user, loading } = useAuthContext()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    const getDebugInfo = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        setDebugInfo({
          timestamp: new Date().toISOString(),
          user: user ? {
            id: user.id,
            email: user.email,
            emailConfirmed: user.email_confirmed_at,
            lastSignIn: user.last_sign_in_at,
            createdAt: user.created_at
          } : null,
          session: session ? {
            expiresAt: session.expires_at,
            isExpired: session.expires_at ? new Date(session.expires_at * 1000) < new Date() : false,
            accessToken: session.access_token ? 'present' : 'missing',
            refreshToken: session.refresh_token ? 'present' : 'missing'
          } : null,
          error: error?.message || null,
          loading,
          localStorage: typeof window !== 'undefined' ? {
            hasUserPreferences: !!localStorage.getItem('userPreferences'),
            userPreferencesSize: localStorage.getItem('userPreferences')?.length || 0
          } : null
        })
      } catch (err) {
        setDebugInfo({
          error: err instanceof Error ? err.message : 'Unknown error',
          timestamp: new Date().toISOString()
        })
      }
    }

    getDebugInfo()
  }, [user, loading])

  // Solo mostrar en desarrollo o cuando se presiona Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebug(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!showDebug && process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Auth Debug</h3>
        <button 
          onClick={() => setShowDebug(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      <pre className="whitespace-pre-wrap overflow-auto max-h-64">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      <div className="mt-2 text-xs text-gray-400">
        Press Ctrl+Shift+D to toggle
      </div>
    </div>
  )
} 