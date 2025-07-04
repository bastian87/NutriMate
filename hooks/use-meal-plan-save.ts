import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MEALS = ["breakfast", "lunch", "dinner", "snack"];

export function useMealPlanSave() {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const saveMealPlan = async (
    distribution: Record<string, number>,
    selectedRecipes: Record<string, { id: string; name: string }>
  ) => {
    // Validar que el usuario esté logueado
    if (!user) {
      setSaveError("Debes iniciar sesión para guardar el meal plan.");
      return;
    }

    // Calcular internamente si el meal plan está completo
    const allSelected = DAYS.every((day) =>
      MEALS.every((meal) => selectedRecipes[`${day}-${meal}`])
    );

    // Validar que todas las recetas estén seleccionadas
    if (!allSelected) {
      setSaveError("Debes seleccionar una receta para cada comida de cada día antes de guardar.");
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
      
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar");
      }

      // Redireccionar al detalle del meal plan guardado
      router.push(`/meal-plans/${data.id}`);
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return {
    saveMealPlan,
    saving,
    saveError,
  };
} 