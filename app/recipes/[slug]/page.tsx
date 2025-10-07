"use client"

import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { useRecipe } from "@/hooks/use-recipes"
import { useGroceryList } from "@/hooks/use-grocery-list"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useUserFavorites } from "@/hooks/use-user-favorites"
import { useLanguage } from "@/lib/i18n/context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { RecipeDetailNew } from "@/components/recipe-detail-new"

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t("common.loading")}...</p>
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{t("recipes.error")} {t("common.loading")} {t("recipes.recipe")}: {error}</p>
          <Link href="/recipes">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
              {t("recipes.backToRecipes")}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <RecipeDetailNew
        recipe={recipe}
        user={user}
        selectedIngredients={selectedIngredients}
        toggleIngredient={toggleIngredient}
        addToGroceryList={addToGroceryList}
        isAddingToList={isAddingToList}
        userRating={userRating}
        handleStarClick={handleStarClick}
        handleSaveRating={handleSaveRating}
        savingRating={savingRating}
        showSavedMsg={showSavedMsg}
        showShareMenu={showShareMenu}
        setShowShareMenu={setShowShareMenu}
        shareMenuRef={shareMenuRef}
        handleCopy={handleCopy}
        copied={copied}
        shareUrl={shareUrl}
        t={t}
      />

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
              <Button autoFocus>{t("common.accept")}</Button>
            </DialogClose>
            <Link href="/pricing">
              <Button variant="outline">Hazte Premium</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
