"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useMealPlanRecipeSelection } from "@/hooks/use-meal-plan-recipe-selection";
import { useMealPlanSave } from "@/hooks/use-meal-plan-save";

export default function CustomMealPlanPage() {
  const searchParams = useSearchParams();
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const { user, loading: authLoading } = useAuth();

  const {
    selectedRecipes,
    allSelected,
    openModalForMeal,
    confirmSelectedRecipe,
    modalProps,
    DAYS,
    MEALS,
  } = useMealPlanRecipeSelection();

  const { saveMealPlan, saving, saveError } = useMealPlanSave();

  // Decodificar la distribución desde el query param
  useEffect(() => {
    const distStr = searchParams.get("distribution");
    if (distStr) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(distStr)));
        setDistribution(decoded);
      } catch (e) {
        setDistribution({});
      }
    }
  }, [searchParams]);
  

  // Guardar meal plan personalizado
  const handleSave = () => {
    saveMealPlan(distribution, selectedRecipes);
  };

  return (
    <div className="container mx-auto px-4 py-8 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center">Meal Plan Personalizado</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-center">
          <thead>
            <tr>
              <th className="border px-2 py-1">Día</th>
              {MEALS.map((meal) => (
                <th key={meal} className="border px-2 py-1 capitalize">{meal}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, dayIdx) => (
              <tr key={day}>
                <td className="border px-2 py-1 font-semibold">{day}</td>
                {MEALS.map((meal) => (
                  <td key={meal} className="border px-2 py-1">
                    <div className="mb-1 text-xs text-gray-500">
                      Calorías objetivo: {distribution[meal] || 0}
                    </div>
                    <Button
                      size="sm"
                      variant={selectedRecipes[`${day}-${meal}`] ? "default" : "outline"}
                      onClick={() => openModalForMeal(day, meal)}

                    >
                      {selectedRecipes[`${day}-${meal}`]
                        ? `${selectedRecipes[`${day}-${meal}`].name}`
                        : "Elegir receta"}
                    </Button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de selección de receta */}
      <Dialog open={modalProps.open} onOpenChange={modalProps.onOpenChange}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Selecciona una receta</DialogTitle>
    </DialogHeader>
    <Input
      placeholder="Buscar recetas..."
      value={modalProps.search}
      onChange={(e) => modalProps.setSearch(e.target.value)}
      className="mb-4"
    />
    <div className="max-h-64 overflow-y-auto space-y-2">
      {modalProps.loading ? (
        <div className="text-center text-gray-500">Cargando...</div>
      ) : modalProps.recipes.length === 0 ? (
        <div className="text-center text-gray-500">No se encontraron recetas</div>
      ) : (
        <>
          {modalProps.recipes.map((receta) => (
            <div
              key={receta.id}
              className={`border rounded p-2 cursor-pointer hover:bg-orange-50 ${
                modalProps.selectedRecipeInModal?.id === receta.id ? "border-orange-500 bg-orange-100" : ""
              }`}
              onClick={() => modalProps.setSelectedRecipeInModal(receta)}
            >
              <div className="font-semibold">{receta.name}</div>
              <div className="text-xs text-gray-500">
                {receta.calories} cal | {receta.protein}g proteína
              </div>
            </div>
          ))}
          {modalProps.recipes.length >= modalProps.limit && (
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => modalProps.setLimit((l) => l + 20)}
            >
              Ver más recetas
            </Button>
          )}
        </>
      )}
    </div>
    {modalProps.selectedRecipeInModal && (
      <div className="mt-4 flex flex-col items-center border rounded p-3 bg-gray-50">
        <img
          src={modalProps.selectedRecipeInModal.image_url || "/placeholder.svg"}
          alt={modalProps.selectedRecipeInModal.name}
          className="w-32 h-32 object-cover rounded mb-2"
        />
        <div className="font-semibold text-center">{modalProps.selectedRecipeInModal.name}</div>
        <div className="flex gap-3 text-xs text-gray-600 mt-1">
          <span>{modalProps.selectedRecipeInModal.calories} cal</span>
          <span>{modalProps.selectedRecipeInModal.protein}g proteína</span>
          <span>{modalProps.selectedRecipeInModal.carbs}g carbs</span>
          <span>{modalProps.selectedRecipeInModal.fat}g grasa</span>
        </div>
        <Button className="mt-4 w-full" onClick={confirmSelectedRecipe}>
          Confirmar selección
        </Button>
      </div>
    )}
    <DialogClose asChild>
      <Button variant="outline" className="mt-2 w-full">
        Cancelar
      </Button>
    </DialogClose>
  </DialogContent>
</Dialog>


      {/* Botón para guardar el meal plan */}
      <div className="max-w-2xl mx-auto mt-8">
        <Button
          className="w-full"
          disabled={!allSelected || !user || saving}
          onClick={handleSave}
        >
          {saving ? "Guardando..." : "Guardar Meal Plan Personalizado"}
        </Button>
        {!allSelected && (
          <div className="text-red-600 text-center mt-2 font-semibold">
            Debes seleccionar una receta para cada comida de cada día antes de guardar.
          </div>
        )}
        {!user && (
          <div className="text-red-600 text-center mt-2 font-semibold">
            Debes iniciar sesión para guardar tu meal plan.
          </div>
        )}
        {saveError && <div className="text-red-500 mt-2">{saveError}</div>}
      </div>
    </div>
  );
} 