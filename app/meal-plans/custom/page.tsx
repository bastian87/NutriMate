"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useMealPlanRecipeSelection } from "@/hooks/use-meal-plan-recipe-selection";
import { useMealPlanSave } from "@/hooks/use-meal-plan-save";
import { useRecipes } from "@/hooks/use-recipes";
import { Loader2 } from "lucide-react";

export default function CustomMealPlanPage() {
  const searchParams = useSearchParams();
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const { user, loading: authLoading } = useAuth();

  const {
    selectedRecipes,
    allSelected,
    DAYS,
    MEALS,
  } = useMealPlanRecipeSelection();

  const { saveMealPlan, saving, saveError } = useMealPlanSave();

  // Estado para la celda seleccionada
  const [selectedCell, setSelectedCell] = useState<{ day: string; meal: string } | null>(null);
  // Estado para la cantidad de recetas a mostrar
  const [recipesLimit, setRecipesLimit] = useState(24);
  const [loadingMore, setLoadingMore] = useState(false);

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

  // Recetas sugeridas: cargar todas al inicio
  const { recipes, loading: recipesLoading } = useRecipes();
  // Estado local para controlar cuántas recetas mostrar
  const [visibleCount, setVisibleCount] = useState(24);

  // Filtrado opcional para sugerencias según la celda seleccionada (solo para UX, no para la carga)
  const filteredRecipes = selectedCell && distribution[selectedCell.meal]
    ? recipes.filter(r => {
        // Filtrar por tipo de comida (tag) y rango calórico si hay celda seleccionada
        const cal = distribution[selectedCell.meal];
        const inCalRange = r.calories >= cal * 0.8 && r.calories <= cal * 1.2;
        const hasTag = r.tags?.some((tag: any) => tag.name === selectedCell.meal);
        return inCalRange && hasTag;
      })
    : recipes;

  // Recetas a mostrar localmente
  const visibleRecipes = filteredRecipes.slice(0, visibleCount);

  // Asignar receta a la celda seleccionada
  const handleAssignRecipe = (recipe: any) => {
    if (!selectedCell) return;
    const key = `${selectedCell.day}-${selectedCell.meal}`;
    selectedRecipes[key] = { id: recipe.id, name: recipe.name };
    setSelectedCell(null);
  };

  // Guardar meal plan personalizado
  const handleSave = () => {
    saveMealPlan(distribution, selectedRecipes);
  };

  // Manejo de loadingMore: cuando recipesLoading cambia a false, desactiva loadingMore
  useEffect(() => {
    if (!recipesLoading && loadingMore) {
      setLoadingMore(false);
    }
  }, [recipesLoading, loadingMore]);

  return (
    <div className="container mx-auto px-4 py-8 font-sans flex flex-col min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Meal Plan Personalizado</h1>
      <div className="flex-1 overflow-x-auto">
        <table className="min-w-full border text-center bg-white rounded-xl shadow">
          <thead>
            <tr>
              <th className="border px-2 py-1">Día</th>
              {MEALS.map((meal) => (
                <th key={meal} className="border px-2 py-1 capitalize">{meal}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day}>
                <td className="border px-2 py-1 font-semibold bg-gray-50">{day}</td>
                {MEALS.map((meal) => {
                  const key = `${day}-${meal}`;
                  const isSelected = selectedCell?.day === day && selectedCell?.meal === meal;
                  return (
                    <td
                      key={meal}
                      className={`border px-2 py-1 transition cursor-pointer ${isSelected ? "ring-2 ring-orange-500 bg-orange-50" : "hover:bg-orange-50"
                        }`}
                      onClick={() => setSelectedCell({ day, meal })}
                    >
                      {selectedRecipes[key] ? (
                        <div className="font-semibold text-orange-700 flex flex-col items-center">
                          <span>{selectedRecipes[key].name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin receta</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grilla de recetas sugeridas */}
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2 text-center">Recetas sugeridas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recipesLoading ? (
            <div className="col-span-full text-center text-gray-500">Cargando recetas...</div>
          ) : visibleRecipes.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No se encontraron recetas</div>
          ) : (
            visibleRecipes.map((receta) => (
              <Card
                key={receta.id}
                className="cursor-pointer hover:shadow-lg transition border border-gray-200 flex flex-col items-center p-3"
                onClick={() => handleAssignRecipe(receta)}
              >
                <img
                  src={receta.image_url || "/placeholder.svg"}
                  alt={receta.name}
                  className="w-20 h-20 object-cover rounded mb-2"
                />
                <div className="font-semibold text-center text-sm line-clamp-2">{receta.name}</div>
                <div className="text-xs text-gray-500 mt-1">{receta.calories} cal</div>
              </Card>
            ))
          )}
        </div>
        {/* Botones Ver más / Ver menos recetas */}
        <div className="flex justify-center mt-4 gap-4">
          {visibleCount < filteredRecipes.length && !recipesLoading && (
            <Button
              variant="outline"
              onClick={() => setVisibleCount((prev) => prev + 24)}
              className="px-6"
            >
              Ver más recetas
            </Button>
          )}
          {visibleCount > 24 && !recipesLoading && (
            <Button
              variant="ghost"
              onClick={() => setVisibleCount(24)}
              className="px-6"
            >
              Ver menos
            </Button>
          )}
        </div>

      </div>

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