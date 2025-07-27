"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthContext } from "@/components/auth/auth-provider"
import { useToast } from "@/components/ui/use-toast"

export default function ConfigureUrlPage() {
  const { user } = useAuthContext()
  const { toast } = useToast()
  const [currentUrl, setCurrentUrl] = useState("")
  const [suggestedUrls, setSuggestedUrls] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin
      setCurrentUrl(origin)
      
      // Generar URLs sugeridas
      const suggestions = [
        origin,
        origin.replace('http://', 'https://'),
        origin.replace('localhost:3000', 'nutrimate.app'),
        'https://nutrimate.app',
        'https://nutrimate.net'
      ].filter((url, index, arr) => arr.indexOf(url) === index) // Remover duplicados
      
      setSuggestedUrls(suggestions)
    }
  }, [])

  const testUrl = async (url: string) => {
    setIsLoading(true)
    try {
      const testUrl = `${url}/account/subscription`
      console.log("Probando URL:", testUrl)
      
      // Simular una prueba de la URL
      const response = await fetch('/api/test-portal-generation')
      const data = await response.json()
      
      // Buscar si esta URL funciona en los resultados
      const urlResult = data.results?.find((result: any) => 
        result.returnUrl.includes(url.replace('https://', '').replace('http://', ''))
      )
      
      if (urlResult?.success) {
        toast({
          title: "URL válida",
          description: `${url} funciona correctamente para el portal de facturación`,
        })
        return true
      } else {
        toast({
          title: "URL no válida",
          description: `${url} no funciona para el portal de facturación`,
          variant: "destructive"
        })
        return false
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error probando ${url}: ${error.message}`,
        variant: "destructive"
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "URL copiada al portapapeles",
    })
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Debes iniciar sesión para acceder a esta página.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Configurar URL para Portal de Facturación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Problema Identificado</h3>
            <p className="text-sm text-blue-700">
              El portal de facturación no funciona porque no tienes configurada una URL de retorno válida. 
              LemonSqueezy necesita saber a qué URL redirigir al usuario después de gestionar su facturación.
            </p>
          </div>

          <div>
            <Label htmlFor="current-url">URL Actual Detectada</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="current-url"
                value={currentUrl}
                readOnly
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(currentUrl)}
              >
                Copiar
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">URLs Sugeridas para Probar</h3>
            <div className="space-y-2">
              {suggestedUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{url}</div>
                    <div className="text-sm text-gray-600">
                      URL completa: {url}/account/subscription
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(url)}
                    >
                      Copiar
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => testUrl(url)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Probando..." : "Probar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Cómo Configurar</h3>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Prueba las URLs sugeridas arriba para encontrar una que funcione</li>
              <li>Copia la URL que funcione</li>
              <li>Agrega esta línea a tu archivo <code>.env.local</code>:</li>
            </ol>
            <div className="mt-3 p-3 bg-gray-100 rounded font-mono text-sm">
              NEXT_PUBLIC_APP_URL=https://tu-url-que-funciona.com
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              <strong>Ejemplo:</strong> Si https://nutrimate.app funciona, usa: NEXT_PUBLIC_APP_URL=https://nutrimate.app
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Después de Configurar</h3>
            <p className="text-sm text-green-700">
              Una vez que hayas configurado la URL correcta en tu archivo .env.local, reinicia tu aplicación 
              y prueba el botón "Gestionar Facturación" en tu página de cuenta.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 