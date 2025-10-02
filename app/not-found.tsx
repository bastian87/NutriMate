"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HomeIcon, ArrowLeftIcon } from "@/components/icons-new"
import { useLanguage } from "@/lib/i18n/context"

export default function NotFound() {
  const router = useRouter()
  const { t } = useLanguage()

  // Redireccionar automáticamente después de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/dashboard')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Página No Encontrada
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            La página que buscas no existe o ha sido movida.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Serás redirigido automáticamente al dashboard en unos segundos...
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => router.replace('/dashboard')}
              className="flex-1"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Ir al Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex-1"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Volver Atrás
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
