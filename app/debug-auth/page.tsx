"use client"

import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { supabase } from "@/lib/supabase/client"

export default function DebugAuthPage() {
  const { user, loading } = useAuthContext()

  const handleClearSession = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    } catch (error) {
      console.error("Error clearing session:", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Debug Auth</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 className="font-semibold mb-2">Estado de Carga:</h2>
            <p className="text-lg">{loading ? "🔄 Cargando..." : "✅ Cargado"}</p>
          </div>
          
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 className="font-semibold mb-2">Usuario:</h2>
            <p className="text-lg">{user ? "✅ Autenticado" : "❌ No autenticado"}</p>
            {user && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <p>ID: {user.id}</p>
                <p>Email: {user.email}</p>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 className="font-semibold mb-2">Contexto:</h2>
            <p className="text-lg">✅ useAuthContext funcionando correctamente!</p>
          </div>
        </div>
        
        <div className="mt-6 space-x-4">
          <a 
            href="/" 
            className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Volver al inicio
          </a>
          
          <button
            onClick={handleClearSession}
            className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Limpiar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}
