"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Calendar, CreditCard, Settings } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/i18n/context"
import { useToast } from "@/components/ui/use-toast"

interface SubscriptionStatusProps {
  userId?: string
}

export default function SubscriptionStatus({ userId }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cancelledSubscription, setCancelledSubscription] = useState<any | null>(null)
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
      const res = await fetch("/api/user/subscription", { method: "GET" })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || "No se pudo obtener el portal de facturación.")
      window.open(data.url, "_blank")
    } catch (error: any) {
      setError(error.message || "No se pudo abrir el portal de facturación.")
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
            <Button variant="outline" className="w-full mt-2" onClick={refreshSubscription} disabled={isLoading}>
              Refrescar estado
            </Button>
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
            <Button variant="outline" className="w-full" disabled={isLoading} onClick={handleManageBilling}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Billing
            </Button>
            {message && <div className="text-green-700 bg-green-50 border border-green-200 rounded p-2 text-sm mt-2">{message}</div>}
            {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2 text-sm mt-2">{error}</div>}
          </div>
        )}

        <div className="text-xs text-gray-500 pt-2 border-t">
          <p>
            Need help?{" "}
            <a href="/support" className="text-orange-600 hover:underline">
              Contact support
            </a>
          </p>
        </div>

        <Button variant="outline" className="w-full mb-2" onClick={refreshSubscription} disabled={isLoading}>
          Refrescar estado de suscripción
        </Button>
      </CardContent>
    </Card>
  )
}
