"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Clock, Users, Bookmark, Share2, Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect, useRef } from "react"
import { useRecipe } from "@/hooks/use-recipes"
import { useGroceryList } from "@/hooks/use-grocery-list"
import { useAuthContext } from "@/components/auth/auth-provider"

export default function RecipePage({ params }: { params: { slug: string } }) {
  const { user } = useAuthContext()
  const { recipe, loading, error, toggleFavorite, rateRecipe } = useRecipe(params.slug, user?.id)
  const { addRecipeIngredients } = useGroceryList()
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [isAddingToList, setIsAddingToList] = useState(false)
  const [userRating, setUserRating] = useState<number>(recipe?.user_rating || 0)
  const [userReview, setUserReview] = useState<string>("")
  const [savingRating, setSavingRating] = useState(false)
  const [showSavedMsg, setShowSavedMsg] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUserRating(recipe?.user_rating || 0)
  }, [recipe?.user_rating])

  useEffect(() => {
    // Si el usuario ya tiene review, mostrarlo
    if (recipe && user && recipe.id && recipe.user_rating) {
      // Buscar el review del usuario en la lista de ratings si está disponible
      // (esto depende de cómo se obtienen los datos, aquí solo inicializamos vacío)
      // Si quieres mostrar el review guardado, deberías modificar getRecipeById para incluirlo
      // Por ahora, lo dejamos vacío para que el usuario pueda escribirlo
      setUserReview("")
    }
  }, [recipe, user])

  console.log("Recipe data:", recipe)
  console.log("User:", user)
  console.log("Ingredients:", recipe?.ingredients)

  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredientId) ? prev.filter((id) => id !== ingredientId) : [...prev, ingredientId],
    )
  }

  const addToGroceryList = async () => {
    if (!recipe || !user) {
      alert("Please log in to add ingredients to your grocery list")
      return
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      alert("No ingredients available for this recipe")
      return
    }

    setIsAddingToList(true)
    try {
      await addRecipeIngredients(recipe.id, selectedIngredients.length > 0 ? selectedIngredients : undefined)
      const count = selectedIngredients.length > 0 ? selectedIngredients.length : recipe.ingredients.length
      alert(`${count} ingredients added to grocery list!`)
      setSelectedIngredients([])
    } catch (error) {
      console.error("Error adding to grocery list:", error)
      alert("Failed to add ingredients to grocery list")
    } finally {
      setIsAddingToList(false)
    }
  }

  const getButtonText = () => {
    if (isAddingToList) return "Adding..."
    if (selectedIngredients.length > 0) {
      return `Add Selected to Grocery List (${selectedIngredients.length})`
    }
    const totalIngredients = recipe?.ingredients?.length || 0
    return `Add All to Grocery List (${totalIngredients})`
  }

  const handleStarClick = (star: number) => {
    setUserRating(star)
  }

  const handleSaveRating = async () => {
    if (!user || !recipe) return
    setSavingRating(true)
    try {
      await rateRecipe(userRating, userReview)
      setShowSavedMsg(true)
    } catch (e) {
      alert("Error saving rating: " + (e instanceof Error ? e.message : e))
    } finally {
      setSavingRating(false)
    }
  }

  const shareUrl = typeof window !== "undefined"
    ? window.location.href
    : `https://nutrimate.com/recipes/${params.slug}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      alert("No se pudo copiar el enlace")
    }
  }

  // Cerrar menú si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false)
      }
    }
    if (showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showShareMenu])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipe...</p>
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading recipe: {error}</p>
          <Link href="/recipes">
            <Button>Back to Recipes</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link href="/recipes" className="inline-flex items-center text-gray-600 hover:text-orange-600">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recipes
        </Link>
      </div>

      {/* Recipe Header */}
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{recipe.name}</h1>
        <p className="text-xl text-gray-700 mb-6">{recipe.description}</p>

        <div className="flex flex-wrap items-center gap-6 mb-8">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
            <div>
              <p className="font-medium">By Nutrition Expert</p>
            </div>
          </div>

          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-500 mr-2" />
            <span>{recipe.prep_time_minutes + recipe.cook_time_minutes} minutes</span>
          </div>

          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-500 mr-2" />
            <span>{recipe.servings} servings</span>
          </div>

          <div className="flex items-center">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={!user}
                  onClick={() => handleStarClick(star)}
                  className={`h-5 w-5 focus:outline-none ${star <= userRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star className="h-5 w-5" />
                </button>
              ))}
            </div>
            <span className="ml-2">({recipe.rating_count})</span>
          </div>
        </div>

        {user && (
          <div className="mb-6">
            <textarea
              className="w-full border rounded p-2 mb-2"
              rows={2}
              placeholder="Deja un comentario sobre la receta (opcional)"
              value={userReview}
              onChange={e => setUserReview(e.target.value)}
              disabled={savingRating}
            />
            <Button onClick={handleSaveRating} disabled={savingRating || userRating === 0}>
              {savingRating ? "Guardando..." : "Guardar calificación"}
            </Button>
            {showSavedMsg && <span className="ml-4 text-green-600">¡Guardado!</span>}
          </div>
        )}

        <div className="flex space-x-4 relative">
          <Button variant="outline" onClick={() => setShowShareMenu((v) => !v)}>
            <Share2 className="mr-2 h-4 w-4" />
            Compartir
          </Button>
          {showShareMenu && (
            <div ref={shareMenuRef} className="absolute z-10 top-12 left-0 bg-white border rounded shadow-lg p-3 min-w-[220px]">
              <div className="flex flex-col gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`¡Mira esta receta en NutriMate! ${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-orange-50 rounded px-2 py-1"
                >
                  Compartir por WhatsApp
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(`Receta: ${recipe.name}`)}&body=${encodeURIComponent(`¡Mira esta receta en NutriMate!\n${shareUrl}`)}`}
                  className="hover:bg-orange-50 rounded px-2 py-1"
                >
                  Compartir por Email
                </a>
                <button
                  onClick={handleCopy}
                  className="hover:bg-orange-50 rounded px-2 py-1 text-left"
                >
                  {copied ? "¡Enlace copiado!" : "Copiar enlace"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Image */}
      <div className="container mx-auto px-4 py-6">
        <div className="relative h-[500px] rounded-lg overflow-hidden">
          <Image
            src={recipe.image_url || "/placeholder.svg?height=500&width=1000"}
            alt={recipe.name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Recipe Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Ingredients */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Ingredients</h2>
            <p className="text-gray-700 mb-4">For {recipe.servings} servings</p>

            <ul className="space-y-4">
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                recipe.ingredients.map((ingredient, index) => (
                  <li key={ingredient.id || index} className="flex items-start">
                    <Checkbox
                      id={ingredient.id || `ingredient-${index}`}
                      checked={selectedIngredients.includes(ingredient.id || `ingredient-${index}`)}
                      onCheckedChange={() => toggleIngredient(ingredient.id || `ingredient-${index}`)}
                      className="mt-0.5 mr-3"
                    />
                    <label htmlFor={ingredient.id || `ingredient-${index}`} className="cursor-pointer">
                      {ingredient.quantity} {ingredient.unit} {ingredient.name}
                    </label>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No ingredients available</li>
              )}
            </ul>

            {/* Always show the button section for debugging */}
            <div className="mt-6">
              {/* Show button regardless of conditions for now */}
              <Button
                onClick={addToGroceryList}
                disabled={isAddingToList || !user}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {!user ? "Login to Add to Grocery List" : getButtonText()}
              </Button>

              {!user && (
                <p className="text-sm text-gray-500 mt-2">
                  Please{" "}
                  <Link href="/login" className="text-orange-600 hover:underline">
                    log in
                  </Link>{" "}
                  to add ingredients to your grocery list
                </p>
              )}

              {user && recipe.ingredients && recipe.ingredients.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">Select ingredients to add to your grocery list</p>
              )}
            </div>

            <Separator className="my-8" />

            <div className="space-y-4">
              <h3 className="font-bold text-xl">Nutrition Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Calories</p>
                  <p className="font-medium">{recipe.calories}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Protein</p>
                  <p className="font-medium">{recipe.protein}g</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Carbs</p>
                  <p className="font-medium">{recipe.carbs}g</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fat</p>
                  <p className="font-medium">{recipe.fat}g</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Instructions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Preparation</h2>

            <ol className="space-y-8">
              {recipe.instructions ? (
                recipe.instructions
                  .split("\n")
                  .map((step, index) => {
                    const cleanStep = step.replace(/^\d+\.\s*/, "")
                    if (!cleanStep.trim()) return null

                    return (
                      <li key={index} className="flex">
                        <div className="flex-shrink-0 mr-4">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-100 text-orange-600 font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-800">{cleanStep}</p>
                        </div>
                      </li>
                    )
                  })
                  .filter(Boolean)
              ) : (
                <li className="text-gray-500">No instructions available</li>
              )}
            </ol>

            <Separator className="my-10" />

            <div>
              <h3 className="font-bold text-xl mb-4">Notes</h3>
              <p className="text-gray-700">
                This recipe can be prepared ahead of time and refrigerated for up to 3 days. For dietary modifications,
                feel free to substitute ingredients based on your preferences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
