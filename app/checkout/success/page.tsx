"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Crown, ArrowRight } from "lucide-react"
import Link from "next/link"
import confetti from "canvas-confetti"
import { useAuthContext } from "@/components/auth/auth-provider"
import { useSubscription } from "@/hooks/use-subscription"

export default function CheckoutSuccessPage() {
  const { user } = useAuthContext()
  const { subscription, loading } = useSubscription()

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000
    const end = Date.now() + duration

    const colors = ["#f97316", "#fb923c", "#fdba74"]
    ;(function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    })()
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full text-center">
        <CardHeader className="pb-8">
          <div className="mx-auto bg-green-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold mb-2">
            {subscription?.status === "active"
              ? "¡Bienvenido a NutriMate Premium!"
              : "¡Suscripción en proceso!"}
          </CardTitle>
          <p className="text-gray-600 text-lg">
            {subscription?.status === "active"
              ? `Tu plan: ${subscription.plan_name || "Premium"}`
              : "Estamos procesando tu suscripción..."}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información real de la suscripción */}
          {subscription && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Detalles de tu suscripción</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Estado: {subscription.status}</li>
                <li>• Plan: {subscription.plan_name}</li>
                <li>• Inicio: {new Date(subscription.current_period_start).toLocaleDateString()}</li>
                <li>• Fin: {new Date(subscription.current_period_end).toLocaleDateString()}</li>
              </ul>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
              <Crown className="h-5 w-5 text-orange-600" />
              What's Next?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Complete Your Profile</h4>
                    <p className="text-sm text-gray-600">Set up your dietary preferences and health goals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Generate Your First Meal Plan</h4>
                    <p className="text-sm text-gray-600">Get personalized recipes for the week</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Try the AI Assistant</h4>
                    <p className="text-sm text-gray-600">Ask for unlimited recipe suggestions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Explore Premium Features</h4>
                    <p className="text-sm text-gray-600">Advanced nutrition tracking and meal prep</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trial Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Your Free Trial Details</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Trial ends on {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</li>
              <li>• You can cancel anytime before the trial ends</li>
              <li>• No charges until your trial period is over</li>
              <li>• Full access to all Premium features</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding">
              <Button className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
                Complete Your Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full sm:w-auto">
                Go to Dashboard
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Need help getting started?{" "}
              <Link href="/support" className="text-orange-600 hover:underline">
                Contact our support team
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
