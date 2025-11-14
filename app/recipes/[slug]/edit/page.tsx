"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, X } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { getRecipeById, updateRecipe } from "@/lib/services/recipe-service"
import type { RecipeWithDetails } from "@/lib/services/recipe-service"
import Link from "next/link"
import { ImageWithFallback } from "@/components/image-with-fallback"

interface Ingredient {
  name: string
  amount: string
}

export default function EditRecipePage() {
  const { t } = useLanguage()
  const { user } = useAuthContext()
  const router = useRouter()
  const params = useParams()
  const recipeSlug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recipe, setRecipe] = useState<RecipeWithDetails | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    image_url: "",
    calories: 0,
  })

  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: "", amount: "" }])

  // Load recipe data
  useEffect(() => {
    const loadRecipe = async () => {
      if (!recipeSlug || !user) return

      try {
        const recipeData = await getRecipeById(recipeSlug, user.id)
        
        if (!recipeData) {
          setError("Recipe not found")
          return
        }

        // Check if user is the creator
        if (recipeData.created_by !== user.id) {
          setError("You don't have permission to edit this recipe")
          return
        }

        setRecipe(recipeData)
        setFormData({
          name: recipeData.name,
          image_url: recipeData.image_url || "",
          calories: recipeData.calories || 0,
        })
        setIngredients(recipeData.ingredients.length > 0 
          ? recipeData.ingredients.map(ing => ({
              name: ing.name,
              amount: ing.amount || ""
            }))
          : [{ name: "", amount: "" }]
        )
      } catch (err) {
        console.error("Error loading recipe:", err)
        setError("Failed to load recipe")
      } finally {
        setLoading(false)
      }
    }

    loadRecipe()
  }, [recipeSlug, user])

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

    if (!user || !recipe) {
      setError("You must be logged in to edit recipes")
      return
    }

    if (!formData.name.trim()) {
      setError("Recipe name is required")
      return
    }

    const validIngredients = ingredients.filter((ing) => ing.name.trim() && ing.amount.trim())
    if (validIngredients.length === 0) {
      setError("At least one ingredient is required")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const recipeData = {
        name: formData.name.trim(),
        image_url: formData.image_url.trim() || undefined,
        calories: formData.calories || 0,
        ingredients: validIngredients,
      }
      
      const updatedRecipe = await updateRecipe(recipe.id, recipeData)

      if (updatedRecipe) {
        router.push(`/recipes/${recipe.id}`)
      } else {
        setError("Failed to update recipe")
      }
    } catch (err) {
      console.error("Error updating recipe:", err)
      setError(err instanceof Error ? err.message : "Failed to update recipe")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading recipe...</p>
        </div>
      </div>
    )
  }

  if (error && !recipe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/recipes">
            <Button>Back to Recipes</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/recipes/${recipe.id}`} className="inline-flex items-center text-gray-600 hover:text-orange-600">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recipe
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-serif">Edit Recipe</CardTitle>
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
                <Label htmlFor="name">Recipe Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter recipe name"
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
                  <Label className="text-lg">Ingredients *</Label>
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
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-orange-600 hover:bg-orange-700">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
