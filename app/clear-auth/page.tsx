"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function ClearAuthPage() {
  const [status, setStatus] = useState<'idle' | 'clearing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const clearAuthTokens = async () => {
    setStatus('clearing')
    setMessage('Limpiando tokens de autenticación...')

    try {
      // Cerrar sesión en Supabase
      await supabase.auth.signOut()
      
      // Limpiar localStorage
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (
          key.includes('supabase') || 
          key.includes('sb-') ||
          key.includes('auth-token') ||
          key.includes('refresh-token') ||
          key.includes('temp_user_data') ||
          key.includes('temp_users')
        )) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })
      
      // Limpiar sessionStorage
      sessionStorage.clear()
      
      setStatus('success')
      setMessage('Tokens limpiados exitosamente. Redirigiendo...')
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/landing')
      }, 2000)
      
    } catch (error) {
      console.error('Error clearing auth tokens:', error)
      setStatus('error')
      setMessage('Error al limpiar los tokens. Intenta recargar la página.')
    }
  }

  const goToLanding = () => {
    router.push('/landing')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-gray-900">
            Limpiar Sesión
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'idle' && (
            <>
              <p className="text-gray-600 text-center">
                Este proceso limpiará todos los tokens de autenticación y datos temporales.
              </p>
              <Button 
                onClick={clearAuthTokens}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Limpiar Sesión
              </Button>
              <Button 
                onClick={goToLanding}
                variant="outline"
                className="w-full"
              >
                Cancelar
              </Button>
            </>
          )}

          {status === 'clearing' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-green-600 font-medium">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 font-medium">{message}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="w-full mt-4"
              >
                Recargar Página
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
