import { useState, useCallback } from "react";
import { useRecipes } from "@/hooks/use-recipes";
import { useMealPlan } from "@/hooks/use-meal-plans";

export interface RecipeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipes: any[];
  loading: boolean;
  search: string;
  setSearch: (search: string) => void;
  limit: number;
  setLimit: (limit: number) => void;
  selectedRecipe: any | null;
  setSelectedRecipe: (recipe: any | null) => void;
}

export function useMealPlanRecipeSelector() {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMeal, setCurrentMeal] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(20);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);

  // Obtener el meal plan actual para calcular recetas usadas
  const { mealPlan } = useMealPlan(null);

  // Calcular recetas usadas en el mismo día
  const getUsedRecipesInDay = useCallback((dayNumber: number, excludeMealId?: string) => {
    if (!mealPlan) return [];
    return mealPlan.meals
      .filter((meal) => meal.day_number === dayNumber && meal.id !== excludeMealId)
      .map((meal) => meal.recipe.id)
      .filter(Boolean);
  }, [mealPlan]);

  // Crear filtros para las recetas
  const createFilters = useCallback((mealType: string, currentCalories: number) => {
    const filters: any = {
      meal_type: mealType,
      limit: limit,
    };

    // Agregar búsqueda si existe
    if (search.trim()) {
      filters.search = search.trim();
    }

    // Rango de calorías con tolerancia (±20% de las calorías actuales)
    const tolerance = currentCalories * 0.2;
    const minCalories = Math.max(0, currentCalories - tolerance);
    const maxCalories = currentCalories + tolerance;
    
    filters.calorieRange = [minCalories, maxCalories];

    return filters;
  }, [limit, search]);

  // Obtener recetas filtradas
  const filters = currentMeal 
    ? createFilters(currentMeal.meal_type, currentMeal.recipe.calories ?? 0)
    : undefined;
  
  const { recipes, loading } = useRecipes(filters, limit);

  // Filtrar recetas ya usadas en el mismo día
  const filteredRecipes = currentMeal 
    ? recipes.filter(recipe => {
        const usedRecipes = getUsedRecipesInDay(currentMeal.day_number, currentMeal.id);
        return !usedRecipes.includes(recipe.id);
      })
    : [];

  // Abrir modal para seleccionar receta
  const openRecipeSelector = (meal: any) => {
    setCurrentMeal(meal);
    setModalOpen(true);
    setSearch("");
    setSelectedRecipe(null);
    setLimit(20); // Resetear el límite al abrir el modal
  };

  // Confirmar selección de receta
  const confirmRecipeSelection = useCallback(async (onRecipeChange: (mealId: string, recipeId: string) => Promise<void>) => {
    if (!currentMeal || !selectedRecipe) return;

    try {
      await onRecipeChange(currentMeal.id, selectedRecipe.id);
      setModalOpen(false);
      setCurrentMeal(null);
      setSelectedRecipe(null);
    } catch (error) {
      console.error("Error changing recipe:", error);
    }
  }, [currentMeal, selectedRecipe]);

  const modalProps: RecipeSelectorProps = {
    open: modalOpen,
    onOpenChange: setModalOpen,
    recipes: filteredRecipes,
    loading,
    search,
    setSearch,
    limit,
    setLimit,
    selectedRecipe,
    setSelectedRecipe,
  };

  return {
    openRecipeSelector,
    confirmRecipeSelection,
    modalProps,
    currentMeal,
  };
} 