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
import { IngredientSelector } from "@/components/ingredient-selector"

interface Ingredient {
  name: string
  amount: string // Cantidad libre como "1 taza", "2 cucharadas", etc.
}

interface InstructionStep {
  title: string
  description: string
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
    sugar: 0,
    sodium: 0,
    fiber: 0,
    meal_type: "Desayuno"
  })

  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [instructionSteps, setInstructionSteps] = useState<InstructionStep[]>([{ title: "", description: "" }])


  const addInstructionStep = () => {
    setInstructionSteps([...instructionSteps, { title: "", description: "" }])
  }

  const removeInstructionStep = (index: number) => {
    setInstructionSteps(instructionSteps.filter((_, i) => i !== index))
  }

  const updateInstructionStep = (index: number, field: keyof InstructionStep, value: string) => {
    const updated = instructionSteps.map((step, i) => (i === index ? { ...step, [field]: value } : step))
    setInstructionSteps(updated)
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

    if (instructionSteps.length === 0 || instructionSteps.some(step => !step.title.trim() || !step.description.trim())) {
      setError("At least one instruction step is required")
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
      // Convert instruction steps back to text format
      const instructionsText = instructionSteps
        .filter(step => step.title.trim() && step.description.trim())
        .map((step, index) => `${index + 1}. ${step.title.trim()}\n${step.description.trim()}`)
        .join('\n\n')

      const recipeData = {
        ...formData,
        instructions: instructionsText,
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

      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-serif">{t("recipes.createNewRecipe")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded col-span-2">{error}</div>}

              {/* Left Column */}
              <div className="space-y-6">
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

                </div>
              </div>

              {/* Nutrition Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Nutrition Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="calories">Calories (kcal)</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={formData.calories}
                        onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        value={formData.protein}
                        onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        value={formData.carbs}
                        onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })}
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fat">Fat (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        value={formData.fat}
                        onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })}
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sugar">Sugar (g)</Label>
                      <Input
                        id="sugar"
                        type="number"
                        value={formData.sugar}
                        onChange={(e) => setFormData({ ...formData, sugar: Number(e.target.value) })}
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sodium">Sodium (mg)</Label>
                      <Input
                        id="sodium"
                        type="number"
                        value={formData.sodium}
                        onChange={(e) => setFormData({ ...formData, sodium: Number(e.target.value) })}
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fiber">Fiber (g)</Label>
                      <Input
                        id="fiber"
                        type="number"
                        value={formData.fiber}
                        onChange={(e) => setFormData({ ...formData, fiber: Number(e.target.value) })}
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Ingredients */}
              <div>
                <div className="mb-4">
                  <Label className="text-lg">{t("recipes.ingredients")} *</Label>
                </div>

                <IngredientSelector
                  selectedIngredients={ingredients}
                  onIngredientsChange={setIngredients}
                />
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <Label>Step-by-step instructions *</Label>
                
                <div className="space-y-4">
                  {instructionSteps.map((step, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-500 text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-700">Step {index + 1}</span>
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeInstructionStep(index)}
                          variant="outline"
                          size="sm"
                          disabled={instructionSteps.length === 1}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`step-title-${index}`} className="text-sm font-medium text-gray-600">
                            Step Title
                          </Label>
                          <Input
                            id={`step-title-${index}`}
                            value={step.title}
                            onChange={(e) => updateInstructionStep(index, 'title', e.target.value)}
                            placeholder="e.g., Prepare the Turkey"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`step-description-${index}`} className="text-sm font-medium text-gray-600">
                            Step Description
                          </Label>
                          <Textarea
                            id={`step-description-${index}`}
                            value={step.description}
                            onChange={(e) => updateInstructionStep(index, 'description', e.target.value)}
                            placeholder="e.g., Season the turkey breast with olive oil, salt, and pepper. Set aside."
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addInstructionStep}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
              </div>
            </form>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 mt-6">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700" onClick={handleSubmit}>
                {loading ? t("recipes.creating") : t("recipes.createRecipe")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
