import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Filtra recetas por tipo de comida (desayuno, snack, etc)
 * @param recetas Array de recetas
 * @param tipo Tipo de comida ("breakfast", "lunch", "dinner", "snack", etc)
 */
export function filtrarPorTipo(recetas: any[], tipo: string) {
  return recetas.filter(r => r.meal_type === tipo);
}

/**
 * Agrupa recetas por tipo de comida
 * @param recetas Array de recetas
 * @returns Objeto con arrays agrupados por tipo
 */
export function agruparPorTipo(recetas: any[]) {
  return recetas.reduce((acc, receta) => {
    const tipo = receta.meal_type || 'otro';
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(receta);
    return acc;
  }, {} as Record<string, any[]>);
}

export function calcularCaloriasDiarias({
  gender,
  age,
  weight,
  height,
  activityLevel,
  goal,
}: {
  gender: "male" | "female";
  age: number;
  weight: number;
  height: number;
  activityLevel: string;
  goal: string;
}): number {
  let tmb =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  const activityFactors: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  tmb *= activityFactors[activityLevel] || 1.2;
  if (goal === "weight_loss") tmb *= 0.8;
  if (goal === "muscle_gain") tmb *= 1.1;
  return Math.round(tmb);
}

export function distribuirCalorias(total: number, snacks: boolean) {
  if (snacks) {
    return {
      breakfast: Math.round(total * 0.25),
      lunch: Math.round(total * 0.35),
      dinner: Math.round(total * 0.35),
      snack: Math.round(total * 0.05),
    };
  }
  return {
    breakfast: Math.round(total * 0.3),
    lunch: Math.round(total * 0.4),
    dinner: Math.round(total * 0.3),
  };
}
