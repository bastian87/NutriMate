# NutriMate blueprint

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/zebas-87-1588s-projects/v0-nutri-mate-blueprint)

## Overview

Any changes you make to your deployed app will be automatically pushed to this repository

## Deployment

Your project is live at:

**(https://vercel.com/zebas-87-1588s-projects/v0-nutri-mate-blueprint)**

## Importar Recetas Reales desde Spoonacular

NutriMate permite importar recetas reales desde la API de Spoonacular para poblar tu base de datos con variedad y calidad. Puedes hacerlo manualmente desde tu navegador, Postman o mediante un script.

---

### 1. Requisitos
- Tener el servidor Next.js corriendo (local o en producción).
- Haber configurado la variable de entorno `SPOONACULAR_API_KEY`.
- Acceso al endpoint:
  ```
  /api/recipes/import
  ```

---

### 2. Importar recetas de cualquier tipo (variedad total)

- **10 recetas aleatorias de cualquier tipo:**
  ```
  http://localhost:3000/api/recipes/import?number=10&sort=random
  ```

- **20 recetas aleatorias:**
  ```
  http://localhost:3000/api/recipes/import?number=20&sort=random
  ```

---

### 3. Importar recetas por tipo específico

Puedes importar recetas de un tipo específico usando el parámetro `type`:

- **Desayunos:**
  ```
  /api/recipes/import?type=breakfast&number=10&sort=random
  ```
- **Platos principales:**
  ```
  /api/recipes/import?type=main course&number=10&sort=random
  ```
- **Snacks:**
  ```
  /api/recipes/import?type=snack&number=10&sort=random
  ```
- **Postres:**
  ```
  /api/recipes/import?type=dessert&number=10&sort=random
  ```
- **Sopas:**
  ```
  /api/recipes/import?type=soup&number=10&sort=random
  ```

---

### 4. Importar recetas con paginación (más variedad)

Puedes usar el parámetro `offset` para traer recetas diferentes:

- **Ejemplo:**
  ```
  /api/recipes/import?type=main course&number=10&offset=10&sort=random
  /api/recipes/import?type=main course&number=10&offset=20&sort=random
  ```

---

### 5. Importar recetas de todos los tipos en un solo día

Haz varias requests cambiando el tipo para poblar tu base con variedad:

```bash
# Desayunos
http://localhost:3000/api/recipes/import?type=breakfast&number=4&sort=random

# Platos principales
http://localhost:3000/api/recipes/import?type=main course&number=4&sort=random

# Snacks
http://localhost:3000/api/recipes/import?type=snack&number=4&sort=random

# Postres
http://localhost:3000/api/recipes/import?type=dessert&number=4&sort=random

# Sopas
http://localhost:3000/api/recipes/import?type=soup&number=4&sort=random
```

Así tendrás 20 recetas diarias, bien variadas.

---

### 6. Tipos de receta soportados por Spoonacular

Puedes usar en el parámetro `type` cualquiera de estos valores:
- `main course`
- `side dish`
- `dessert`
- `appetizer`
- `salad`
- `bread`
- `breakfast`
- `soup`
- `beverage`
- `sauce`
- `marinade`
- `fingerfood`
- `snack`
- `drink`

---

### 7. ¿Cómo saber si la importación fue exitosa?

La respuesta será un JSON como este:
```json
{
  "inserted": 10,
  "skipped": 0,
  "errors": []
}
```
- Si hay errores, revisa el campo `errors` para ver qué recetas no se pudieron importar y por qué.

---

### 8. ¿Dónde ver las recetas importadas?

- En tu panel de Supabase, tabla `recipes` y `recipe_ingredients`.
- En tu app NutriMate, usando el buscador y los filtros.

---

### 9. Consejos para poblar tu base con variedad

- Cambia el tipo y el offset cada día.
- Usa `sort=random` para evitar repeticiones.
- Haz varias requests con diferentes tipos para cubrir todos los gustos.

---

### 10. ¿Qué hacer si quieres aún más variedad?

- Aumenta el número de recetas por request (máximo recomendado: 20-30 para no saturar la API).
- Usa diferentes combinaciones de `type`, `number`, `offset` y `sort`.

---

¿Dudas? ¿Quieres automatizar el proceso? ¡Consulta la documentación o pide ayuda en el equipo!
