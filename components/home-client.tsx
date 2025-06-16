"use client"

import Link from "next/link"
import { ChefHat, ShoppingCart, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import MealCard from "@/components/meal-card"
import { useLanguage } from "@/lib/i18n/context"

interface HomeClientProps {
  isLoggedIn: boolean
  featuredRecipes: any[]
}

export default function HomeClient({ isLoggedIn, featuredRecipes }: HomeClientProps) {
  const { t } = useLanguage()

  return (
    <>
      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{t("home.title")}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">{t("home.subtitle")}</p>
            <div className="flex flex-wrap gap-4">
              {!isLoggedIn && (
                <Button asChild size="lg">
                  <Link href="/signup">{t("home.getStarted")}</Link>
                </Button>
              )}
              <Button asChild variant="outline" size="lg">
                <Link href="/recipes">{t("home.exploreRecipes")}</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden">
            <img
              src="/images/cooking-illustration.png"
              alt="Cooking Illustration"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">{t("home.featuresTitle")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("home.discoverRecipes")}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t("home.discoverRecipesDesc")}</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("home.planMeals")}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t("home.planMealsDesc")}</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("home.groceryLists")}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t("home.groceryListsDesc")}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">{t("home.featuredRecipes")}</h2>
          <Button asChild variant="outline">
            <Link href="/recipes">{t("home.viewAll")}</Link>
          </Button>
        </div>

        {featuredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRecipes.slice(0, 3).map((recipe) => (
              <MealCard
                key={recipe.id}
                title={recipe.meal_type || t("recipes.title")}
                recipe={recipe.name}
                calories={recipe.calories || 0}
                protein={recipe.protein || 0}
                carbs={recipe.carbs || 0}
                fat={recipe.fat || 0}
                time={(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)}
                image={recipe.image_url || "/placeholder.svg?height=200&width=300"}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">{t("common.noResults")}</p>
            <Button asChild className="mt-4">
              <Link href="/recipes">{t("home.exploreRecipes")}</Link>
            </Button>
          </div>
        )}
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-12 mb-8">
          <Card className="bg-primary text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">{t("home.ctaTitle")}</h2>
              <p className="text-xl mb-6 max-w-2xl mx-auto">{t("home.ctaDesc")}</p>
              <Button asChild size="lg" variant="secondary">
                <Link href="/signup">{t("home.signUpNow")}</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}
    </>
  )
}
