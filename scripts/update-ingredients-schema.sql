-- Actualizar la tabla recipe_ingredients para usar amount en lugar de quantity y unit
-- Primero agregar la nueva columna amount
ALTER TABLE public.recipe_ingredients 
ADD COLUMN IF NOT EXISTS amount text;

-- Migrar datos existentes: combinar quantity y unit en amount
UPDATE public.recipe_ingredients 
SET amount = CASE 
  WHEN unit IS NOT NULL AND unit != '' THEN quantity || ' ' || unit
  ELSE quantity
END
WHERE amount IS NULL;

-- Hacer amount NOT NULL después de migrar los datos
ALTER TABLE public.recipe_ingredients 
ALTER COLUMN amount SET NOT NULL;

-- Eliminar las columnas quantity y unit (opcional, comentado por seguridad)
-- ALTER TABLE public.recipe_ingredients DROP COLUMN IF EXISTS quantity;
-- ALTER TABLE public.recipe_ingredients DROP COLUMN IF EXISTS unit;

-- Crear índice para mejorar el rendimiento de búsquedas
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_amount 
ON public.recipe_ingredients USING btree (amount);

-- Comentarios para documentar el cambio
COMMENT ON COLUMN public.recipe_ingredients.amount IS 'Cantidad del ingrediente en formato libre (ej: "1 taza", "2 cucharadas", "500g")';
