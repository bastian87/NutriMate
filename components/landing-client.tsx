"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Sparkles, ChefHat, Target, Menu, X, Check, Star, Zap, Calculator } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"
import { LanguageSelector } from "@/components/language-selector"
import { ThemeToggle } from "./theme-toggle"
import { useAuthContext } from "@/components/auth/auth-provider"

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

export default function LandingClient({ featuredRecipes }: LandingClientProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const { t } = useLanguage()
  const { user, loading: authLoading } = useAuthContext()
  
  // Determinar si el usuario está logueado basado en el contexto de autenticación
  const isLoggedIn = !!user

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

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

  const features = [
    {
      icon: ChefHat,
      title: t("home.planMeals"),
      description: t("home.planMealsDesc"),
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      image: "/images/smart-meal-planning.png",
    },
    {
      icon: Target,
      title: t("home.nutritionTracking"),
      description: t("home.trackMacros"),
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      image: "/images/nutrition-tracking-insights.png",
    },
    {
      icon: Sparkles,
      title: t("home.recipeDiscovery"),
      description: t("home.discoverRecipesLong"),
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      image: "/images/recipe-discovery-smart.png",
    },
    {
      icon: Users,
      title: t("home.communityDriven"),
      description: t("home.communityDrivenDesc"),
      color: "text-green-600",
      bgColor: "bg-green-50",
      image: "/images/community-driven.png",
    },
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
      action: (variantId?: string) => (window.location.href = isLoggedIn ? "/recipes" : "/signup"),
    },
    {
      name: t("pricing.premium"),
      price: "$4.99",
      period: t("pricing.month"),
      description: t("pricing.premiumDesc"),
      features: [
        t("pricing.unlimitedRecipeAccess"),
        t("pricing.advancedMealPlanning"),
        t("pricing.smartGroceryLists"),
        t("pricing.nutritionalAnalysis"),
        t("pricing.customRecipeCreation"),
        t("pricing.exportMealPlans"),
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
      price: "$49.99",
      period: t("pricing.year"),
      description: t("pricing.premiumAnnualDesc"),
      features: [
        t("pricing.everythingInPremium"),
        t("pricing.advancedAnalytics"),
        t("pricing.recipeRecommendations"),
        t("pricing.mealPlanTemplates"),
        t("pricing.premiumSupport"),
      ],
      buttonText: t("pricing.startAnnual"),
      buttonVariant: "default" as const,
      popular: false,
      variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_ANNUAL_VARIANT_ID!,
      action: (variantId?: string) => handleSubscribe(variantId!, "annual"),
    },
  ]

  // KPIs destacados
  const kpis = [
    { value: "10K+", label: t("home.activeUsers") },
    { value: "50K+", label: t("home.recipes") },
    { value: "4.9★", label: t("home.userRating") },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="relative bg-orange-50 border-b border-orange-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/landing" className="flex items-center space-x-2">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Image src="/logo-new.png" alt="NutriMate Logo" width={32} height={32} className="rounded-lg" />
                </div>
                <span className="text-xl font-bold text-gray-900">NutriMate</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex space-x-8">
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  {t('home.features')}
                </button>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  {t('home.pricing')}
                </button>
                <Link href="/calorie-calculator" className="text-gray-600 hover:text-gray-900 transition-colors font-medium flex items-center gap-1">
                  <Calculator className="h-4 w-4" />
                  {t('navigation.calorieCalculator')}
                </Link>
              </nav>

              <div className="flex items-center space-x-4">
                <LanguageSelector isCompact />
                <ThemeToggle />
                {isLoggedIn ? (
                  <Link href="/dashboard">
                    <Button className="bg-orange-600 hover:bg-orange-700">Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline">Sign In</Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="bg-orange-600 hover:bg-orange-700">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <LanguageSelector isCompact />
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Overlay */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <div className="md:hidden fixed inset-0 z-50">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-black bg-opacity-50"
                  onClick={() => setMobileMenuOpen(false)}
                />

                {/* Menu Panel */}
                <motion.div
                  initial={{ opacity: 0, x: "100%" }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: "100%" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl"
                >
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Image src="/logo-new.png" alt="NutriMate Logo" width={24} height={24} className="rounded-lg" />
                        <span className="text-lg font-bold text-gray-900">NutriMate</span>
                      </div>
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 p-6">
                      <div className="space-y-6">
                        {/* Navigation Links */}
                        <div className="space-y-4">
                          <button
                            onClick={() => {
                              scrollToSection('pricing')
                              setMobileMenuOpen(false)
                            }}
                            className="block text-lg font-medium text-gray-900 hover:text-orange-600 transition-colors text-left w-full"
                          >
                            {t('home.pricing')}
                          </button>
                          <button
                            onClick={() => {
                              scrollToSection('features')
                              setMobileMenuOpen(false)
                            }}
                            className="block text-lg font-medium text-gray-900 hover:text-orange-600 transition-colors text-left w-full"
                          >
                            {t('home.features')}
                          </button>
                          <Link href="/calorie-calculator" className="block text-lg font-medium text-gray-900 hover:text-orange-600 transition-colors text-left w-full">
                            {t('navigation.calorieCalculator')}
                          </Link>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 pt-6">
                          <div className="space-y-4">
                            {isLoggedIn ? (
                              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                                  Dashboard
                                </Button>
                              </Link>
                            ) : (
                              <>
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                  <Button variant="outline" className="w-full">
                                    Sign In
                                  </Button>
                                </Link>
                                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                                    Get Started
                                  </Button>
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </nav>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200">
                      <div className="text-center text-sm text-gray-600">
                        <p>© 2024 NutriMate. All rights reserved.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-blue-50 py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                {t("home.title")}
              </h1>
              <p className="mt-6 text-lg text-gray-600 sm:text-xl">{t("home.subtitle")}</p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                {isLoggedIn ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700">
                      {t("home.goToDashboard")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button size="lg" className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700">
                        {t("home.getStarted")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <button
                      onClick={() => scrollToSection('pricing')}
                      className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View Pricing
                    </button>
                  </>
                )}
              </div>
              <div className="mt-8 flex items-center justify-center gap-8 lg:justify-start">
                {kpis.map((kpi, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                    <div className="text-sm text-gray-600">{kpi.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative mx-auto max-w-lg">
                <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-orange-400 to-red-400 opacity-20 blur-2xl" />
                <Image
                  src="/images/meal-planning-mobile.png"
                  alt="Meal planning app illustration"
                  width={500}
                  height={400}
                  className="relative rounded-2xl shadow-2xl"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t("home.featuresTitle")}</h2>
            <p className="mt-4 text-lg text-gray-600">{t("home.featuresSectionDesc")}</p>
          </motion.div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <Card
                    className={`h-full transition-all duration-300 ${hoveredFeature === index ? "shadow-lg scale-105" : ""}`}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto mb-4 w-24 h-24 relative">
                        <Image
                          src={feature.image || "/placeholder.svg"}
                          alt={feature.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h3 className="text-lg font-bold text-card-foreground">{feature.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t("home.chooseYourPlan")}</h2>
            <p className="mt-4 text-lg text-gray-600">
              {t("home.startYourJourney")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-600 text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      {t("home.mostPopular")}
                    </Badge>
                  </div>
                )}

                <Card className={`h-full ${plan.popular ? "border-orange-600 shadow-lg scale-105" : ""}`}>
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={plan.buttonVariant}
                      className={`w-full mt-6 ${plan.buttonVariant === "default" ? "bg-orange-600 hover:bg-orange-700" : ""
                        }`}
                      onClick={() => {
                        if (plan.variantId) {
                          plan.action(plan.variantId)
                        } else {
                          plan.action(undefined)
                        }
                      }}
                      disabled={loading === plan.name.toLowerCase()}
                    >
                      {loading === plan.name.toLowerCase() ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          {t("home.processing")}
                        </div>
                      ) : (
                        <>
                          {plan.popular && <Zap className="h-4 w-4 mr-2" />}
                          {plan.buttonText}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Texto de prueba gratuita eliminado */}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">{t("home.ctaTitle")}</h2>
            <p className="mt-4 text-lg text-orange-100">{t("home.ctaDesc")}</p>
            <div className="mt-8">
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
                    {t("home.goToDashboard")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
                    {t("home.signUpNow")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Image src="/logo-new.png" alt="NutriMate Logo" width={32} height={32} className="rounded-lg" />
                </div>
                <span className="text-xl font-bold">NutriMate</span>
              </div>
              <p className="text-gray-400 mb-4">
                {t("home.transformHealth")}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t("footer.product")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    {t("footer.pricing")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t("footer.company")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy-policy" className="hover:text-white transition-colors">
                    {t("footer.privacy")}
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="hover:text-white transition-colors">
                    {t("footer.terms")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>{t("footer.allRights")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
