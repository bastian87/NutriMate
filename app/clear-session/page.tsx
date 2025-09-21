"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export default function ClearSessionPage() {
  const [status, setStatus] = useState("Limpiando...")

  useEffect(() => {
    const clearSession = async () => {
      try {
        setStatus("🔍 Verificando sesión actual...")
        
        // Obtener sesión actual
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setStatus("🚪 Cerrando sesión...")
          await supabase.auth.signOut()
        }
        
        setStatus("🧹 Limpiando almacenamiento local...")
        
        // Limpiar localStorage
        localStorage.removeItem('sb-wlqsitedbkghsucxoyoc-auth-token')
        localStorage.removeItem('supabase.auth.token')
        localStorage.removeItem('temp_user_data')
        localStorage.removeItem('userPreferences')
        
        // Limpiar sessionStorage
        sessionStorage.clear()
        
        setStatus("✅ Sesión limpiada exitosamente")
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
        
      } catch (error) {
        console.error("Error clearing session:", error)
        setStatus("❌ Error al limpiar sesión")
      }
    }

    clearSession()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Limpiar Sesión</h1>
        
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-lg mb-4">{status}</p>
          
          {status.includes("✅") && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Redirigiendo al inicio...
            </p>
          )}
        </div>
        
        <div className="mt-6">
          <a 
            href="/" 
            className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  )
}
