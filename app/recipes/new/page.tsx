"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Minus, ArrowLeft, X } from "lucide-react"
import { recipeService } from "@/lib/services/recipe-service"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { useLanguage } from "@/lib/i18n/context"
import Link from "next/link"
import { ImageWithFallback } from "@/components/image-with-fallback"

interface Ingredient {
  name: string
  amount: string
}

export default function NewRecipePage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    image_url: "",
    calories: 0,
  })

  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: "", amount: "" }])

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "" }])
  }

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index))
    }
  }

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = ingredients.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    )
    setIngredients(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError(t("recipes.mustBeLoggedIn"))
      return
    }

    if (!formData.name.trim()) {
      setError(t("recipes.recipeNameRequired"))
      return
    }

    const validIngredients = ingredients.filter((ing) => ing.name.trim() && ing.amount.trim())
    if (validIngredients.length === 0) {
      setError(t("recipes.atLeastOneIngredient"))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const recipeData = {
        name: formData.name.trim(),
        image_url: formData.image_url.trim() || undefined,
        calories: formData.calories || 0,
        ingredients: validIngredients,
      }
      
      const recipe = await recipeService.createRecipe(recipeData)

      if (recipe) {
        router.push(`/recipes/${recipe.id}`)
      } else {
        setError(t("recipes.noDataReturned"))
      }
    } catch (err) {
      console.error("Error creating recipe:", err)
      setError(err instanceof Error ? err.message : t("recipes.failedToCreate"))
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t("recipes.loginRequired")}</h1>
          <p className="text-gray-600 mb-4">{t("recipes.mustBeLoggedIn")}</p>
          <Link href="/login">
            <Button>{t("auth.signIn")}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/recipes" className="inline-flex items-center text-gray-600 hover:text-orange-600">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("recipes.backToRecipes")}
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-serif">{t("recipes.createNewRecipe")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Recipe Name */}
              <div>
                <Label htmlFor="name">{t("recipes.recipeName")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("recipes.enterRecipeName")}
                  required
                />
              </div>

              {/* Recipe Image URL */}
              <div>
                <Label htmlFor="image_url">Photo URL (optional)</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image_url && (
                  <div className="mt-4 rounded-lg overflow-hidden max-w-md">
                    <ImageWithFallback
                      src={formData.image_url}
                      alt="Preview"
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Calories */}
              <div>
                <Label htmlFor="calories">Calories *</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              {/* Ingredients */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <Label className="text-lg">{t("recipes.ingredients")} *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addIngredient}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ingredient
                  </Button>
                </div>

                <div className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <Input
                            placeholder="Ingredient name"
                            value={ingredient.name}
                            onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Input
                            placeholder="Amount (e.g., 1 cup, 200g)"
                            value={ingredient.amount}
                            onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                        disabled={ingredients.length === 1}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                  {loading ? t("recipes.creating") : t("recipes.createRecipe")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
