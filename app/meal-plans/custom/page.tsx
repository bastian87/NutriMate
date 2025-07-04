"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useMealPlanRecipeSelection } from "@/hooks/use-meal-plan-recipe-selection";
import { useMealPlanSave } from "@/hooks/use-meal-plan-save";
import { useRecipes } from "@/hooks/use-recipes";
import { Loader2, BarChart2, ArrowUp, Search } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";

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

  // Estado para controlar la visibilidad del botón "Volver Arriba"
  const [showScrollTop, setShowScrollTop] = useState(false);
  // Estado para el filtro de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // Aplicar filtro de búsqueda
  const searchFilteredRecipes = searchTerm.trim() === "" 
    ? filteredRecipes 
    : filteredRecipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Recetas a mostrar localmente
  const visibleRecipes = searchFilteredRecipes.slice(0, visibleCount);

  // Función para encontrar la siguiente celda vacía en el día actual
  function findNextEmptyCellInDay(day: string, fromMealIdx: number) {
    for (let i = fromMealIdx + 1; i < MEALS.length; i++) {
      const key = `${day}-${MEALS[i]}`;
      if (!selectedRecipes[key]) {
        return { day, meal: MEALS[i] };
      }
    }
    return null;
  }

  // Función para encontrar el siguiente día incompleto y su primera celda vacía
  function findNextIncompleteDayAndCell(currentDayIdx: number) {
    for (let d = currentDayIdx + 1; d < DAYS.length; d++) {
      for (let m = 0; m < MEALS.length; m++) {
        const key = `${DAYS[d]}-${MEALS[m]}`;
        if (!selectedRecipes[key]) {
          return { day: DAYS[d], meal: MEALS[m], dayIdx: d };
        }
      }
    }
    return null;
  }

  // Asignar receta a la celda seleccionada y navegar automáticamente
  const handleAssignRecipe = (recipe: any) => {
    if (!selectedCell) return;
    const key = `${selectedCell.day}-${selectedCell.meal}`;
    selectedRecipes[key] = { id: recipe.id, name: recipe.name };

    // Navegación automática
    const currentDayIdx = DAYS.indexOf(selectedCell.day);
    const currentMealIdx = MEALS.indexOf(selectedCell.meal);
    // Buscar siguiente celda vacía en el mismo día
    const nextCell = findNextEmptyCellInDay(selectedCell.day, currentMealIdx);
    if (nextCell) {
      setSelectedCell(nextCell);
      return;
    }
    // Si no hay más celdas vacías en el día, buscar siguiente día incompleto
    const nextDayCell = findNextIncompleteDayAndCell(currentDayIdx);
    if (nextDayCell) {
      goToDay(nextDayCell.dayIdx);
      setTimeout(() => setSelectedCell({ day: nextDayCell.day, meal: nextDayCell.meal }), 350); // Espera animación
      return;
    }
    // Si no hay más días ni celdas vacías, deselecciona
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

  // Calcular resumen nutricional dinámico
  const resumenNutricional = (() => {
    let calorias = 0, proteinas = 0, carbohidratos = 0, grasas = 0, fibra = 0, sodio = 0;
    Object.values(selectedRecipes).forEach((sel) => {
      const receta = recipes.find((r) => r.id === sel.id);
      if (receta) {
        calorias += receta.calories || 0;
        proteinas += receta.protein || 0;
        carbohidratos += receta.carbs || 0;
        grasas += receta.fat || 0;
        fibra += receta.fiber || 0;
        sodio += receta.sodium || 0;
      }
    });
    return { calorias, proteinas, carbohidratos, grasas, fibra, sodio };
  })();

  // Función para hacer scroll suave hacia arriba
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Efecto para detectar scroll y mostrar/ocultar el botón
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setShowScrollTop(scrollTop > 300); // Mostrar después de 300px de scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Estado para el carrusel de días
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(slider) {
      setSelectedCell(null); // Opcional: deseleccionar celda al cambiar de día
    },
    mode: "snap",
    loop: false,
    slides: { perView: 1 },
  });
  const [currentDayIdx, setCurrentDayIdx] = useState(0);

  // Navegación del carrusel
  const goToDay = (idx: number) => {
    instanceRef.current?.moveToIdx(idx);
    setCurrentDayIdx(idx);
  };

  return (
    <div className="container mx-auto px-4 py-8 font-sans flex flex-col min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Meal Plan Personalizado</h1>
      {/* Carrusel de días del Meal Plan */}
      <div className="w-full max-w-3xl mx-auto mb-4 bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <button
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-40"
            onClick={() => goToDay(Math.max(0, currentDayIdx - 1))}
            disabled={currentDayIdx === 0}
            aria-label="Día anterior"
          >
            <ArrowUp className="rotate-[-90deg] w-5 h-5" />
          </button>
          <span className="font-bold text-lg text-center flex-1">
            {DAYS[currentDayIdx]}
          </span>
          <button
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-40"
            onClick={() => goToDay(Math.min(DAYS.length - 1, currentDayIdx + 1))}
            disabled={currentDayIdx === DAYS.length - 1}
            aria-label="Día siguiente"
          >
            <ArrowUp className="rotate-90 w-5 h-5" />
          </button>
        </div>
        <div ref={sliderRef} className="keen-slider">
          {DAYS.map((day, idx) => (
            <div key={day} className="keen-slider__slide flex flex-col items-center justify-center min-h-[180px]">
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MEALS.map((meal) => {
                  const key = `${day}-${meal}`;
                  const isSelected = selectedCell?.day === day && selectedCell?.meal === meal;
                  const assignedRecipe = selectedRecipes[key];
                  const recipeData = assignedRecipe ? recipes.find(r => r.id === assignedRecipe.id) : null;
                  return (
                    <div
                      key={meal}
                      className={`transition cursor-pointer flex justify-center items-center ${isSelected ? "ring-2 ring-orange-500 bg-orange-50" : "hover:bg-orange-50"}`}
                      onClick={() => setSelectedCell({ day, meal })}
                    >
                      {assignedRecipe && recipeData ? (
                        <Card className="cursor-pointer hover:shadow-lg transition border border-gray-200 flex flex-col items-center p-2 w-full max-w-[120px]">
                          <img
                            src={recipeData.image_url || "/placeholder.svg"}
                            alt={recipeData.name}
                            className="w-16 h-16 object-cover rounded mb-1"
                          />
                          <div className="font-semibold text-center text-xs line-clamp-2 leading-tight">{recipeData.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{recipeData.calories} cal</div>
                        </Card>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-24 w-full max-w-[120px] bg-gray-100 border border-gray-200 rounded-lg text-gray-400">
                          <span className="text-xs">Sin receta</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones de Resumen Nutricional y Guardar Meal Plan */}
      <div className="flex flex-col sm:flex-row items-center justify-between max-w-2xl mx-auto mt-6 mb-6 gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5" />
              <span className="hidden sm:inline">Resumen Nutricional</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-80 p-4 rounded-xl shadow-lg">
            <h3 className="font-bold text-base mb-2 text-center">Resumen Nutricional</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <span className="font-medium">Calorías totales:</span>
              <span className="text-right">{resumenNutricional.calorias.toLocaleString()} kcal</span>
              <span className="font-medium">Proteínas:</span>
              <span className="text-right">{resumenNutricional.proteinas.toLocaleString()} g</span>
              <span className="font-medium">Carbohidratos:</span>
              <span className="text-right">{resumenNutricional.carbohidratos.toLocaleString()} g</span>
              <span className="font-medium">Grasas:</span>
              <span className="text-right">{resumenNutricional.grasas.toLocaleString()} g</span>
              <span className="font-medium">Fibra:</span>
              <span className="text-right">{resumenNutricional.fibra.toLocaleString()} g</span>
              <span className="font-medium">Sodio:</span>
              <span className="text-right">{resumenNutricional.sodio.toLocaleString()} mg</span>
            </div>
            <div className="text-xs text-gray-500 mt-3 text-center">Actualizado automáticamente según tus selecciones.</div>
          </DialogContent>
        </Dialog>
        <div className="w-full sm:w-auto">
          <Button
            className="w-full sm:w-auto"
            disabled={!allSelected || !user || saving}
            onClick={handleSave}
          >
            {saving ? "Guardando..." : "Guardar Meal Plan Personalizado"}
          </Button>
        </div>
      </div>
      {/* Mensajes de validación debajo del botón guardar */}
      <div className="max-w-2xl mx-auto">
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

      {/* Grilla de recetas sugeridas */}
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2 text-center">Recetas sugeridas</h2>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar recetas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recipesLoading ? (
            <div className="col-span-full text-center text-gray-500">Cargando recetas...</div>
          ) : visibleRecipes.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              {searchTerm.trim() !== "" ? "No se encontraron recetas con ese nombre" : "No se encontraron recetas"}
            </div>
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
          {visibleCount < searchFilteredRecipes.length && !recipesLoading && (
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

      {/* Botón flotante "Volver Arriba" */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="sm"
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-orange-500 hover:bg-orange-600 text-white"
          aria-label="Volver arriba"
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
} 