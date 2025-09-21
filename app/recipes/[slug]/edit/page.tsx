"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Save } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { getRecipeById, updateRecipe } from "@/lib/services/recipe-service"
import type { RecipeWithDetails } from "@/lib/services/recipe-service"
import Link from "next/link"

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
    description: "",
    prep_time_minutes: 0,
    cook_time_minutes: 0,
    servings: 1,
    meal_type: "Breakfast",
    instructions: "",
  })

  const [ingredients, setIngredients] = useState<Ingredient[]>([])

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
          description: recipeData.description || "",
          prep_time_minutes: recipeData.prep_time_minutes,
          cook_time_minutes: recipeData.cook_time_minutes,
          servings: recipeData.servings,
          meal_type: recipeData.meal_type || "Breakfast",
          instructions: recipeData.instructions,
        })
        setIngredients(recipeData.ingredients.map(ing => ({
          name: ing.name,
          amount: ing.amount
        })))
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
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], [field]: value }
    setIngredients(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !recipe) return

    setSaving(true)
    setError(null)

    try {
      // Validate form
      if (!formData.name.trim()) {
        setError("Recipe name is required")
        return
      }

      if (!formData.instructions.trim()) {
        setError("Instructions are required")
        return
      }

      if (ingredients.length === 0) {
        setError("At least one ingredient is required")
        return
      }

      // Validate ingredients
      for (const ingredient of ingredients) {
        if (!ingredient.name.trim() || !ingredient.amount.trim()) {
          setError("All ingredients must have both name and amount")
          return
        }
      }

      // Update recipe
      const updatedRecipe = await updateRecipe(recipeSlug, {
        name: formData.name,
        description: formData.description,
        prep_time_minutes: formData.prep_time_minutes,
        cook_time_minutes: formData.cook_time_minutes,
        servings: formData.servings,
        meal_type: formData.meal_type,
        instructions: formData.instructions,
        ingredients: ingredients,
      })

      if (updatedRecipe) {
        router.push(`/recipes/${recipeSlug}`)
      } else {
        setError("Failed to update recipe")
      }
    } catch (err) {
      console.error("Error updating recipe:", err)
      setError("Failed to update recipe")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/recipes">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/recipes/${recipeSlug}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipe
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Recipe</h1>
            <p className="text-gray-600">Update your recipe details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Recipe Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter recipe name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the recipe"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prep_time">Prep Time (min)</Label>
                  <Input
                    id="prep_time"
                    type="number"
                    value={formData.prep_time_minutes}
                    onChange={(e) => setFormData({ ...formData, prep_time_minutes: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cook_time">Cook Time (min)</Label>
                  <Input
                    id="cook_time"
                    type="number"
                    value={formData.cook_time_minutes}
                    onChange={(e) => setFormData({ ...formData, cook_time_minutes: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meal_type">Meal Type</Label>
                  <Select value={formData.meal_type} onValueChange={(value) => setFormData({ ...formData, meal_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Breakfast">Breakfast</SelectItem>
                      <SelectItem value="Lunch">Lunch</SelectItem>
                      <SelectItem value="Dinner">Dinner</SelectItem>
                      <SelectItem value="Snack">Snack</SelectItem>
                      <SelectItem value="Dessert">Dessert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`ingredient-name-${index}`}>Ingredient Name</Label>
                      <Input
                        id={`ingredient-name-${index}`}
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, "name", e.target.value)}
                        placeholder="e.g., Wheat flour"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`ingredient-amount-${index}`}>Amount</Label>
                      <Input
                        id={`ingredient-amount-${index}`}
                        value={ingredient.amount}
                        onChange={(e) => updateIngredient(index, "amount", e.target.value)}
                        placeholder="e.g., 1 cup, 2 tablespoons, 500g"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                    className="mt-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addIngredient} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Ingredient
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="instructions">Step-by-step instructions *</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Enter step-by-step instructions..."
                  rows={8}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href={`/recipes/${recipeSlug}`}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Recipe
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
