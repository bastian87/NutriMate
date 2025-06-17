"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star, Clock, Users, Sparkles, Heart, ChefHat, Target } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"

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

interface HomeClientProps {
  isLoggedIn: boolean
  featuredRecipes: Recipe[]
}

export default function HomeClient({ isLoggedIn, featuredRecipes }: HomeClientProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const { t } = useLanguage()

  const features = [
    {
      icon: ChefHat,
      title: t("home.planMeals"),
      description: t("home.planMealsDesc"),
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Target,
      title: t("home.nutritionTracking"),
      description: "Track macros, calories, and nutrients with detailed analytics and insights.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Sparkles,
      title: t("home.recipeDiscovery"),
      description: "Discover thousands of healthy recipes with smart filtering and recommendations.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Share recipes, meal plans, and connect with like-minded health enthusiasts.",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ]

  return (
    <div className="min-h-screen">
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
                    <Link href="/pricing">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        {t("home.exploreRecipes")}
                      </Button>
                    </Link>
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
                  src="/images/cooking-illustration.png"
                  alt="Healthy cooking illustration"
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
      <section className="py-20 bg-white">
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
                      <div
                        className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor}`}
                      >
                        <Icon className={`h-6 w-6 ${feature.color}`} />
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

      {/* Featured Recipes Section */}
      {featuredRecipes.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t("home.featuredRecipes")}</h2>
              <p className="mt-4 text-lg text-gray-600">
                Discover delicious and nutritious recipes loved by our community.
              </p>
            </motion.div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredRecipes.slice(0, 6).map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
                    <div className="relative h-48">
                      <Image
                        src={recipe.image || "/placeholder.svg?height=200&width=300&query=healthy food"}
                        alt={recipe.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-medium">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {recipe.rating}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-gray-900">{recipe.name}</h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{recipe.description}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {recipe.time} min
                        </div>
                        <div>{recipe.calories} cal</div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {recipe.reviews}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {recipe.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {recipe.protein}g protein
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/recipes">
                <Button variant="outline" size="lg">
                  {t("home.viewAll")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

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
    </div>
  )
}
