"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Trash2, Loader2, Download, ChefHat, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMealPlans } from "@/hooks/use-meal-plans"
import { useAuthContext } from "@/components/auth/auth-provider"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import type { ExportFormat } from "@/lib/services/meal-plan-service"
import { useLanguage } from "@/lib/i18n/context"
import { FeatureGate } from "@/components/feature-gate"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useSubscription } from "@/hooks/use-subscription"

export default function MealPlansPage() {
  const { user } = useAuthContext()
  const { mealPlans, loading, error, deleteMealPlan, generateMealPlan, exportMealPlan } = useMealPlans()
  const { isPremium } = useSubscription();
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const { toast } = useToast()
  const { t } = useLanguage()
  // Estado para el modal de confirmación
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, id: string | null }>({ open: false, id: null })
  const [customError, setCustomError] = useState<string | null>(null);
  const router = useRouter();

  // Filtrar meal plans personalizados para usuarios no premium
  const filteredMealPlans = isPremium
    ? mealPlans
    : mealPlans.filter(plan => !plan.name.toLowerCase().includes("personalizado"));

  const handleGenerateMealPlan = async () => {
    if (!user) return
    setIsGenerating(true)
    try {
      await generateMealPlan()
      toast({ title: "Meal Plan Generated!", description: "Your new meal plan has been added." })
    } catch (err: any) {
      toast({ title: "Generation Failed", description: err.message || "Failed to generate meal plan. Please try again.", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateCustomMealPlan = () => {
    setCustomError(null);
    if (!user || !user.id) {
      setCustomError(t('mealPlans.mustBeLoggedIn'));
      return;
    }
    router.push(`/meal-plans/custom`);
  };

  const openDeleteDialog = (id: string) => setDeleteDialog({ open: true, id })
  const closeDeleteDialog = () => setDeleteDialog({ open: false, id: null })
  const confirmDeleteMealPlan = async () => {
    if (!deleteDialog.id) return
    try {
      await deleteMealPlan(deleteDialog.id)
      toast({ title: t("mealPlans.deletedTitle"), description: t("mealPlans.deletedDesc") })
    } catch (err: any) {
      toast({ title: t("mealPlans.deletionFailed"), description: err.message || t("mealPlans.deletionFailedDesc"), variant: "destructive" })
    } finally {
      closeDeleteDialog()
    }
  }

  const handleExportMealPlan = async (id: string, formatType: ExportFormat["format"]) => {
    setIsExporting(id)
    try {
      const result = await exportMealPlan(id, { format: formatType, includeNutrition: true })
      const filename = `meal-plan-${id}.${formatType}`
      let mimeType = ""
      let content: string | Blob = ""
      if (typeof result === "string") {
        content = result
        if (formatType === "json") mimeType = "application/json"
        else if (formatType === "csv") mimeType = "text/csv"
        else mimeType = "text/plain"
      } else if (result instanceof Blob) {
        content = result
        mimeType = result.type
      }
      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
      toast({ title: t("mealPlans.exportSuccess"), description: `Meal plan exported as ${formatType.toUpperCase()}.` })
    } catch (err: any) {
      toast({ title: t("mealPlans.exportFailed"), description: err.message || t("mealPlans.exportFailedDesc"), variant: "destructive" })
    } finally {
      setIsExporting(null)
    }
  }

  if (!user && !loading) {
    return (
      <div className="container mx-auto px-4 py-8 font-sans">
        <div className="text-center py-12">
          <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">{t("mealPlans.signInToView")}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t("mealPlans.createPersonalized")}</p>
          <Link href="/login">
            <Button className="bg-orange-600 hover:bg-orange-700">{t("mealPlans.signIn")}</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading && mealPlans.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 font-sans">
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-4">{t("mealPlans.errorLoading")} {error}</p>
          <Button onClick={() => window.location.reload()} className="bg-orange-600 hover:bg-orange-700">
            {t("mealPlans.tryAgain")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-2 md:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Columna izquierda: Meal Plans guardados */}
        <div className="w-full md:w-2/3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{t("mealPlans.myMealPlans")}</h2>
            {(isPremium || mealPlans.length === 0) && (
              <Button
                onClick={handleGenerateMealPlan}
                disabled={isGenerating || loading}
                className="bg-orange-500 hover:bg-orange-600 shadow-sm"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                {t("mealPlans.generate")}
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2">
            {filteredMealPlans.length === 0 && (
              <Card className="text-center py-12 bg-gray-50 border border-dashed">
                <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">{t("mealPlans.noMealPlansYet")}</p>
              </Card>
            )}
            <AnimatePresence>
              {filteredMealPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="flex"
                >
                  <Card className="flex flex-col md:flex-row items-center justify-between p-4 w-full hover:shadow-lg transition border border-gray-200 dark:border-gray-700">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-2">{plan.name}</CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        {format(new Date(plan.start_date), "MMM d, yyyy")} - {format(new Date(plan.end_date), "MMM d, yyyy")}
                      </CardDescription>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{t('mealPlans.sevenDays')}</Badge>
                        {plan.name.toLowerCase().includes("personalizado") && (
                          <Badge variant="outline">{t('mealPlans.personalized')}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0 md:ml-4">
                      <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
                        <Link href={`/meal-plans/${plan.id}`}>{t("mealPlans.viewMealPlan")}</Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExportMealPlan(plan.id, "pdf")}
                        disabled={isExporting === plan.id}>
                        {isExporting === plan.id ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Download className="h-3 w-3 mr-1.5" />}
                        {t("mealPlans.exportMealPlan")}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(plan.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        {/* Columna derecha: Crear nuevo Meal Plan */}
        <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
          {isPremium && (
            <Card className="w-full p-6 bg-orange-50 border-orange-200 shadow-md flex flex-col items-center">
              <CardTitle className="text-xl mb-2 text-center">{t('mealPlans.createCustomMealPlanTitle')}</CardTitle>
              <CardDescription className="mb-4 text-center text-gray-600">
                {t('mealPlans.createCustomMealPlanDesc')}
              </CardDescription>
              <Button
                size="lg"
                className="w-full bg-orange-600 hover:bg-orange-700 text-lg font-bold py-4 rounded-xl shadow"
                onClick={handleGenerateCustomMealPlan}
              >
                <Plus className="h-5 w-5 mr-2" />
                {t('mealPlans.createCustomMealPlanButton')}
              </Button>
              {customError && (
                <div className="text-red-600 mt-4 text-center font-semibold">
                  {customError}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
      {/* Dialog de confirmación de borrado */}
      <Dialog open={deleteDialog.open} onOpenChange={open => { if (!open) closeDeleteDialog() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("mealPlans.confirmDeleteTitle")}</DialogTitle>
            <DialogDescription>{t("mealPlans.confirmDeleteDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDeleteDialog}>{t("common.cancel")}</Button>
            <Button variant="destructive" onClick={confirmDeleteMealPlan}>{t("common.delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
