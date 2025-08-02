"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Minus, ArrowLeft } from "lucide-react"
import { recipeService } from "@/lib/services/recipe-service"
import { useAuthContext } from "@/components/auth/auth-provider"
import Link from "next/link"

interface Ingredient {
  name: string
  quantity: string
  unit: string
}

export default function NewRecipePage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    instructions: "",
    prep_time_minutes: 0,
    cook_time_minutes: 0,
    servings: 1,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    image_url: "",
    meal_type: "Breakfast"
  })

  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: "", quantity: "", unit: "" }])

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }])
  }

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index))
    }
  }

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = ingredients.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    setIngredients(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError("You must be logged in to create recipes")
      return
    }

    if (!formData.name.trim()) {
      setError("Recipe name is required")
      return
    }

    if (!formData.instructions.trim()) {
      setError("Instructions are required")
      return
    }

    const validIngredients = ingredients.filter((ing) => ing.name.trim() && ing.quantity.trim())
    if (validIngredients.length === 0) {
      setError("At least one ingredient is required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const recipe = await recipeService.createRecipe({
        ...formData,
        ingredients: validIngredients,
      })

      if (recipe) {
        router.push(`/recipes/${recipe.id}`)
      }
    } catch (err) {
      console.error("Error creating recipe:", err)
      setError(err instanceof Error ? err.message : "Failed to create recipe")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Login Required</h1>
          <p className="text-gray-600 mb-4">You must be logged in to create recipes.</p>
          <Link href="/login">
            <Button>Login</Button>
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
            Back to Recipes
          </Link>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-serif">Create New Recipe</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
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

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the recipe"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="meal_type">Tipo de comida *</Label>
                    <select
                      id="meal_type"
                      className="w-full border rounded px-3 py-2"
                      value={formData.meal_type}
                      onChange={e => setFormData({ ...formData, meal_type: e.target.value })}
                      required
                    >
                      <option value="Breakfast">Desayuno</option>
                      <option value="Lunch">Comida/Almuerzo</option>
                      <option value="Dinner">Cena</option>
                      <option value="Dessert">Postre</option>
                      <option value="Snack">Snack/Colación</option>
                      <option value="Sidedish">Guarnición</option>
                      <option value="Soups">Sopa</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prep_time">Prep Time (min)</Label>
                      <Input
                        id="prep_time"
                        type="number"
                        value={formData.prep_time_minutes}
                        onChange={(e) =>
                          setFormData({ ...formData, prep_time_minutes: Number.parseInt(e.target.value) || 0 })
                        }
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cook_time">Cook Time (min)</Label>
                      <Input
                        id="cook_time"
                        type="number"
                        value={formData.cook_time_minutes}
                        onChange={(e) =>
                          setFormData({ ...formData, cook_time_minutes: Number.parseInt(e.target.value) || 0 })
                        }
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="servings">Servings</Label>
                    <Input
                      id="servings"
                      type="number"
                      value={formData.servings}
                      onChange={(e) => setFormData({ ...formData, servings: Number.parseInt(e.target.value) || 1 })}
                      min="1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="calories">Calories</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={formData.calories}
                        onChange={(e) => setFormData({ ...formData, calories: Number.parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        value={formData.protein}
                        onChange={(e) => setFormData({ ...formData, protein: Number.parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        value={formData.carbs}
                        onChange={(e) => setFormData({ ...formData, carbs: Number.parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fat">Fat (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        value={formData.fat}
                        onChange={(e) => setFormData({ ...formData, fat: Number.parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg">Ingredients *</Label>
                  <Button type="button" onClick={addIngredient} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ingredient
                  </Button>
                </div>

                <div className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Input
                          placeholder="Ingredient name"
                          value={ingredient.name}
                          onChange={(e) => updateIngredient(index, "name", e.target.value)}
                        />
                      </div>
                      <div className="w-24">
                        <Input
                          placeholder="Qty"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                        />
                      </div>
                      <div className="w-24">
                        <Input
                          placeholder="Unit"
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        variant="outline"
                        size="sm"
                        disabled={ingredients.length === 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <Label htmlFor="instructions">Instructions *</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Enter step-by-step instructions..."
                  rows={8}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                  {loading ? "Creating..." : "Create Recipe"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  )
}
