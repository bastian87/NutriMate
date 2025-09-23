"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Clock, Users, Bookmark, Share2, Star, ShoppingCart, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect, useRef } from "react"
import { useRecipe } from "@/hooks/use-recipes"
import { useGroceryList } from "@/hooks/use-grocery-list"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useUserFavorites } from "@/hooks/use-user-favorites"
import { useLanguage } from "@/lib/i18n/context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"

// Limpia los enlaces <a>...</a> de la descripción
function cleanDescription(html = ""): string {
  return html.replace(/<a [^>]+>(.*?)<\/a>/gi, "$1");
}

export default function RecipePage({ params }: { params: { slug: string } }) {
  const { user } = useAuthContext()
  const { t } = useLanguage()
  const { recipe, loading, error, toggleFavorite, rateRecipe } = useRecipe(params.slug, user?.id)
  const { addRecipeIngredients } = useGroceryList(false)
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [isAddingToList, setIsAddingToList] = useState(false)
  const [userRating, setUserRating] = useState<number>(recipe?.user_rating || 0)
  // const [userReview, setUserReview] = useState<string>("") // Removido - solo calificaciones
  const [savingRating, setSavingRating] = useState(false)
  const [showSavedMsg, setShowSavedMsg] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { tryAddFavorite, showLimitModal, setShowLimitModal } = useUserFavorites()

  useEffect(() => {
    setUserRating(recipe?.user_rating || 0)
  }, [recipe?.user_rating])

  useEffect(() => {
    // Si el usuario ya tiene calificación, mostrarla
    if (recipe && user && recipe.id && recipe.user_rating) {
      setUserRating(recipe.user_rating)
    }
  }, [recipe, user])

  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredientId) ? prev.filter((id) => id !== ingredientId) : [...prev, ingredientId],
    )
  }

  const addToGroceryList = async () => {
    if (!recipe || !user) {
      alert(t("recipes.pleaseLogin"))
      return
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      alert(t("recipes.noIngredientsAvailable"))
      return
    }

    setIsAddingToList(true)
    try {
      await addRecipeIngredients(recipe.id, selectedIngredients.length > 0 ? selectedIngredients : undefined)
      const count = selectedIngredients.length > 0 ? selectedIngredients.length : recipe.ingredients.length
      toast({
        title: `${count} ${t("recipes.ingredientsAdded")}`,
        description: t("recipes.viewInGroceryList"),
        variant: "default"
      });
      setSelectedIngredients([])
    } catch (error) {
      console.error("Error adding to grocery list:", error)
      alert(t("recipes.failedToAdd"))
    } finally {
      setIsAddingToList(false)
    }
  }

  const getButtonText = () => {
    if (isAddingToList) return t("recipes.adding")
    if (selectedIngredients.length > 0) {
      return `${t("recipes.addSelectedToGroceryList")} (${selectedIngredients.length})`
    }
    const totalIngredients = recipe?.ingredients?.length || 0
    return `${t("recipes.addAllToGroceryList")} (${totalIngredients})`
  }

  const handleStarClick = (star: number) => {
    setUserRating(star)
  }

  const handleSaveRating = async () => {
    if (!user || !recipe) return
    setSavingRating(true)
    try {
      await rateRecipe(userRating, "") // Solo calificación, sin comentario
      setShowSavedMsg(true)
    } catch (e) {
      alert(t("recipes.errorSavingRating") + (e instanceof Error ? e.message : e))
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
          <p className="mt-4 text-gray-600">{t("common.loading")}...</p>
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t("recipes.error")} {t("common.loading")} {t("recipes.recipe")}: {error}</p>
          <Link href="/recipes">
            <Button>{t("recipes.backToRecipes")}</Button>
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
          {t("recipes.backToRecipes")}
        </Link>
      </div>

      {/* Recipe Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{recipe.name}</h1>
          
          {recipe.description && (
            <p
              className="text-xl text-gray-600 mb-8 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: cleanDescription(recipe.description || "") }}
            />
          )}

          {/* Recipe Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-gray-700">{recipe.prep_time_minutes + recipe.cook_time_minutes} {t("recipes.minutes")}</span>
            </div>

            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-gray-700">{recipe.servings} {t("recipes.servings")}</span>
            </div>

            <div className="flex items-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={!user}
                    onClick={() => handleStarClick(star)}
                    className={`h-5 w-5 focus:outline-none mr-1 ${star <= userRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    aria-label={`${t("recipes.rate")} ${star} ${t("recipes.stars")}`}
                  >
                    <Star className="h-5 w-5" />
                  </button>
                ))}
              </div>
              <span className="ml-2 text-gray-700">({recipe.rating_count})</span>
            </div>

            {/* Creator Information */}
            {recipe.creator && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                  <span className="text-orange-600 font-semibold text-sm">
                    {recipe.creator.username ? recipe.creator.username.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {recipe.creator.username || recipe.creator.full_name || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500">Creador</p>
                </div>
              </div>
            )}

            <div className="flex items-center ml-auto gap-2">
              {/* Edit Button - Only show if user is the creator */}
              {user && recipe.created_by === user.id && (
                <Link href={`/recipes/${recipe.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </Link>
              )}

              <Button variant="outline" onClick={() => setShowShareMenu((v) => !v)} className="relative">
                <Share2 className="mr-2 h-4 w-4" />
                {t("recipes.share")}
              </Button>
              {showShareMenu && (
                <div ref={shareMenuRef} className="absolute z-10 top-12 right-0 bg-white border rounded-lg shadow-lg p-3 min-w-[220px]">
                  <div className="flex flex-col gap-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`¡Mira esta receta en NutriMate! ${shareUrl}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-orange-50 rounded px-3 py-2 text-sm"
                    >
                      {t("recipes.shareWhatsApp")}
                    </a>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(`Receta: ${recipe.name}`)}&body=${encodeURIComponent(`¡Mira esta receta en NutriMate!\n${shareUrl}`)}`}
                      className="hover:bg-orange-50 rounded px-3 py-2 text-sm"
                    >
                      {t("recipes.shareEmail")}
                    </a>
                    <button
                      onClick={handleCopy}
                      className="hover:bg-orange-50 rounded px-3 py-2 text-sm text-left"
                    >
                      {copied ? t("recipes.linkCopied") : t("recipes.copyLink")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Recipe Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Preparation (Main Content) */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">{t("recipes.preparation")}</h2>

              {recipe.instructions && recipe.instructions.trim() ? (
                <ol className="space-y-6">
                  {recipe.instructions
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
                          <div className="flex-1">
                            <p className="text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: cleanDescription(cleanStep) }} />
                          </div>
                        </li>
                      )
                    })
                    .filter(Boolean)}
                </ol>
              ) : (
                <div className="text-gray-500">{t("recipes.noInstructionsAvailable")}</div>
              )}

              {/* Notes Section */}
              {recipe.description && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">{t("recipes.notes")}</h3>
                  <p
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: cleanDescription(recipe.description || "") }}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Ingredients (Sidebar) */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold mb-6">{t("recipes.ingredients")}</h2>
              <p className="text-gray-700 mb-4">{t("recipes.forServings", { servings: recipe.servings })}</p>

              <ul className="space-y-3 mb-6">
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((ingredient, index) => (
                    <li key={ingredient.id || index} className="flex items-start">
                      <Checkbox
                        id={ingredient.id || `ingredient-${index}`}
                        checked={selectedIngredients.includes(ingredient.id || `ingredient-${index}`)}
                        onCheckedChange={() => toggleIngredient(ingredient.id || `ingredient-${index}`)}
                        className="mt-1 mr-3"
                      />
                      <label htmlFor={ingredient.id || `ingredient-${index}`} className="cursor-pointer text-gray-700">
                        {ingredient.original ? ingredient.original : `${ingredient.amount} ${ingredient.name}`}
                      </label>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">{t("recipes.noIngredientsAvailableText")}</li>
                )}
              </ul>

              <Button
                onClick={addToGroceryList}
                disabled={isAddingToList || !user}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-sm py-2"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {!user ? t("recipes.loginToAdd") : getButtonText()}
              </Button>

              {!user && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {t("recipes.pleaseLogin")}{" "}
                  <Link href="/login" className="text-orange-600 hover:underline">
                    {t("recipes.logIn")}
                  </Link>
                </p>
              )}

              {user && recipe.ingredients && recipe.ingredients.length > 0 && (
                <p className="text-xs text-gray-500 mt-2 text-center">{t("recipes.selectIngredients")}</p>
              )}
            </div>
          </div>

          {/* Nutrition Information Section */}
          {(recipe.calories || recipe.protein || recipe.carbs || recipe.fat) && (
            <div className="mb-12">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-6">{t("recipes.nutritionInformation")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {recipe.calories && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">Calories</p>
                      <p className="text-2xl font-bold text-orange-600">{recipe.calories}</p>
                    </div>
                  )}
                  {recipe.protein && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">Protein</p>
                      <p className="text-2xl font-bold text-orange-600">{recipe.protein}g</p>
                    </div>
                  )}
                  {recipe.carbs && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">Carbs</p>
                      <p className="text-2xl font-bold text-orange-600">{recipe.carbs}g</p>
                    </div>
                  )}
                  {recipe.fat && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">Fat</p>
                      <p className="text-2xl font-bold text-orange-600">{recipe.fat}g</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Rating and Comments Section */}
          {user && (
            <div className="mb-12">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-6">{t("recipes.rate")} {t("recipes.recipe")}</h3>
                
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <span className="text-sm font-medium text-gray-700 mr-4">{t("recipes.rate")}:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleStarClick(star)}
                          className={`h-6 w-6 focus:outline-none mr-1 ${star <= userRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          aria-label={`${t("recipes.rate")} ${star} ${t("recipes.stars")}`}
                        >
                          <Star className="h-6 w-6" />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Comentarios removidos - solo calificaciones */}
                  
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={handleSaveRating} 
                      disabled={savingRating || userRating === 0}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {savingRating ? t("recipes.saving") : t("recipes.saveRating")}
                    </Button>
                    {showSavedMsg && (
                      <span className="text-green-600 font-medium">{t("recipes.saved")}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Límite alcanzado</DialogTitle>
            <DialogDescription>
              No puedes guardar más de 10 recetas en la versión gratuita. Hazte premium para guardar recetas ilimitadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button autoFocus>Aceptar</Button>
            </DialogClose>
            <Link href="/pricing">
              <Button variant="outline">Hazte Premium</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
