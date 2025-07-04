import { useState } from "react";
import { useRecipes } from "@/hooks/use-recipes";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MEALS = ["breakfast", "lunch", "dinner", "snack"];

export function useMealPlanRecipeSelection() {
  const [selectedRecipes, setSelectedRecipes] = useState<Record<string, { id: string; name: string }>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDay, setModalDay] = useState<string | null>(null);
  const [modalMeal, setModalMeal] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(20);
  const { recipes, loading } = useRecipes(search ? { search } : {}, limit);
  const [selectedRecipeInModal, setSelectedRecipeInModal] = useState<any>(null);

  const openModalForMeal = (day: string, meal: string) => {
    setModalDay(day);
    setModalMeal(meal);
    setModalOpen(true);
    setSearch("");
    setSelectedRecipeInModal(null);
  };

  const confirmSelectedRecipe = () => {
    if (modalDay && modalMeal && selectedRecipeInModal) {
      setSelectedRecipes((prev) => ({
        ...prev,
        [`${modalDay}-${modalMeal}`]: {
          id: selectedRecipeInModal.id,
          name: selectedRecipeInModal.name,
        },
      }));
      setModalOpen(false);
    }
  };

  const allSelected = DAYS.every((day) =>
    MEALS.every((meal) => selectedRecipes[`${day}-${meal}`])
  );

  const modalProps = {
    open: modalOpen,
    onOpenChange: setModalOpen,
    recipes,
    loading,
    search,
    setSearch,
    limit,
    setLimit,
    selectedRecipeInModal,
    setSelectedRecipeInModal,
  };

  return {
    selectedRecipes,
    allSelected,
    openModalForMeal,
    confirmSelectedRecipe,
    modalProps,
    DAYS,
    MEALS,
  };
}
