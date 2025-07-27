"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Calendar, CreditCard, Settings, ArrowUp } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/i18n/context"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

interface SubscriptionStatusProps {
  userId?: string
}

export default function SubscriptionStatus({ userId }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cancelledSubscription, setCancelledSubscription] = useState<any | null>(null)
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const { t } = useLanguage()
  const { toast } = useToast()

  useEffect(() => {
    if (!userId) return;

    const fetchSubscription = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active")
          .maybeSingle();
        if (error) throw error;
        setSubscription(data);

        // Si no hay activa, busca la cancelada más reciente con ends_at en el futuro
        if (!data) {
          const { data: cancelledData } = await supabase
            .from("user_subscriptions")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "cancelled")
            .order("ends_at", { ascending: false })
            .limit(1);
          setCancelledSubscription(cancelledData && cancelledData.length > 0 ? cancelledData[0] : null);
        } else {
          setCancelledSubscription(null);
        }
      } catch (err: any) {
        setError("No se pudo obtener la información de la suscripción.");
        setSubscription(null);
        setCancelledSubscription(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [userId]);

  const handleCancelSubscription = async () => {
    setIsLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch("/api/user/subscription", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error desconocido")
      setSubscription((prev: any) => ({ ...prev, cancelAtPeriodEnd: true }))
      setMessage("La suscripción se cancelará al final del período de facturación actual.")
    } catch (error: any) {
      setError(error.message || "No se pudo cancelar la suscripción. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    setIsLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch("/api/user/subscription", { method: "PATCH" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error desconocido")
      setSubscription((prev: any) => ({ ...prev, cancelAtPeriodEnd: false }))
      setMessage("¡Suscripción reactivada exitosamente!")
    } catch (error: any) {
      setError(error.message || "No se pudo reactivar la suscripción. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setIsLoading(true)
    setError(null)
    setMessage(null)
    try {
      console.log("Iniciando solicitud de portal de facturación...")
      const res = await fetch("/api/user/subscription", { method: "GET" })
      const data = await res.json()
      
      console.log("Respuesta del servidor:", { status: res.status, data })
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("No tienes una suscripción activa. Primero debes suscribirte a un plan.")
        } else if (res.status === 400 && data.isTestMode) {
          throw new Error("Portal de facturación no disponible para suscripciones de prueba. Estás en modo de desarrollo. Para acceder a las funciones de facturación, crea una nueva suscripción en modo de producción.")
        } else if (res.status === 500) {
          if (data.error === "Subscription not found in LemonSqueezy") {
            throw new Error("Tu suscripción existe en nuestra base de datos pero no en el sistema de pagos. Por favor, contacta al soporte para resolver este problema.")
          } else {
            throw new Error(data.details || "Error al generar el portal de facturación. Por favor, intenta nuevamente más tarde.")
          }
        } else {
          throw new Error(data.error || "No se pudo obtener el portal de facturación.")
        }
      }
      
      if (!data.url) {
        throw new Error("No se pudo generar la URL del portal de facturación.")
      }
      
      console.log("Abriendo portal de facturación:", data.url)
      window.open(data.url, "_blank")
      setMessage("Portal de facturación abierto en una nueva pestaña.")
    } catch (error: any) {
      console.error("Error en handleManageBilling:", error)
      setError(error.message || "No se pudo abrir el portal de facturación.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDebugSubscription = async () => {
    setIsLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch("/api/user/subscription", { method: "GET" })
      const data = await res.json()
      
      setDebugInfo({
        responseStatus: res.status,
        responseData: data,
        subscription: subscription,
        cancelledSubscription: cancelledSubscription,
        timestamp: new Date().toISOString()
      })
      setShowDebugInfo(true)
    } catch (error: any) {
      setError("Error al obtener información de depuración: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSubscription = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      setSubscription(data);
      if (!data) {
        const { data: cancelledData } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "cancelled")
          .order("ends_at", { ascending: false })
          .limit(1);
        setCancelledSubscription(cancelledData && cancelledData.length > 0 ? cancelledData[0] : null);
      } else {
        setCancelledSubscription(null);
      }
      toast({ title: "Estado actualizado", description: "El estado de tu suscripción se ha refrescado." });
    } catch (err: any) {
      setError("No se pudo refrescar la suscripción.");
      toast({ title: "Error", description: "No se pudo refrescar la suscripción.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (subscription?.cancelAtPeriodEnd) {
      return (
        <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">
          Cancelling
        </Badge>
      )
    }
    if (subscription?.status === "active") {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    }
    return <Badge variant="secondary">{subscription?.status}</Badge>
  }

  if (isLoading && !subscription) {
    return (
      <Card><CardContent className="py-8 text-center">Cargando suscripción...</CardContent></Card>
    )
  }

  if (!subscription) {
    if (
      cancelledSubscription &&
      cancelledSubscription.ends_at &&
      new Date(cancelledSubscription.ends_at) > new Date()
    ) {
      // Mostrar la tarjeta de periodo de gracia
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-orange-600" />
              Estado de suscripción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold capitalize">Plan Premium</h3>
                <p className="text-sm text-gray-600">$4.99/mes</p>
              </div>
              <Badge variant="secondary">Cancelada (periodo de gracia)</Badge>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              {`Tu suscripción está cancelada, pero tienes acceso premium hasta el ${new Date(cancelledSubscription.ends_at).toLocaleDateString()}. Luego perderás acceso a las funciones premium.`}
            </div>
            <div className="flex justify-center mt-2">
              <Button variant="outline" size="sm" onClick={refreshSubscription} disabled={isLoading}>
                Refrescar estado
              </Button>
            </div>
            <div className="flex justify-center mt-2">
              <Link href="/pricing" passHref>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  <ArrowUp className="h-4 w-4 mr-2" />
                  {t("subscriptionStatus.reactivateButton")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      );
    }
    // Usuario sin suscripción activa ni cancelada vigente
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-orange-600" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold capitalize">Free Plan</h3>
              <p className="text-sm text-gray-600">$0/month</p>
            </div>
            <Badge className="bg-gray-100 text-gray-800">Free</Badge>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
            {t("subscriptionStatus.freePlanDesc")}
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
            {t("subscriptionStatus.upgradeMessage")}
          </div>
          <div className="flex justify-center mt-2">
            <Link href="/pricing" passHref>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <ArrowUp className="h-4 w-4 mr-2" />
                {t("subscriptionStatus.upgradeButton")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mapear los campos de la suscripción real
  const {
    plan_name = "Premium",
    status = "active",
    renews_at,
    ends_at,
    cancel_at_period_end = false,
    billing_cycle = "monthly",
    amount = 4.99,
  } = subscription || {}

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-orange-600" />
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold capitalize">{plan_name} Plan</h3>
            <p className="text-sm text-gray-600">
              ${amount}/{billing_cycle === "monthly" ? "month" : "year"}
            </p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>
              {status === "cancelled" || cancel_at_period_end
                ? `Expires on ${ends_at ? new Date(ends_at).toLocaleDateString() : "-"}`
                : `Renews on ${renews_at ? new Date(renews_at).toLocaleDateString() : "-"}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <span>Billing cycle: {billing_cycle}</span>
          </div>
        </div>

        {cancel_at_period_end ? (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                {`Your subscription will end on ${ends_at ? new Date(ends_at).toLocaleDateString() : "-"}. You'll lose access to Premium features after this date.`}
              </p>
            </div>
            {message && <div className="text-green-700 bg-green-50 border border-green-200 rounded p-2 text-sm">{message}</div>}
            {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2 text-sm">{error}</div>}
            <Button
              onClick={handleReactivateSubscription}
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? "Processing..." : "Reactivate Subscription"}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button variant="outline" className="w-fit" disabled={isLoading} onClick={handleManageBilling}>
              <Settings className="h-4 w-4 mr-2" />
              {t("subscription.manageBilling")}
            </Button>
            {message && <div className="text-green-700 bg-green-50 border border-green-200 rounded p-2 text-sm mt-2">{message}</div>}
            {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2 text-sm mt-2">{error}</div>}
          </div>
        )}

        <Button variant="outline" className="w-fit mb-2" onClick={refreshSubscription} disabled={isLoading}>
        {t("subscription.refresStatus")}
        </Button>
        
        {/* Botón de depuración */}
        <Button 
          variant="outline" 
          className="w-fit ml-2" 
          onClick={handleDebugSubscription} 
          disabled={isLoading}
        >
          🔍 Depurar
        </Button>
        
        {/* Información de depuración */}
        {showDebugInfo && debugInfo && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold mb-2">Información de Depuración</h4>
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setShowDebugInfo(false)}
            >
              Cerrar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
