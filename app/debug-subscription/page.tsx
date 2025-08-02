"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthContext } from "@/components/auth/auth-provider"
import { useUserProfile, useIsPremium, useAccountType } from "@/components/auth/user-profile-provider"
import { getUserSubscription } from "@/lib/subscription-service"
import { supabase } from "@/lib/supabase/client"

export default function DebugSubscriptionPage() {
  const { user } = useAuthContext()
  const { userData, refreshUserProfile, forceRefreshUserProfile } = useUserProfile()
  const isPremium = useIsPremium()
  const accountType = useAccountType()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostic = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Obtener suscripción directamente de la base de datos
      const { data: dbSubscription, error: dbError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single()

      // Obtener suscripción usando el servicio
      const serviceSubscription = await getUserSubscription(user.id)

      // Refrescar el perfil del usuario
      await refreshUserProfile()

      const diagnostic = {
        timestamp: new Date().toISOString(),
        userId: user.id,
        userEmail: user.email,
        
        // Estado del contexto
        contextIsPremium: isPremium,
        contextAccountType: accountType,
        
        // Datos del perfil
        userDataIsPremium: userData?.isPremium,
        userDataAccountType: userData?.accountType,
        userDataSubscription: userData?.subscription,
        
        // Datos directos de la base de datos
        dbSubscription: dbSubscription,
        dbError: dbError,
        
        // Datos del servicio
        serviceSubscription: serviceSubscription,
        
        // Comparación
        hasActiveSubscription: !!dbSubscription,
        isPremiumFromDB: !!dbSubscription,
        isPremiumFromService: !!serviceSubscription,
        isPremiumFromContext: isPremium,
        isPremiumFromUserData: userData?.isPremium
      }

      setDebugInfo(diagnostic)
    } catch (error: any) {
      setDebugInfo({
        timestamp: new Date().toISOString(),
        error: error.message,
        userId: user?.id
      })
    } finally {
      setIsLoading(false)
    }
  }

  const forceRefresh = async () => {
    if (!user) return
    await forceRefreshUserProfile()
    await runDiagnostic()
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Debes iniciar sesión para acceder a esta página de diagnóstico.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico de Suscripción Premium</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Estado Actual</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Usuario:</span>
                <span className="ml-2">{user.email}</span>
              </div>
              <div>
                <span className="font-medium">ID:</span>
                <span className="ml-2">{user.id}</span>
              </div>
              <div>
                <span className="font-medium">¿Es Premium? (Context):</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  isPremium ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isPremium ? 'Sí' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Tipo de Cuenta:</span>
                <span className="ml-2">{accountType}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={runDiagnostic} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Ejecutando..." : "🔍 Ejecutar Diagnóstico"}
            </Button>
            
            <Button 
              onClick={forceRefresh} 
              disabled={isLoading}
              variant="outline"
            >
              🔄 Forzar Actualización
            </Button>
          </div>

          {debugInfo && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Resultados del Diagnóstico</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="font-medium">Suscripción en DB:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      debugInfo.hasActiveSubscription ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {debugInfo.hasActiveSubscription ? 'Activa' : 'No encontrada'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Premium desde DB:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      debugInfo.isPremiumFromDB ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {debugInfo.isPremiumFromDB ? 'Sí' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Premium desde Servicio:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      debugInfo.isPremiumFromService ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {debugInfo.isPremiumFromService ? 'Sí' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Premium desde Context:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      debugInfo.isPremiumFromContext ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {debugInfo.isPremiumFromContext ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>

                {debugInfo.dbSubscription && (
                  <div className="mb-4">
                    <span className="font-medium">Datos de Suscripción en DB:</span>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>ID: {debugInfo.dbSubscription.id}</p>
                      <p>Estado: {debugInfo.dbSubscription.status}</p>
                      <p>Plan: {debugInfo.dbSubscription.plan_name}</p>
                      <p>Renueva: {debugInfo.dbSubscription.renews_at}</p>
                    </div>
                  </div>
                )}

                {debugInfo.error && (
                  <div className="mb-4">
                    <span className="font-medium text-red-600">Error:</span>
                    <p className="text-sm text-red-600 mt-1">{debugInfo.error}</p>
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Ver datos completos del diagnóstico
                  </summary>
                  <pre className="mt-2 text-xs bg-white border border-gray-200 rounded p-2 overflow-auto max-h-64">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Solución</h3>
            <p className="text-sm text-yellow-700">
              Si tienes una suscripción activa pero no puedes acceder a las funciones premium, 
              haz clic en "Forzar Actualización" para refrescar los datos del contexto.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 