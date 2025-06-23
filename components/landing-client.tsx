"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Sparkles, ChefHat, Target, Menu, X, Check, Star, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"
import { LanguageSelector } from "@/components/language-selector"

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
  isLoggedIn: boolean
  featuredRecipes: Recipe[]
}

export default function LandingClient({ isLoggedIn, featuredRecipes }: LandingClientProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const { t } = useLanguage()

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
        body: JSON.stringify({
          variantId,
          plan,
        }),
      })

      const data = await response.json()

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error("Failed to create checkout")
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
      description: "Track macros, calories, and nutrients with detailed analytics and insights.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      image: "/images/nutrition-tracking-insights.png",
    },
    {
      icon: Sparkles,
      title: t("home.recipeDiscovery"),
      description: "Discover thousands of healthy recipes with smart filtering and recommendations.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      image: "/images/recipe-discovery-smart.png",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Share recipes, meal plans, and connect with like-minded health enthusiasts.",
      color: "text-green-600",
      bgColor: "bg-green-50",
      image: "/images/community-driven.png",
    },
  ]

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with meal planning",
      features: [
        "Basic recipe search",
        "Save up to 10 recipes",
        "Simple meal planning",
        "Basic grocery lists",
        "Mobile app access",
      ],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
      popular: false,
      action: (variantId?: string) => (window.location.href = isLoggedIn ? "/recipes" : "/signup"),
    },
    {
      name: "Premium",
      price: "$4.99",
      period: "month",
      description: "Everything you need for complete nutrition management",
      features: [
        "Unlimited recipe access",
        "Advanced meal planning",
        "Smart grocery lists",
        "Nutritional analysis",
        "Custom recipe creation",
        "Export meal plans",
        "Priority support",
      ],
      buttonText: "Start Premium",
      buttonVariant: "default" as const,
      popular: true,
      variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_VARIANT_ID!,
      action: (variantId?: string) => handleSubscribe(variantId!, "monthly"),
    },
    {
      name: "Premium Annual",
      price: "$49.99",
      period: "year",
      description: "Best value - save 16.5% with annual billing",
      features: [
        "Everything in Premium",
        "Advanced analytics",
        "Recipe recommendations",
        "Meal plan templates",
        "Family sharing (up to 4 members)",
        "Premium support",
      ],
      buttonText: "Start Annual",
      buttonVariant: "default" as const,
      popular: false,
      variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_ANNUAL_VARIANT_ID!,
      action: (variantId?: string) => handleSubscribe(variantId!, "annual"),
    },
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
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Pricing
                </a>
              </nav>

              <div className="flex items-center space-x-4">
                <LanguageSelector isCompact />
                {isLoggedIn ? (
                  <Link href="/dashboard">
                    <Button variant="outline">Dashboard</Button>
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
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 hover:text-gray-900">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-4">
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Pricing
                </a>
                <div className="pt-4 border-t border-gray-200 flex flex-col space-y-2">
                  {isLoggedIn ? (
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button variant="outline" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button className="w-full bg-orange-600 hover:bg-orange-700">Get Started</Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          )}
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
                    <a href="#pricing">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        View Pricing
                      </Button>
                    </a>
                  </>
                )}
              </div>
              <div className="mt-8 flex items-center justify-center gap-8 lg:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Recipes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">4.9★</div>
                  <div className="text-sm text-gray-600">User Rating</div>
                </div>
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
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive tools and features designed to make nutrition planning simple and effective.
            </p>
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
                      <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
                      <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
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
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Choose Your Plan</h2>
            <p className="mt-4 text-lg text-gray-600">
              Start your nutrition journey with the perfect plan for your needs
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
                      Most Popular
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
                      className={`w-full mt-6 ${
                        plan.buttonVariant === "default" ? "bg-orange-600 hover:bg-orange-700" : ""
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
                          Processing...
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
                Transform your health journey with smart meal planning and nutrition tracking.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 NutriMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
