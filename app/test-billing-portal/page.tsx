"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthContext } from "@/components/auth/auth-provider"
import { useToast } from "@/components/ui/use-toast"

export default function TestBillingPortalPage() {
  const { user } = useAuthContext()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [lemonsqueezyTest, setLemonsqueezyTest] = useState<any>(null)
  const [subscriptionTest, setSubscriptionTest] = useState<any>(null)
  const [portalGenerationTest, setPortalGenerationTest] = useState<any>(null)

  const runBillingPortalTest = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para ejecutar esta prueba",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    setTestResults(null)

    try {
      console.log("Iniciando prueba del portal de facturación...")
      
      const res = await fetch("/api/user/subscription", { method: "GET" })
      const data = await res.json()
      
      const results = {
        timestamp: new Date().toISOString(),
        userId: user.id,
        responseStatus: res.status,
        responseData: data,
        success: res.ok,
        hasUrl: !!data.url,
        error: data.error,
        details: data.details,
        isTestMode: data.isTestMode
      }
      
      setTestResults(results)
      
      if (res.ok && data.url) {
        toast({
          title: "Éxito",
          description: "Portal de facturación disponible. URL generada correctamente.",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo generar el portal de facturación",
          variant: "destructive"
        })
      }
      
    } catch (error: any) {
      const results = {
        timestamp: new Date().toISOString(),
        userId: user.id,
        error: error.message,
        success: false
      }
      setTestResults(results)
      
      toast({
        title: "Error",
        description: "Error al ejecutar la prueba: " + error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openBillingPortal = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const res = await fetch("/api/user/subscription", { method: "GET" })
      const data = await res.json()
      
      if (res.ok && data.url) {
        window.open(data.url, "_blank")
        toast({
          title: "Portal abierto",
          description: "El portal de facturación se ha abierto en una nueva pestaña",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo abrir el portal de facturación",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al abrir el portal: " + error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testLemonSqueezyConnection = async () => {
    setIsLoading(true)
    try {
      console.log("Probando conectividad con LemonSqueezy...")
      
      const res = await fetch("/api/test-lemonsqueezy")
      const data = await res.json()
      
      setLemonsqueezyTest({
        timestamp: new Date().toISOString(),
        success: data.success,
        error: data.error,
        details: data.details,
        storeInfo: data.storeInfo,
        apiKeyConfigured: data.apiKeyConfigured,
        storeIdConfigured: data.storeIdConfigured
      })
      
      if (data.success) {
        toast({
          title: "Conexión exitosa",
          description: "LemonSqueezy está configurado correctamente",
        })
      } else {
        toast({
          title: "Error de conexión",
          description: data.error || "No se pudo conectar con LemonSqueezy",
          variant: "destructive"
        })
      }
      
    } catch (error: any) {
      setLemonsqueezyTest({
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      })
      
      toast({
        title: "Error",
        description: "Error al probar LemonSqueezy: " + error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testSubscriptionInLemonSqueezy = async () => {
    setIsLoading(true)
    try {
      console.log("Probando suscripción específica en LemonSqueezy...")
      
      const res = await fetch("/api/test-subscription")
      const data = await res.json()
      
      setSubscriptionTest({
        timestamp: new Date().toISOString(),
        success: data.success,
        error: data.error,
        details: data.details,
        subscription: data.subscription,
        databaseSubscription: data.databaseSubscription
      })
      
      if (data.success) {
        toast({
          title: "Suscripción encontrada",
          description: "La suscripción existe en LemonSqueezy y está activa",
        })
      } else {
        toast({
          title: "Suscripción no encontrada",
          description: data.error || "No se pudo encontrar la suscripción en LemonSqueezy",
          variant: "destructive"
        })
      }
      
    } catch (error: any) {
      setSubscriptionTest({
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      })
      
      toast({
        title: "Error",
        description: "Error al probar la suscripción: " + error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testPortalGeneration = async () => {
    setIsLoading(true)
    try {
      console.log("Probando diferentes métodos de generación de portal...")
      
      const res = await fetch("/api/test-portal-generation")
      const data = await res.json()
      
      setPortalGenerationTest({
        timestamp: new Date().toISOString(),
        success: data.success,
        results: data.results,
        successfulUrl: data.successfulUrl,
        customerId: data.customerId,
        subscriptionId: data.subscriptionId
      })
      
      if (data.success) {
        toast({
          title: "Portal generado exitosamente",
          description: `URL encontrada: ${data.successfulUrl}`,
        })
      } else {
        toast({
          title: "No se pudo generar el portal",
          description: "Todos los métodos de prueba fallaron",
          variant: "destructive"
        })
      }
      
    } catch (error: any) {
      setPortalGenerationTest({
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      })
      
      toast({
        title: "Error",
        description: "Error al probar la generación del portal: " + error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Debes iniciar sesión para acceder a esta página de prueba.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Prueba del Portal de Facturación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Información del Usuario</h3>
            <p className="text-sm text-blue-700">ID: {user.id}</p>
            <p className="text-sm text-blue-700">Email: {user.email}</p>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={runBillingPortalTest} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Ejecutando..." : "🔍 Probar Portal de Facturación"}
            </Button>
            
            <Button 
              onClick={openBillingPortal} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? "Abriendo..." : "🚀 Abrir Portal"}
            </Button>

            <Button 
              onClick={testLemonSqueezyConnection} 
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Probando..." : "🔧 Probar LemonSqueezy"}
            </Button>

            <Button 
              onClick={testSubscriptionInLemonSqueezy} 
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? "Probando..." : "📋 Probar Suscripción"}
            </Button>

            <Button 
              onClick={testPortalGeneration} 
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? "Probando..." : "🔧 Probar Generación de Portal"}
            </Button>
          </div>

          {lemonsqueezyTest && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Prueba de LemonSqueezy</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="font-medium">Estado:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      lemonsqueezyTest.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {lemonsqueezyTest.success ? 'Conectado' : 'Error'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">API Key:</span>
                    <span className={`ml-2 ${lemonsqueezyTest.apiKeyConfigured ? 'text-green-600' : 'text-red-600'}`}>
                      {lemonsqueezyTest.apiKeyConfigured ? '✓ Configurada' : '✗ No configurada'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Store ID:</span>
                    <span className={`ml-2 ${lemonsqueezyTest.storeIdConfigured ? 'text-green-600' : 'text-red-600'}`}>
                      {lemonsqueezyTest.storeIdConfigured ? '✓ Configurado' : '✗ No configurado'}
                    </span>
                  </div>
                </div>
                
                {lemonsqueezyTest.error && (
                  <div className="mb-4">
                    <span className="font-medium text-red-600">Error:</span>
                    <p className="text-sm text-red-600 mt-1">{lemonsqueezyTest.error}</p>
                  </div>
                )}
                
                {lemonsqueezyTest.storeInfo && (
                  <div className="mb-4">
                    <span className="font-medium">Información de la tienda:</span>
                    <p className="text-sm text-gray-600 mt-1">Nombre: {lemonsqueezyTest.storeInfo.name}</p>
                    <p className="text-sm text-gray-600">Slug: {lemonsqueezyTest.storeInfo.slug}</p>
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Ver datos completos de LemonSqueezy
                  </summary>
                  <pre className="mt-2 text-xs bg-white border border-gray-200 rounded p-2 overflow-auto max-h-64">
                    {JSON.stringify(lemonsqueezyTest, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}

          {subscriptionTest && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Prueba de Suscripción</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="font-medium">Estado:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      subscriptionTest.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {subscriptionTest.success ? 'Encontrada' : 'No encontrada'}
                    </span>
                  </div>
                </div>
                
                {subscriptionTest.error && (
                  <div className="mb-4">
                    <span className="font-medium text-red-600">Error:</span>
                    <p className="text-sm text-red-600 mt-1">{subscriptionTest.error}</p>
                  </div>
                )}
                
                {subscriptionTest.details && (
                  <div className="mb-4">
                    <span className="font-medium">Detalles:</span>
                    <p className="text-sm text-gray-600 mt-1">{subscriptionTest.details}</p>
                  </div>
                )}

                {subscriptionTest.subscription && (
                  <div className="mb-4">
                    <span className="font-medium">Información de LemonSqueezy:</span>
                    <p className="text-sm text-gray-600 mt-1">Producto: {subscriptionTest.subscription.product_name}</p>
                    <p className="text-sm text-gray-600">Variante: {subscriptionTest.subscription.variant_name}</p>
                    <p className="text-sm text-gray-600">Estado: {subscriptionTest.subscription.status}</p>
                    <p className="text-sm text-gray-600">Cancelada: {subscriptionTest.subscription.cancelled ? 'Sí' : 'No'}</p>
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Ver datos completos de la suscripción
                  </summary>
                  <pre className="mt-2 text-xs bg-white border border-gray-200 rounded p-2 overflow-auto max-h-64">
                    {JSON.stringify(subscriptionTest, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}

          {portalGenerationTest && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Prueba de Generación de Portal</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="font-medium">Estado:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      portalGenerationTest.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {portalGenerationTest.success ? 'Exitoso' : 'Fallido'}
                    </span>
                  </div>
                  {portalGenerationTest.successfulUrl && (
                    <div className="col-span-2">
                      <span className="font-medium">URL exitosa:</span>
                      <span className="ml-2 text-green-600 break-all">{portalGenerationTest.successfulUrl}</span>
                    </div>
                  )}
                </div>
                
                {portalGenerationTest.results && (
                  <div className="mb-4">
                    <span className="font-medium">Resultados de las pruebas:</span>
                    <div className="mt-2 space-y-2">
                      {portalGenerationTest.results.map((result: any, index: number) => (
                        <div key={index} className="text-sm border-l-4 pl-2" style={{
                          borderColor: result.success ? '#10b981' : '#ef4444'
                        }}>
                          <div className="font-medium">{result.returnUrl}</div>
                          <div className="text-gray-600">
                            Estado: {result.status} {result.statusText}
                            {result.success && result.url && (
                              <span className="text-green-600 ml-2">✓ {result.url}</span>
                            )}
                            {!result.success && result.error && (
                              <span className="text-red-600 ml-2">✗ {result.error}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Ver datos completos de la prueba
                  </summary>
                  <pre className="mt-2 text-xs bg-white border border-gray-200 rounded p-2 overflow-auto max-h-64">
                    {JSON.stringify(portalGenerationTest, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}

          {testResults && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Resultados de la Prueba</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="font-medium">Estado:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      testResults.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {testResults.success ? 'Éxito' : 'Error'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Código de respuesta:</span>
                    <span className="ml-2">{testResults.responseStatus}</span>
                  </div>
                  {testResults.hasUrl && (
                    <div className="col-span-2">
                      <span className="font-medium">URL generada:</span>
                      <span className="ml-2 text-green-600">✓ Disponible</span>
                    </div>
                  )}
                  {testResults.isTestMode && (
                    <div className="col-span-2">
                      <span className="font-medium">Modo de prueba:</span>
                      <span className="ml-2 text-yellow-600">⚠ Detectado</span>
                    </div>
                  )}
                </div>
                
                {testResults.error && (
                  <div className="mb-4">
                    <span className="font-medium text-red-600">Error:</span>
                    <p className="text-sm text-red-600 mt-1">{testResults.error}</p>
                  </div>
                )}
                
                {testResults.details && (
                  <div className="mb-4">
                    <span className="font-medium">Detalles:</span>
                    <p className="text-sm text-gray-600 mt-1">{testResults.details}</p>
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Ver datos completos de respuesta
                  </summary>
                  <pre className="mt-2 text-xs bg-white border border-gray-200 rounded p-2 overflow-auto max-h-64">
                    {JSON.stringify(testResults, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Posibles Problemas</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Suscripción de prueba (no tiene acceso al portal de facturación)</li>
              <li>• API key de LemonSqueezy mal configurada</li>
              <li>• Suscripción no encontrada en LemonSqueezy</li>
              <li>• Problemas de conectividad con la API de LemonSqueezy</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 