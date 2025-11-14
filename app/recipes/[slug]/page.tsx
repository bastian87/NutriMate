"use client"

import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { useRecipe } from "@/hooks/use-recipes"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
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
  const { recipe, loading, error, toggleFavorite } = useRecipe(params.slug, user?.id)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)
  const { tryAddFavorite, showLimitModal, setShowLimitModal } = useUserFavorites()



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
