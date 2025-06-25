"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import MealCard from "@/components/meal-card";
import { useRecipes } from "@/hooks/use-recipes";
import { useAuth } from "@/hooks/use-auth";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MEALS = ["breakfast", "lunch", "dinner", "snack"];

export default function CustomMealPlanPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [selectedRecipes, setSelectedRecipes] = useState<Record<string, string>>({}); // key: `${day}-${meal}`
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDay, setModalDay] = useState<string | null>(null);
  const [modalMeal, setModalMeal] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { recipes, loading } = useRecipes(search ? { search } : undefined);
  const [selectedRecipeInModal, setSelectedRecipeInModal] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

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

  // Handler para seleccionar receta (por ahora solo simulado)
  const handleSelectRecipe = (day: string, meal: string) => {
    setModalDay(day);
    setModalMeal(meal);
    setModalOpen(true);
    setSearch("");
    setSelectedRecipeInModal(null);
  };

  const handleConfirmRecipe = () => {
    if (modalDay && modalMeal && selectedRecipeInModal) {
      setSelectedRecipes((prev) => ({ ...prev, [`${modalDay}-${modalMeal}`]: selectedRecipeInModal.id }));
      setModalOpen(false);
    }
  };

  // Validar que todas las comidas tengan receta
  const allSelected = DAYS.every(day =>
    MEALS.every(meal => selectedRecipes[`${day}-${meal}`])
  );

  const handleSave = async () => {
    if (!user) {
      setSaveError("Debes iniciar sesión para guardar el meal plan.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/mealplan/save-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          distribution,
          selectedRecipes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      router.push(`/meal-plans/${data.id}`);
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
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
                      onClick={() => handleSelectRecipe(day, meal)}
                    >
                      {selectedRecipes[`${day}-${meal}`]
                        ? `Receta: ${selectedRecipes[`${day}-${meal}`]}`
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
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecciona una receta</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Buscar recetas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-4"
          />
          <div className="max-h-64 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center text-gray-500">Cargando...</div>
            ) : recipes.length === 0 ? (
              <div className="text-center text-gray-500">No se encontraron recetas</div>
            ) : (
              recipes.map((receta) => (
                <div
                  key={receta.id}
                  className={`border rounded p-2 cursor-pointer hover:bg-orange-50 ${selectedRecipeInModal?.id === receta.id ? "border-orange-500 bg-orange-100" : ""}`}
                  onClick={() => setSelectedRecipeInModal(receta)}
                >
                  <div className="font-semibold">{receta.name}</div>
                  <div className="text-xs text-gray-500">{receta.calories} cal | {receta.protein}g proteína</div>
                </div>
              ))
            )}
          </div>
          {selectedRecipeInModal && (
            <div className="mt-4">
              <MealCard
                title={modalMeal || ""}
                recipe={selectedRecipeInModal.name}
                calories={selectedRecipeInModal.calories}
                protein={selectedRecipeInModal.protein}
                carbs={selectedRecipeInModal.carbs}
                fat={selectedRecipeInModal.fat}
                prep_time_minutes={selectedRecipeInModal.prep_time_minutes}
                cook_time_minutes={selectedRecipeInModal.cook_time_minutes}
                image_url={selectedRecipeInModal.image_url}
              />
              <Button className="mt-4 w-full" onClick={handleConfirmRecipe}>
                Confirmar selección
              </Button>
            </div>
          )}
          <DialogClose asChild>
            <Button variant="outline" className="mt-2 w-full">Cancelar</Button>
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