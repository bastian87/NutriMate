"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Sparkles, ChefHat, Target, Check, Star, Zap, Calculator, Clock, TrendingUp, BookOpen, Trophy, Flame, Search, Eye, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"
// LanguageSelector removed - single language mode
import { ThemeToggle } from "./theme-toggle"
import { useAuthContext } from "@/components/auth/simple-auth-provider"

interface LandingClientProps {}

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

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const howItWorks = [
    {
      step: 1,
      icon: <Search className="w-8 h-8" />,
      title: 'Log your meal',
      description: 'Fast search or quick calorie entry. Use recent meals or simple templates to log in seconds.'
    },
    {
      step: 2,
      icon: <Eye className="w-8 h-8" />,
      title: 'See your day',
      description: 'One clean screen shows calories, macros, streak, XP, and today\'s meals. No clutter.'
    },
    {
      step: 3,
      icon: <Flame className="w-8 h-8" />,
      title: 'Keep your streak',
      description: 'Daily logging builds XP and achievements. Stay consistent and level up your habits.'
    }
  ]

  const faqs = [
    {
      question: 'Do I need a specific diet?',
      answer: 'No. Nutrimate works with any eating pattern. Just log what you eat, and we\'ll help you track it.'
    },
    {
      question: 'Do I have to track every macro?',
      answer: 'No, it\'s optional. You can log just calories, or add macros if you want more detail. Keep it simple.'
    },
    {
      question: 'Is there a free plan?',
      answer: 'Yes, and it\'s fully usable. You get unlimited meal logging, streaks, XP, and basic achievements—everything you need to build the habit.'
    },
    {
      question: 'Can I cancel Premium anytime?',
      answer: 'Yes. Cancel anytime with no questions asked. You\'ll keep Premium until the end of your billing period.'
    }
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
               <h1 className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 mb-6 tracking-tight leading-[1.1]">
                 The fastest way to&nbsp;
                 <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                   log your food.
                 </span>
               </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
                Log your meals in 10 seconds, build streaks, and level up your eating habits with simple, game-like tracking.
              </p>
              
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-start">
                {isLoggedIn ? (
                  <>
                    <Link href="/dashboard">
                      <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:shadow-orange-500/40">
                        Go to app <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:shadow-orange-500/40">
                        Start free <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>
                  </div>

            {/* Daily View Preview */}
            <div className="relative hidden lg:block">
              <div className="relative">
                <div className="relative mx-auto max-w-lg">
                  <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-400 opacity-20 blur-2xl" />
                  <Card className="relative rounded-2xl shadow-2xl border-2 border-gray-200 bg-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Today</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Stats Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">1,245</div>
                          <div className="text-xs text-gray-600">calories</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">7</div>
                          <div className="text-xs text-gray-600">day streak</div>
                        </div>
                      </div>
                      
                      {/* Macros */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Protein</span>
                          <span className="font-medium">45g</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Carbs</span>
                          <span className="font-medium">120g</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Fat</span>
                          <span className="font-medium">35g</span>
                        </div>
                      </div>
                      
                      {/* XP Badge */}
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-900">+50 XP today</span>
                      </div>
                      
                      {/* Meals List */}
                      <div className="space-y-2 pt-2 border-t">
                        <div className="text-xs font-medium text-gray-500 mb-2">Today's meals</div>
                        <div className="text-sm text-gray-700">Breakfast: Oatmeal</div>
                        <div className="text-sm text-gray-700">Lunch: Salad</div>
                        <div className="text-sm text-gray-700">Dinner: Chicken</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Floating Streak Badge */}
                <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-600" />
                    <div>
                      <div className="text-lg font-bold text-gray-900">7</div>
                      <div className="text-xs text-gray-500">day streak</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating XP Badge */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                    <div>
                      <div className="text-lg font-bold text-gray-900">Level 5</div>
                      <div className="text-xs text-gray-500">1,250 XP</div>
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
              How it works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to faster food logging
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((step, index) => (
              <div 
                key={index} 
                className="bg-white rounded-3xl p-8 text-center border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white mb-6 shadow-lg shadow-orange-500/30">
                  {step.icon}
                </div>
                <div className="text-sm font-semibold text-orange-600 mb-2">Step {step.step}</div>
                <h3 className="text-xl text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Nutrimate is Different Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl text-gray-900 mb-4 tracking-tight">
              Why Nutrimate is different
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-8 md:p-12 border border-orange-100">
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Most nutrition apps try to do everything: recipes, meal plans, grocery lists, complex analytics. 
                Nutrimate focuses on one thing: <strong className="text-gray-900">helping you log your food fast and stay consistent.</strong>
              </p>
              
              <div className="space-y-4 mt-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Simplicity</h4>
                    <p className="text-gray-600">No overwhelming UI. One clean screen shows everything you need for today.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Built-in streaks and XP</h4>
                    <p className="text-gray-600">Every day you log earns XP and keeps your streak alive. Simple gamification that actually works.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Clean daily view</h4>
                    <p className="text-gray-600">Instead of complex dashboards, see calories, macros, streak, XP, and meals—all in one place.</p>
                  </div>
                </div>
              </div>
            </div>
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

          <div className="max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
              <div className="mb-8">
                <h3 className="text-2xl text-gray-900 mb-2">Free</h3>
                <p className="text-gray-600">
                  Build the habit of logging your food.
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
                  <span className="text-gray-700">Unlimited meal logging</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">Simple daily calories and macros</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">Streak and XP system</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">Basic achievements</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">Recent meals for quick re-logging</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => (window.location.href = isLoggedIn ? "/dashboard" : "/signup")}
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
                  Better insights and more motivation.
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
                  <span className="text-white">Weekly summary of your week</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-white">Extended history and trends</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-white">Custom meal templates for faster logging</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-white">Extra achievements and cosmetic badges</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-white">Priority support</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => {
                  const variantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_VARIANT_ID!
                  if (variantId) {
                    handleSubscribe(variantId, "monthly")
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

            {/* Premium Annual Plan - Optional variant */}
            <div className="md:col-span-2 bg-white rounded-3xl p-6 border-2 border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl text-gray-900 mb-1">Premium Annual</h3>
                  <p className="text-gray-600 text-sm">Same benefits, better price — $29.99/year</p>
                </div>
                <Button
                  onClick={() => {
                    const variantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_ANNUAL_VARIANT_ID!
                    if (variantId) {
                      handleSubscribe(variantId, "annual")
                    }
                  }}
                  variant="outline"
                  className="w-full md:w-auto"
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
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl text-gray-900 mb-4 tracking-tight">
              Frequently asked questions
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {faq.question}
                    </CardTitle>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {openFaq === index && (
                  <CardContent className="pt-0">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-8">
            Ready to log your food in seconds?
          </h2>
          <div className="mt-8">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 rounded-xl">
                  Go to app
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 rounded-xl">
                  Start free
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
