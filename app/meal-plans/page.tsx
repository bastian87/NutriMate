"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Calendar, Users, Trash2, ChefHat, Loader2, Download } from "lucide-react"
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
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useSubscription } from "@/hooks/use-subscription"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export default function MealPlansPage() {
  const { user } = useAuthContext()
  const { mealPlans, loading, error, deleteMealPlan, generateMealPlan, exportMealPlan } = useMealPlans()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState<string | null>(null) // Store ID of plan being exported
  const { toast } = useToast()
  const { t } = useLanguage()
  const { isPremium } = useSubscription()
  // Estado para el modal de confirmación
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, id: string | null }>({ open: false, id: null })
  const [customMealPlan, setCustomMealPlan] = useState<any>(null);
  const [distribution, setDistribution] = useState<{
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  }>({
    breakfast: 0.3,
    lunch: 0.4,
    dinner: 0.3,
    snack: 0,
  });
  const [customError, setCustomError] = useState<string | null>(null);

  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  const router = useRouter();

  const handleGenerateMealPlan = async () => {
    if (!user) return

    setIsGenerating(true)
    try {
      await generateMealPlan()
      toast({
        title: "Meal Plan Generated!",
        description: "Your new meal plan has been added.",
      })
    } catch (err: any) {
      console.error("Error generating meal plan:", err)
      toast({
        title: "Generation Failed",
        description: err.message || "Failed to generate meal plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateCustomMealPlan = () => {
    setCustomError(null);
    if (!user || !user.id) {
      setCustomError("Debes iniciar sesión para generar un meal plan.");
      return;
    }
    // Pasar la distribución como query param codificado en base64
    const distStr = btoa(encodeURIComponent(JSON.stringify(distribution)));
    router.push(`/meal-plans/custom?distribution=${distStr}`);
  };

  // Nueva función para abrir el modal
  const openDeleteDialog = (id: string) => setDeleteDialog({ open: true, id })
  // Nueva función para cerrar el modal
  const closeDeleteDialog = () => setDeleteDialog({ open: false, id: null })
  // Nueva función para confirmar borrado
  const confirmDeleteMealPlan = async () => {
    if (!deleteDialog.id) return
    try {
      await deleteMealPlan(deleteDialog.id)
      toast({
        title: t("mealPlans.deletedTitle"),
        description: t("mealPlans.deletedDesc"),
      })
    } catch (err: any) {
      console.error("Error deleting meal plan:", err)
      toast({
        title: t("mealPlans.deletionFailed"),
        description: err.message || t("mealPlans.deletionFailedDesc"),
        variant: "destructive",
      })
    } finally {
      closeDeleteDialog()
    }
  }

  const handleExportMealPlan = async (id: string, formatType: ExportFormat["format"]) => {
    setIsExporting(id)
    try {
      if (formatType === "pdf") {
        // Obtener el mealPlan completo con meals y recetas
        const mealPlan = await exportMealPlan(id, { format: "json", includeNutrition: true })
        const mealPlanData = typeof mealPlan === "string" ? JSON.parse(mealPlan) : mealPlan
        // Crear PDF visual
        const pdfDoc = await PDFDocument.create()
        let page = pdfDoc.addPage([595, 842]) // A4
        const { width, height } = page.getSize()
        const margin = 40
        let y = height - margin
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
        // Título
        page.drawText(mealPlanData.name, {
          x: margin,
          y: y,
          size: 24,
          font,
          color: rgb(1, 0.4, 0),
        })
        y -= 32
        // Fechas
        page.drawText(`${t("mealPlans.period")}: ${mealPlanData.startDate} - ${mealPlanData.endDate}`, {
          x: margin,
          y: y,
          size: 12,
          font: fontRegular,
          color: rgb(0.3, 0.3, 0.3),
        })
        y -= 28
        // Tabla headers
        const headers = [
          t("mealPlans.day"),
          t("mealPlans.mealType"),
          t("mealPlans.recipe"),
          t("mealPlans.prepTime"),
          t("mealPlans.cookTime"),
          t("mealPlans.calories"),
          t("mealPlans.protein"),
          t("mealPlans.carbs"),
          t("mealPlans.fat"),
        ]
        let x = margin
        headers.forEach((header, i) => {
          page.drawText(header, {
            x: x,
            y: y,
            size: 10,
            font,
            color: rgb(1, 0.4, 0),
          })
          x += 60
        })
        y -= 18
        // Filas de la tabla
        mealPlanData.meals.forEach((meal: any) => {
          x = margin
          const row = [
            meal.day,
            meal.mealType,
            meal.recipe.name,
            meal.recipe.prepTime + 'm',
            meal.recipe.cookTime + 'm',
            meal.recipe.nutrition?.calories ?? '',
            meal.recipe.nutrition?.protein ?? '',
            meal.recipe.nutrition?.carbs ?? '',
            meal.recipe.nutrition?.fat ?? '',
          ]
          row.forEach((cell, i) => {
            page.drawText(String(cell), {
              x: x,
              y: y,
              size: 9,
              font: fontRegular,
              color: rgb(0.2, 0.2, 0.2),
            })
            x += 60
          })
          y -= 15
          if (y < margin + 40) {
            y = height - margin
            page = pdfDoc.addPage([595, 842])
          }
        })
        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `meal-plan-${id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
        toast({
          title: t("mealPlans.exportSuccess"),
          description: t("mealPlans.exportedAsPDF"),
        })
        setIsExporting(null)
        return
      }
      // ... resto de formatos (json, csv)
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
      toast({
        title: t("mealPlans.exportSuccess"),
        description: `Meal plan exported as ${formatType.toUpperCase()}.`,
      })
    } catch (err: any) {
      console.error("Error exporting meal plan:", err)
      toast({
        title: t("mealPlans.exportFailed"),
        description: err.message || t("mealPlans.exportFailedDesc"),
        variant: "destructive",
      })
    } finally {
      setIsExporting(null)
    }
  }

  // Handler para regenerar una comida
  const handleRegenerar = async (mealType: keyof typeof distribution) => {
    setCustomError(null);
    if (!user || !user.id || !customMealPlan) return;
    try {
      const recetasUsadas = Object.entries(customMealPlan.comidas)
        .filter(([k]) => k !== mealType)
        .map(([, r]: any) => r?.id)
        .filter(Boolean);
      const res = await fetch("/api/mealplan/regenerate", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          mealType,
          caloriasObjetivo: customMealPlan.distribucion[mealType],
          recetasUsadas,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) setCustomError(data.error);
      else setCustomMealPlan((prev: any) => ({
        ...prev,
        comidas: { ...prev.comidas, [mealType]: data },
      }));
    } catch (e: any) {
      setCustomError("No hay recetas suficientes para este tipo de comida.");
    }
  };

  if (!user && !loading) {
    // Avoid showing login prompt while initial auth check might be loading
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
    // Show full page loader only on initial load
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

  // Calcular cantidad de planes en tiempo real usando el estado local
  const localMealPlanCount = mealPlans.length

  return (
    <div className="container mx-auto px-4 py-8 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("mealPlans.myMealPlans")}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t("mealPlans.planYourMeals")}</p>
        </div>
        {isPremium || localMealPlanCount === 0 ? (
          <Button
            onClick={handleGenerateMealPlan}
            disabled={isGenerating || loading}
            className="bg-orange-600 hover:bg-orange-700 min-w-[180px]"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            {isGenerating ? t("mealPlans.generating") : t("mealPlans.generate")}
          </Button>
        ) : null}
      </motion.div>

      <AnimatePresence>
        {mealPlans.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t("mealPlans.noMealPlansYet")}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t("mealPlans.clickToGenerate")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {mealPlans.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {mealPlans.map((mealPlan, index) => (
              <motion.div
                key={mealPlan.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ y: -5 }}
                className="flex" // Ensure cards in a row take full height
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 flex flex-col w-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg line-clamp-2">{mealPlan.name}</CardTitle>
                        <CardDescription className="mt-1 text-xs">
                          {format(new Date(mealPlan.start_date), "MMM d, yyyy")} -{" "}
                          {format(new Date(mealPlan.end_date), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(mealPlan.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 w-8 h-8"
                        aria-label="Delete meal plan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-grow flex flex-col">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-orange-600" />
                        {Math.round(
                          (new Date(mealPlan.end_date).getTime() - new Date(mealPlan.start_date).getTime()) /
                            (1000 * 60 * 60 * 24),
                        ) + 1}{" "}
                        days
                      </div>
                      <div className="flex items-center">
                        {(mealPlan as any).meals?.length > 0 && (
                          <>
                            <Users className="h-4 w-4 mr-1 text-orange-600" />
                            {(mealPlan as any).meals.length} meals
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-medium text-xs text-gray-500 dark:text-gray-400">Meal Types:</h4>
                      <div className="flex flex-wrap gap-1">
                        {/* This is a simplified view. Actual meal types would come from mealPlan.meals */}
                        <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                          Breakfast
                        </Badge>
                        <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                          Lunch
                        </Badge>
                        <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                          Dinner
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-auto space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <FeatureGate feature="export_meal_plans">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportMealPlan(mealPlan.id, "pdf")}
                          disabled={isExporting === mealPlan.id}
                          className="w-full text-xs"
                        >
                          {isExporting === mealPlan.id ? (
                            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3 mr-1.5" />
                          )}
                          Export PDF
                        </Button>
                      </FeatureGate>
                      <Link href={`/meal-plans/${mealPlan.id}`} legacyBehavior>
                        <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-sm py-2">
                          <a>View Details</a>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

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

      {/* UI para distribución personalizada */}
      <div className="mb-8 mt-16 p-4 bg-orange-50 rounded border border-orange-200 max-w-xl mx-auto">
        <h2 className="font-bold mb-2">Distribución de calorías (%)</h2>
        {(Object.keys(distribution) as Array<keyof typeof distribution>).map((meal) => (
          <div key={meal} className="flex items-center gap-2 mb-2">
            <label className="w-24 capitalize">{meal}</label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={distribution[meal]}
              onChange={e => {
                const value = parseFloat(e.target.value);
                setDistribution(d => ({ ...d, [meal]: isNaN(value) ? 0 : value }));
              }}
              className="w-20 border rounded px-2 py-1"
            />
          </div>
        ))}
        <div>Total: {Math.round(total * 100)}%</div>
        <Button
          disabled={Math.abs(total - 1) > 0.01 || !user}
          onClick={handleGenerateCustomMealPlan}
          className="mt-2"
        >
          Generar Meal Plan Personalizado
        </Button>
        {customError && (
          <div className="text-red-600 mt-4 text-center font-semibold">
            {customError}
            <div className="text-sm text-gray-500 mt-1">
              ¿No encuentras recetas? Prueba ampliando tus filtros o agregando más recetas a la base de datos.
            </div>
          </div>
        )}
      </div>

      {/* Mostrar el meal plan personalizado generado */}
      {customMealPlan && (
        <div className="max-w-2xl mx-auto bg-white rounded shadow p-6 mb-8 border border-gray-200 mt-10">
          <h2 className="font-bold text-xl mb-4">Tu Meal Plan Personalizado</h2>
          {Object.entries(customMealPlan.comidas).map(([mealType, recipe]) => {
            const receta = recipe as { name?: string };
            return (
              <div key={mealType} className="mb-6">
                <h3 className="font-bold text-lg capitalize">{mealType}</h3>
                <p>Calorías objetivo: {customMealPlan.distribucion[mealType]}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span>{receta?.name || <span className="text-gray-400">Sin receta disponible</span>}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRegenerar(mealType as keyof typeof distribution)}
                  >
                    Regenerar
                  </Button>
                </div>
              </div>
            );
          })}
          {customError && (
            <div className="text-red-600 mt-4 text-center font-semibold">
              {customError}
              <div className="text-sm text-gray-500 mt-1">
                ¿No encuentras recetas? Prueba ampliando tus filtros o agregando más recetas a la base de datos.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
