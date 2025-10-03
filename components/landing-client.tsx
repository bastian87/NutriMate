"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Sparkles, ChefHat, Target, Check, Star, Zap, Calculator, Clock, TrendingUp, BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"
import { LanguageSelector } from "@/components/language-selector"
import { ThemeToggle } from "./theme-toggle"
import { useAuthContext } from "@/components/auth/simple-auth-provider"

interface Recipe {
  id: string
  name: string
  description: string
  calories: number
  protein: number
  carbs: number
  fat: number
  time: number
  difficulty: string
  image: string
  rating: number
  reviews: number
}

interface LandingClientProps {
  featuredRecipes: Recipe[]
}

export default function LandingClient({ }: LandingClientProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const { t } = useLanguage()
  const { user } = useAuthContext()
  
  // Determinar si el usuario está logueado basado en el contexto de autenticación
  const isLoggedIn = !!user

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSubscribe = async (variantId: string, plan: string) => {
    if (!isLoggedIn) {
      // Redirect to login
      window.location.href = "/login?redirect=/landing"
      return
    }

    try {
      setLoading(plan)

      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 👈 MUY IMPORTANTE: envía cookies al backend
        body: JSON.stringify({
          variantId,
          plan,
        }),
      })

      const data = await response.json()
      console.log("API Response:", data) // 👈 Para ver la respuesta real en consola

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error(data.error || "Failed to create checkout")
      }
    } catch (error) {
      console.error("Subscription error:", error)
      alert("Failed to start subscription process. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const speedFeatures = [
    {
      icon: <Clock className="w-6 h-6" />,
      time: '10 seconds',
      action: 'Log a meal',
      description: 'Quick search and one-tap logging'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      time: '2 minutes',
      action: 'Plan your week',
      description: 'Smart calendar scheduling'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      time: '5 seconds',
      action: 'Check your progress',
      description: 'Visual insights at a glance'
    }
  ]

  const features = [
    {
      icon: <ChefHat className="w-10 h-10" />,
      title: 'Simple Meal Logging',
      description: 'Track meals in seconds with smart search and auto-complete'
    },
    {
      icon: <Target className="w-10 h-10" />,
      title: 'Easy Meal Planning',
      description: 'Plan your nutrition week-by-week with drag-and-drop'
    },
    {
      icon: <BookOpen className="w-10 h-10" />,
      title: 'Recipe Library',
      description: 'Access thousands of recipes with instant nutritional data'
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: 'Auto Grocery Lists',
      description: 'Generate shopping lists from your meal plans automatically'
    },
    {
      icon: <Sparkles className="w-10 h-10" />,
      title: 'Clear Analytics',
      description: 'Understand your nutrition with simple, beautiful charts'
    },
    {
      icon: <Calculator className="w-10 h-10" />,
      title: 'Smart Tracking',
      description: 'Monitor weight, calories, and macros effortlessly'
    }
  ]

  const plans = [
    {
      name: t("pricing.free"),
      price: "$0",
      period: t("pricing.forever"),
      description: t("pricing.freeDesc"),
      features: [
        t("pricing.basicRecipeSearch"),
        t("pricing.saveUpTo10"),
        t("pricing.simpleMealPlanning"),
        t("pricing.basicGroceryLists"),
        t("pricing.mobileAppAccess"),
      ],
      buttonText: t("pricing.getStarted"),
      buttonVariant: "outline" as const,
      popular: false,
      action: () => (window.location.href = isLoggedIn ? "/recipes" : "/signup"),
    },
    {
      name: t("pricing.premium"),
      price: "$2.99",
      period: t("pricing.month"),
      description: t("pricing.premiumDesc"),
      features: [
        t("pricing.unlimitedRecipeAccess"),
        // t("pricing.advancedMealPlanning"), // Oculto temporalmente
        t("pricing.smartGroceryLists"),
        t("pricing.nutritionalAnalysis"),
        t("pricing.customRecipeCreation"),
        // t("pricing.exportMealPlans"), // Oculto temporalmente
        t("pricing.prioritySupport"),
      ],
      buttonText: t("pricing.startPremium"),
      buttonVariant: "default" as const,
      popular: true,
      variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_VARIANT_ID!,
      action: (variantId?: string) => handleSubscribe(variantId!, "monthly"),
    },
    {
      name: t("pricing.premiumAnnual"),
      price: "$29.99",
      period: t("pricing.year"),
      description: t("pricing.premiumAnnualDesc"),
      features: [
        t("pricing.everythingInPremium"),
        t("pricing.advancedAnalytics"),
        t("pricing.recipeRecommendations"),
        // t("pricing.mealPlanTemplates"), // Oculto temporalmente
        t("pricing.premiumSupport"),
      ],
      buttonText: t("pricing.startAnnual"),
      buttonVariant: "default" as const,
      popular: false,
      variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_ANNUAL_VARIANT_ID!,
      action: (variantId?: string) => handleSubscribe(variantId!, "annual"),
    },
  ]


  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-purple-50 opacity-60"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 mb-6 tracking-tight">
                Your Personal<br />
                <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  Nutrition Assistant
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
                Registra tu comida en solo 10 segundos. NutriMate hace el seguimiento nutricional súper fácil y rápido. 
                Sin complicaciones, solo resultados.
              </p>
              
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-start">
                {isLoggedIn ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:shadow-orange-500/40">
                      Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                    <Link href="/signup">
                    <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:shadow-orange-500/40">
                      Start Now <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                )}
              </div>
                  </div>

            {/* Illustration */}
            <div className="relative hidden lg:block">
              <div className="relative">
              <div className="relative mx-auto max-w-lg">
                  <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-400 opacity-20 blur-2xl" />
                <Image
                    src="/images/dashboard-preview.png"
                    alt="NutriMate dashboard interface showing nutrition tracking and meal logging"
                  width={500}
                  height={400}
                  style={{ width: "auto", height: "auto" }}
                  className="relative rounded-2xl shadow-2xl"
                  priority
                />
              </div>
                
                {/* Floating Success Badge */}
                <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Check className="w-7 h-7 text-white" strokeWidth={3} />
                  </div>
                </div>
                
                {/* Floating Stats Card */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-5 shadow-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl"></div>
                    <div>
                      <div className="h-2 bg-gray-900 rounded w-16 mb-2"></div>
                      <div className="h-2 bg-gray-300 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Speed Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl text-gray-900 mb-4 tracking-tight">
              Effortlessly simple. Lightning fast.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Save time with tools designed for speed and simplicity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {speedFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-3xl p-8 text-center border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white mb-6 shadow-lg shadow-orange-500/30">
                  {feature.icon}
                </div>
                <div className="text-4xl bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-3">
                  {feature.time}
                </div>
                <h3 className="text-2xl text-gray-900 mb-3">
                  {feature.action}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl text-gray-900 mb-4 tracking-tight">
              Everything you need for a healthier lifestyle
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and features designed to make nutrition planning simple and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                  key={index}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="text-orange-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                      </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl text-gray-900 mb-4 tracking-tight">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start your nutrition journey with the perfect plan for your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
              <div className="mb-8">
                <h3 className="text-2xl text-gray-900 mb-2">Free</h3>
                <p className="text-gray-600">
                  Perfect for users who want simple nutrition tracking
                </p>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl text-gray-900">$0</span>
                <span className="text-gray-600 ml-2">/forever</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">Load your own recipes without limits</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">Save up to 10 favorites</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">Explore community recipes</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">Basic grocery lists</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">Basic dashboard with calories only</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => (window.location.href = isLoggedIn ? "/recipes" : "/signup")}
                variant="outline"
                className="w-full py-6 border-2 hover:bg-gray-50"
              >
                Get Started
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 relative shadow-2xl transform scale-105 border-2 border-orange-600">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-orange-400 text-white px-6 py-2 rounded-full shadow-lg">
                Popular
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl text-white mb-2">Premium</h3>
                <p className="text-orange-100">
                  For those who want comprehensive statistics and advanced tools
                </p>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl text-white">$2.99</span>
                <span className="text-orange-100 ml-2">/month</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-white">Unlimited favorites</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-white">Smart lists with categorization</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-white">Complete calories + macros</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-white">Advanced filter search</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-white">Weekly and monthly summaries</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => {
                  if (plans[1].variantId) {
                    handleSubscribe(plans[1].variantId!, "monthly")
                  }
                }}
                className="w-full py-6 bg-white text-orange-600 hover:bg-orange-50 shadow-lg"
                disabled={loading === "premium"}
              >
                {loading === "premium" ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Processing...
                  </div>
                ) : (
                  "Start Premium"
                )}
              </Button>
            </div>

            {/* Premium Annual Plan */}
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <div className="mb-8">
                <h3 className="text-2xl text-gray-900 mb-2">Premium Annual</h3>
                <p className="text-gray-600">
                  Best value - save 16.7% with annual billing
                </p>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl text-gray-900">$29.99</span>
                <span className="text-gray-600 ml-2">/year</span>
                    </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">Everything in Premium</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">Recipe filtering</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">Premium support</span>
                        </li>
                    </ul>

                    <Button
                      onClick={() => {
                  if (plans[2].variantId) {
                    handleSubscribe(plans[2].variantId!, "annual")
                  }
                }}
                className="w-full py-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30"
                disabled={loading === "premium annual"}
              >
                {loading === "premium annual" ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Processing...
                        </div>
                      ) : (
                  "Start Annual"
                      )}
                    </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            Ready to transform your nutrition journey?
          </h2>
          <p className="mt-4 text-lg text-orange-100 mb-8">
            Join thousands of users who have already improved their health with NutriMate.
          </p>
            <div className="mt-8">
              {isLoggedIn ? (
                <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 rounded-xl">
                  Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/signup">
                <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 rounded-xl">
                  Start Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl mb-3 bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              NutriMate
            </h3>
            <p className="text-gray-400 mb-6">
              Your personal nutrition assistant
            </p>
            <p className="text-sm text-gray-500">
              © 2025 NutriMate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
