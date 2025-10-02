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
import { IngredientSelector } from "@/components/ingredient-selector"

interface Ingredient {
  name: string
  amount: string
}

interface InstructionStep {
  title: string
  description: string
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
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugar: 0,
    sodium: 0,
    fiber: 0,
  })

  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [instructionSteps, setInstructionSteps] = useState<InstructionStep[]>([])

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
          calories: recipeData.calories || 0,
          protein: recipeData.protein || 0,
          carbs: recipeData.carbs || 0,
          fat: recipeData.fat || 0,
          sugar: recipeData.sugar || 0,
          sodium: recipeData.sodium || 0,
          fiber: recipeData.fiber || 0,
        })
        setIngredients(recipeData.ingredients.map(ing => ({
          name: ing.name,
          amount: ing.amount
        })))

        // Parse existing instructions into steps
        if (recipeData.instructions) {
          const steps = parseInstructionsToSteps(recipeData.instructions)
          setInstructionSteps(steps)
        } else {
          setInstructionSteps([{ title: "", description: "" }])
        }
      } catch (err) {
        console.error("Error loading recipe:", err)
        setError("Failed to load recipe")
      } finally {
        setLoading(false)
      }
    }

    loadRecipe()
  }, [recipeSlug, user])


  // Helper function to parse instructions into steps
  const parseInstructionsToSteps = (instructions: string): InstructionStep[] => {
    if (!instructions.trim()) return [{ title: "", description: "" }]
    
    // Try multiple splitting strategies
    let steps = []
    
    // First try splitting by double newlines (paragraph breaks)
    if (instructions.includes('\n\n')) {
      steps = instructions.split('\n\n')
    }
    // Then try single newlines
    else if (instructions.includes('\n')) {
      steps = instructions.split('\n')
    }
    // Try splitting by periods followed by space and capital letter
    else if (instructions.match(/\.\s+[A-Z]/)) {
      steps = instructions.split(/\.\s+(?=[A-Z])/).map(step => step.trim() + '.')
    }
    // Try splitting by numbers followed by period
    else if (instructions.match(/\d+\./)) {
      steps = instructions.split(/(?=\d+\.)/)
    }
    // If all else fails, try to split by common sentence endings
    else if (instructions.match(/[.!?]\s+/)) {
      steps = instructions.split(/(?<=[.!?])\s+/)
    }
    // Last resort: split by word count (every 20 words)
    else {
      const words = instructions.split(' ')
      steps = []
      for (let i = 0; i < words.length; i += 20) {
        steps.push(words.slice(i, i + 20).join(' '))
      }
    }

    return steps
      .map((step, index) => {
        const cleanStep = step.trim()
          .replace(/^\d+\.\s*/, '') // Remove leading numbers
          .replace(/^[•\-*]\s*/, '') // Remove bullet points
          .replace(/^\d+\)\s*/, '') // Remove numbered lists
          .trim()
        
        if (!cleanStep) return null
        
        // Try to extract title and description
        const firstSentence = cleanStep.split('.')[0]
        const title = firstSentence.length > 50 ? cleanStep.substring(0, 50) + '...' : firstSentence
        const description = cleanStep
        
        return { title, description }
      })
      .filter(Boolean) as InstructionStep[]
  }

  const addInstructionStep = () => {
    setInstructionSteps([...instructionSteps, { title: "", description: "" }])
  }

  const removeInstructionStep = (index: number) => {
    setInstructionSteps(instructionSteps.filter((_, i) => i !== index))
  }

  const updateInstructionStep = (index: number, field: keyof InstructionStep, value: string) => {
    const updated = [...instructionSteps]
    updated[index] = { ...updated[index], [field]: value }
    setInstructionSteps(updated)
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

      if (instructionSteps.length === 0 || instructionSteps.some(step => !step.title.trim() || !step.description.trim())) {
        setError("At least one instruction step is required")
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

      // Convert instruction steps back to text format
      const instructionsText = instructionSteps
        .filter(step => step.title.trim() && step.description.trim())
        .map((step, index) => `${index + 1}. ${step.title.trim()}\n${step.description.trim()}`)
        .join('\n\n')

      // Update recipe
      const updatedRecipe = await updateRecipe(recipeSlug, {
        name: formData.name,
        description: formData.description,
        prep_time_minutes: formData.prep_time_minutes,
        cook_time_minutes: formData.cook_time_minutes,
        servings: formData.servings,
        meal_type: formData.meal_type,
        instructions: instructionsText,
        ingredients: ingredients,
        calories: formData.calories,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat,
        sugar: formData.sugar,
        sodium: formData.sodium,
        fiber: formData.fiber,
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
      <div className="max-w-7xl mx-auto">
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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
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
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <IngredientSelector
                  selectedIngredients={ingredients}
                  onIngredientsChange={setIngredients}
                />
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
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
                            <X className="h-4 w-4" />
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
              </CardContent>
            </Card>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4 mt-6">
          <Link href={`/recipes/${recipeSlug}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={saving} onClick={handleSubmit}>
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
      </div>
    </div>
  )
}
