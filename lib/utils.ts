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
