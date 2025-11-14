"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Sparkles, ChefHat, Target } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"

interface Recipe {
  id: string
  name: string
  calories: number
  image: string
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
      image: "/images/smart-nutrition-tracking.png",
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
      description: "Share recipes and connect with like-minded health enthusiasts.",
      color: "text-green-600",
      bgColor: "bg-green-50",
      image: "/images/community-driven.png",
    },
  ]

  return (
    <div className="min-h-screen">
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
                        src={recipe.image || "/placeholder.svg?height=200&width=300&query=delicious healthy recipe"}
                        alt={recipe.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                        }}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-gray-900">{recipe.name}</h3>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <div>{recipe.calories} cal</div>
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
