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
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { useLanguage } from "@/lib/i18n/context"
import Link from "next/link"

interface Ingredient {
  name: string
  amount: string // Cantidad libre como "1 taza", "2 cucharadas", etc.
}

export default function NewRecipePage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { t } = useLanguage()
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
    meal_type: "Desayuno"
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
    const updated = ingredients.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    setIngredients(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted!")

    if (!user) {
      setError(t("recipes.mustBeLoggedIn"))
      return
    }

    if (!formData.name.trim()) {
      setError(t("recipes.recipeNameRequired"))
      return
    }

    if (!formData.instructions.trim()) {
      setError(t("recipes.instructionsRequired"))
      return
    }

    const validIngredients = ingredients.filter((ing) => ing.name.trim() && ing.amount.trim())
    if (validIngredients.length === 0) {
      setError(t("recipes.atLeastOneIngredient"))
      return
    }

    console.log("Validation passed, creating recipe...")
    setLoading(true)
    setError(null)

    try {
      const recipeData = {
        ...formData,
        ingredients: validIngredients,
        created_by: user.id,
      }
      
      console.log("Recipe data:", recipeData)
      
      const recipe = await recipeService.createRecipe(recipeData)
      console.log("Recipe created:", recipe)

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

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-serif">{t("recipes.createNewRecipe")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
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

                  <div>
                    <Label htmlFor="description">{t("recipes.description")}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t("recipes.briefDescription")}
                      rows={3}
                    />
                  </div>


                  <div>
                    <Label htmlFor="meal_type">{t("recipes.mealType")} *</Label>
                    <select
                      id="meal_type"
                      className="w-full border rounded px-3 py-2"
                      value={formData.meal_type}
                      onChange={e => setFormData({ ...formData, meal_type: e.target.value })}
                      required
                    >
                      <option value="Desayuno">Desayuno</option>
                      <option value="Almuerzo">Almuerzo</option>
                      <option value="Cena">Cena</option>
                      <option value="Postre">Postre</option>
                      <option value="Merienda">Merienda</option>
                      <option value="Acompañamiento">Acompañamiento</option>
                      <option value="Sopa">Sopa</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prep_time">{t("recipes.prepTimeMinutes")}</Label>
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
                      <Label htmlFor="cook_time">{t("recipes.cookTimeMinutes")}</Label>
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
                    <Label htmlFor="servings">{t("recipes.servings")}</Label>
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
                      <Label htmlFor="calories">{t("recipes.calories")}</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={formData.calories}
                        onChange={(e) => setFormData({ ...formData, calories: Number.parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="protein">{t("recipes.protein")} (g)</Label>
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
                      <Label htmlFor="carbs">{t("recipes.carbs")} (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        value={formData.carbs}
                        onChange={(e) => setFormData({ ...formData, carbs: Number.parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fat">{t("recipes.fat")} (g)</Label>
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
                  <Label className="text-lg">{t("recipes.ingredients")} *</Label>
                  <Button type="button" onClick={addIngredient} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("recipes.addIngredient")}
                  </Button>
                </div>

                <div className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`ingredient-name-${index}`} className="text-sm font-medium text-gray-700">
                          {t("recipes.ingredientName")}
                        </Label>
                        <Input
                          id={`ingredient-name-${index}`}
                          placeholder={t("recipes.ingredientNamePlaceholder")}
                          value={ingredient.name}
                          onChange={(e) => updateIngredient(index, "name", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`ingredient-amount-${index}`} className="text-sm font-medium text-gray-700">
                          {t("recipes.amount")}
                        </Label>
                        <Input
                          id={`ingredient-amount-${index}`}
                          placeholder={t("recipes.amountPlaceholder")}
                          value={ingredient.amount}
                          onChange={(e) => updateIngredient(index, "amount", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        variant="outline"
                        size="sm"
                        disabled={ingredients.length === 1}
                        className="self-end"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  💡 {t("recipes.amountTip")}
                </p>
              </div>

              {/* Instructions */}
              <div>
                <Label htmlFor="instructions">{t("recipes.instructions")} *</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder={t("recipes.enterInstructions")}
                  rows={8}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
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
  )
}
