# CHANGES.md

## Esquema SQL y Datos de Semilla para Nutrimate Gamificado

### Archivos Creados

#### Migraciones de Base de Datos (`/supabase/migrations/`)
- **001_goals.sql**: Tabla de objetivos nutricionales de usuarios
  - Campos: id, user_id, start_date, end_date, target_kcal_day/week/month, objective, created_at
  - Índices para optimización de consultas por usuario y fechas
  - Constraint CHECK para objective ('lose','maintain','gain','muscle')

- **002_ingredients.sql**: Tabla de ingredientes con datos nutricionales
  - Campos: id, name, locale, group, kcal_per_100g, created_at
  - Índices para búsqueda por nombre, grupo y locale
  - Constraint CHECK para group ('carb','protein','fat','vegfruit','treat')
  - Índice único compuesto (name, locale)

- **003_day_entries.sql**: Tabla de entradas diarias de nutrición
  - Campos: id, user_id, date, goal_id, total_kcal, has_carb/protein/fat/vegfruit, extras_count, is_success, created_at
  - Constraint UNIQUE (user_id, date) para evitar duplicados
  - Foreign key a goals con RESTRICT
  - Índices para consultas por usuario, fecha, objetivo y éxito

- **004_day_entry_items.sql**: Tabla de items individuales en entradas diarias
  - Campos: id, day_entry_id, ingredient_id, quantity_grams, kcal, group, created_at
  - Foreign keys con CASCADE y RESTRICT apropiados
  - Campo group denormalizado para validación rápida
  - Índices para consultas por entrada diaria, ingrediente y grupo

- **005_streaks.sql**: Tabla de rachas de éxito de usuarios
  - Campos: id, user_id, current, best, updated_at
  - Constraint UNIQUE en user_id
  - Índices para consultas por usuario y valores de racha

- **006_xp_ledger.sql**: Tabla de registro de puntos de experiencia
  - Campos: id, user_id, date, reason, amount, related_id, created_at
  - Constraint CHECK para reason ('day','week','month','streak')
  - Índices para consultas por usuario, fecha, razón y ID relacionado

- **007_weekly_summaries.sql**: Tabla de resúmenes semanales
  - Campos: id, user_id, week_start_date, goal_id, total_kcal, success_days_count, is_success
  - Constraint UNIQUE (user_id, week_start_date)
  - Foreign key a goals con RESTRICT
  - Índices para consultas por usuario, fecha de inicio y éxito

- **008_monthly_summaries.sql**: Tabla de resúmenes mensuales
  - Campos: id, user_id, month, goal_id, total_kcal, success_weeks_count, is_success
  - Constraint UNIQUE (user_id, month)
  - Foreign key a goals con RESTRICT
  - Índices para consultas por usuario, mes y éxito

#### Datos de Semilla (`/supabase/seeds/`)
- **ingredients_seed.sql**: Conjunto mínimo de ingredientes en inglés
  - 4 carbohidratos: rice, oats, potato, whole-wheat bread
  - 5 proteínas: chicken breast, egg, tuna, lentils, tofu
  - 4 grasas: olive oil, avocado, almonds, peanut butter
  - 5 vegetales/frutas: spinach, broccoli, tomato, apple, banana
  - 4 treats: ice cream, soda, donut, chocolate bar
  - Valores calóricos realistas por 100g

### Características Técnicas

- **Sintaxis PostgreSQL**: Todos los archivos usan sintaxis válida de PostgreSQL
- **Timestamps incrementales**: Migraciones numeradas secuencialmente
- **Índices optimizados**: Índices estratégicos para consultas frecuentes
- **Constraints apropiados**: CHECK, UNIQUE, FOREIGN KEY con acciones correctas
- **Denormalización controlada**: Campo group en day_entry_items para validación rápida
- **Integridad referencial**: Foreign keys con RESTRICT/CASCADE según corresponda

### Estructura de Directorios
```
supabase/
├── migrations/
│   ├── 001_goals.sql
│   ├── 002_ingredients.sql
│   ├── 003_day_entries.sql
│   ├── 004_day_entry_items.sql
│   ├── 005_streaks.sql
│   ├── 006_xp_ledger.sql
│   ├── 007_weekly_summaries.sql
│   └── 008_monthly_summaries.sql
└── seeds/
    └── ingredients_seed.sql
```

## Tipos TypeScript y Servicio de Validación

### Archivos Creados

#### Tipos Core (`/types/`)
- **nutri.ts**: Tipos TypeScript estrictos para el sistema gamificado
  - `MacroGroup`: Union type para grupos nutricionales ('carb','protein','fat','vegfruit','treat')
  - `Ingredient`: Interfaz para ingredientes con datos nutricionales
  - `DayEntryItem`: Interfaz para items individuales en entradas diarias
  - `DayEntry`: Interfaz para entradas diarias completas
  - `DayEvaluationResult`: Interfaz para resultados de evaluación

#### Servicio de Validación (`/lib/nutri/`)
- **validation.ts**: Servicio puro de validación nutricional
  - Función `evaluateDay(items, targetKcal)`: Evalúa entradas diarias contra objetivos
  - Lógica de validación:
    - Calcula total de calorías sumando items
    - Verifica presencia de grupos macro (carb, protein, fat, vegfruit)
    - Cuenta treats como extras
    - Determina éxito: todos los grupos + calorías ≤ objetivo + sin extras
  - Documentación JSDoc completa con tipos de parámetros

#### Pruebas Unitarias (`/__tests__/lib/nutri/`)
- **validation.test.ts**: Suite completa de pruebas para validación
  - Casos de éxito: todos los requisitos cumplidos, exactamente en objetivo
  - Casos de fallo por calorías: excede objetivo
  - Casos de fallo por grupos faltantes: carb, protein, fat, vegfruit
  - Casos de fallo por extras: treats presentes
  - Casos edge: array vacío, objetivo cero, calorías cero
  - Helper function para crear items mock
  - 15+ casos de prueba cubriendo todos los escenarios

### Características Técnicas

- **TypeScript estricto**: Sin `any` implícitos, tipos estrictos en todas las interfaces
- **Funciones puras**: Sin efectos secundarios, determinísticas
- **Documentación JSDoc**: Parámetros y tipos documentados
- **Cobertura completa**: Pruebas para todos los casos de éxito y fallo
- **Compatibilidad hacia atrás**: Tipos diseñados para integración con esquema SQL existente

## Endpoints API para Sistema Gamificado

### Archivos Creados

#### Validación con Zod (`/lib/validation/`)
- **zod.ts**: Esquemas de validación para endpoints API
  - `CreateOrUpdateGoalSchema`: Validación para creación/actualización de objetivos
  - `DayEntryItemInputSchema`: Validación para items de entrada diaria
  - `UpsertDayEntrySchema`: Validación para entrada diaria completa
  - Validaciones de formato de fecha, UUIDs, números positivos
  - Tipos TypeScript exportados para uso en endpoints

#### Endpoint de Objetivos (`/app/api/goals/`)
- **route.ts**: POST handler para gestión de objetivos nutricionales
  - Función `POST`: Crea o actualiza objetivo de usuario
  - Validación de entrada con Zod
  - Cálculo automático de objetivos semanales/mensuales si se omiten
  - Placeholder para autenticación de usuario
  - Manejo de errores con respuestas HTTP apropiadas
  - TODO: Integración con Supabase para persistencia

#### Endpoint de Entradas Diarias (`/app/api/day-entries/`)
- **route.ts**: POST handler para gestión de entradas diarias de nutrición
  - Función `POST`: Crea o actualiza entrada diaria con items
  - Validación de entrada con Zod
  - Fetch de ingredientes para cálculo de calorías
  - Cálculo de calorías: `round(kcal_per_100g * quantityGrams / 100)`
  - Construcción de DayEntryItem con grupo denormalizado
  - Llamada a `evaluateDay` para validación
  - Actualización de rachas (streaks):
    - Si hoy y ayer exitosos => current++, sino current=1
    - best = max(best, current)
  - Inserción de registros XP:
    - +50 XP por día exitoso
    - +25 XP bonus por racha >= 4
  - Transacción para escritura de day_entries + day_entry_items
  - Manejo de errores con respuestas HTTP apropiadas
  - TODO: Integración completa con Supabase

#### Tipos Actualizados (`/types/nutri.ts`)
- **Goal**: Interfaz para objetivos nutricionales
  - Campos: id, user_id, start_date, end_date, target_kcal_day/week/month, objective, created_at
  - Integración con esquema SQL existente

### Características Técnicas de Endpoints

- **Validación robusta**: Esquemas Zod con mensajes de error personalizados
- **Manejo de errores**: Respuestas HTTP apropiadas (400, 404, 500)
- **Funciones helper**: Separación de lógica de negocio
- **Placeholders de autenticación**: Preparado para integración con auth real
- **Transacciones**: Lógica preparada para operaciones atómicas
- **Gamificación**: Sistema de XP y rachas integrado
- **Denormalización**: Campo group en items para validación rápida
- **Documentación JSDoc**: Funciones documentadas con parámetros y tipos

## Interfaz de Calendario para Seguimiento Nutricional

### Archivos Creados

#### Endpoint de Calendario (`/app/api/calendar/`)
- **route.ts**: GET handler para datos de calendario
  - Función `GET`: Obtiene entradas diarias para rango de fechas
  - Parámetros de consulta: `range` (week/month) y `from` (YYYY-MM-DD)
  - Validación con Zod para parámetros de consulta
  - Generación de rango de fechas (7 días para semana, 30 para mes)
  - Fetch de entradas diarias con datos mock
  - Respuesta con días, calorías totales/objetivo, estado de éxito
  - TODO: Integración con Supabase para datos reales

#### Componente de Vista de Calendario (`/app/(app)/calendar/`)
- **CalendarView.tsx**: Componente cliente para visualización de calendario
  - Tabs para vista semanal y mensual
  - Navegación de fechas con botones anterior/siguiente
  - Celdas de día con:
    - Iconos de estado: ✓ verde (éxito), ✗ rojo (fallo), ○ gris (sin entrada)
    - Barra de progreso de calorías vs objetivo
    - Información de calorías totales/objetivo
  - Click en día para abrir DayDrawer (preparado para siguiente tarea)
  - Estados de carga con spinner
  - Formateo de fechas en español
  - Responsive design con grid adaptativo
  - Hooks para manejo de estado y efectos

- **page.tsx**: Página del calendario
  - Renderiza el componente CalendarView
  - Integración con App Router de Next.js

### Características Técnicas de la Interfaz

- **Componente cliente**: Usa 'use client' para interactividad
- **Estado reactivo**: useState para tabs, fechas y datos
- **Efectos**: useEffect para fetch de datos automático
- **Navegación**: Botones para cambiar semanas/meses
- **Visualización**: Barras de progreso y iconos de estado
- **Responsive**: Grid adaptativo para diferentes tamaños
- **Accesibilidad**: Botones con iconos y texto descriptivo
- **Internacionalización**: Fechas en formato español
- **Manejo de errores**: Try/catch para fetch de datos
- **Estados de carga**: Spinner durante fetch de datos

### Funcionalidades de la Interfaz

- **Vista semanal**: 7 días con navegación por semanas
- **Vista mensual**: 30 días con navegación por meses
- **Indicadores visuales**:
  - Verde: Día exitoso (todos los grupos + sin extras + calorías ≤ objetivo)
  - Rojo: Día fallido (falta grupo o extras o excede calorías)
  - Gris: Sin entrada registrada
- **Barras de progreso**: Visualización de calorías vs objetivo
- **Click interactivo**: Preparado para abrir DayDrawer
- **Navegación temporal**: Botones para cambiar períodos
- **Datos en tiempo real**: Fetch automático al cambiar vista/fecha

## Day Drawer y Plate Builder con Drag & Drop

### Archivos Creados

#### Dependencias Instaladas
- **@dnd-kit/core**: Biblioteca principal para drag & drop
- **@dnd-kit/sortable**: Funcionalidad de ordenamiento
- **@dnd-kit/utilities**: Utilidades para dnd-kit

#### Hook de Preferencias de Usuario (`/lib/hooks/`)
- **useUserPrefs.ts**: Hook para gestión de preferencias de usuario
  - Estado in-memory mock para persistencia temporal
  - Preferencias: hasSeenPlateCoachmark, theme, language, notifications
  - Funciones: updatePref, markPlateCoachmarkSeen, resetPrefs, savePrefs
  - TODO: Integración con localStorage/Supabase para persistencia real

#### Componentes de Plate Builder (`/components/plate-builder/`)

- **FirstTimeCoachmark.tsx**: Modal de bienvenida para nuevos usuarios
  - Modal con visualización de plato dividido en 4 secciones
  - Explicación de grupos nutricionales con colores
  - Criterios de éxito (todos los grupos + sin extras + calorías ≤ objetivo)
  - Integración con useUserPrefs para marcar como visto
  - Diseño responsive con shadcn/ui Dialog

- **PlateBuilder.tsx**: Constructor de platos principal con drag & drop
  - **Panel izquierdo**: Biblioteca de ingredientes con tabs por grupo
  - **Búsqueda type-ahead**: Input con filtrado en tiempo real
  - **4 slots de plato**: carb, protein, fat, vegfruit con límites
  - **Basket de extras**: Para treats separado del plato principal
  - **Drag & drop**: dnd-kit para arrastrar ingredientes a slots
  - **Click para agregar**: Alternativa al drag & drop
  - **Cálculo en tiempo real**: Total de calorías y evaluación de éxito
  - **Indicadores visuales**: Check/X para cada grupo nutricional
  - **Toast notifications**: Mensajes de éxito/fallo específicos
  - **Integración API**: POST /api/day-entries al guardar

- **DayDrawer.tsx**: Drawer contenedor para el plate builder
  - Drawer de pantalla completa (90vh) con shadcn/ui
  - Header con fecha formateada y colores por día de semana
  - Información de objetivo de calorías y XP
  - Integración con PlateBuilder y FirstTimeCoachmark
  - Manejo de cierre y guardado exitoso

### Características Técnicas

- **Drag & Drop**: dnd-kit con detección de colisiones y overlay
- **Type-ahead search**: Filtrado en tiempo real de ingredientes
- **Estado reactivo**: useState para slots, extras, búsqueda, tabs
- **Cálculos en tiempo real**: useMemo para evaluación y totales
- **Validación**: Integración con evaluateDay del servicio de validación
- **Toast system**: Mensajes contextuales basados en resultado
- **Responsive design**: Grid adaptativo y drawer de pantalla completa
- **Accesibilidad**: Tooltips, labels descriptivos, navegación por teclado

### Funcionalidades del Plate Builder

- **4 Grupos nutricionales**: Carbohidratos, Proteína, Grasas, Verduras & Frutas
- **Basket de extras**: Separado para treats (no cuenta para éxito)
- **Límites por slot**: Máximo de items por grupo (carb: 3, protein: 3, fat: 2, vegfruit: 4)
- **Drag & drop**: Arrastrar desde biblioteca a slots/basket
- **Click to add**: Click en ingrediente para agregar automáticamente
- **Búsqueda inteligente**: Filtrado por nombre y grupo activo
- **Cálculo automático**: Calorías totales y evaluación de éxito
- **Indicadores visuales**: Estado de cada grupo (✓/✗)
- **Guardado inteligente**: Toast contextual basado en resultado

### Sistema de Notificaciones

- **Éxito completo**: "¡Día completo! Cumpliste todos los 4 grupos y tu objetivo de calorías. +50 XP"
- **Exceso de calorías**: "Excediste tu objetivo de calorías para hoy."
- **Extras detectados**: "Agregaste un treat además de un plato completo. Hoy no cuenta."
- **Grupos faltantes**: "Necesitas al menos un ingrediente de cada grupo."
- **Plato vacío**: "Agrega al menos un ingrediente antes de guardar."

### Integración con Sistema Existente

- **API endpoints**: Usa POST /api/day-entries existente
- **Validación**: Integra con evaluateDay del servicio de validación
- **Tipos**: Usa interfaces DayEntryItem, Ingredient, MacroGroup existentes
- **Toast system**: Usa useToast hook existente
- **shadcn/ui**: Componentes UI consistentes con el resto de la app

## Endpoints de Resumen y Tarjetas de UI

### Archivos Creados

#### Endpoints de Resumen (`/app/api/summary/`)

- **weekly/route.ts**: Endpoint GET para resumen semanal
  - **Input**: weekStart (YYYY-MM-DD), goalId
  - **Cálculo**: total_kcal, success_days_count, is_success
  - **Lógica de éxito**: (success_days_count == days_with_data) AND (total_kcal <= target_kcal_week)
  - **XP automático**: +200 XP si es exitoso y no se ha otorgado antes
  - **Validación**: Zod schemas para parámetros de entrada
  - **Mock data**: Datos de prueba para desarrollo

## Centralización de Strings de Internacionalización (i18n)

### Archivos Creados

#### Archivo de Constantes de Internacionalización (`/lib/i18n/`)

- **en.ts**: Constantes centralizadas para todos los textos en inglés
  - **PLATE_BUILDER**: Toasts y labels del constructor de platos
  - **CALENDAR**: Labels del calendario
  - **SUMMARY**: Toasts y labels de resúmenes semanales/mensuales
  - **GAMIFICATION**: Labels y mensajes de gamificación
  - **COMMON**: Mensajes comunes (errores, loading, acciones)
  - **formatMessage**: Función helper para interpolación de variables
  - **TypeScript**: Constantes tipadas con `as const` para type safety

### Archivos Actualizados

#### Componentes Actualizados para usar i18n

- **PlateBuilder.tsx**: 
  - **Toasts**: Todos los mensajes de toast ahora usan constantes
  - **Labels**: Biblioteca de ingredientes, constructor de platos, grupos nutricionales
  - **Placeholders**: Texto de búsqueda y botones
  - **Tooltips**: Mensajes de estado (incluido/faltante)

- **WeeklySummaryCard.tsx**:
  - **Toasts**: Mensajes de semana perfecta con interpolación
  - **Labels**: Títulos, criterios de éxito, estados de carga
  - **Fechas**: Formato de fechas en inglés
  - **Mensajes de error**: Textos estandarizados

- **MonthlySummaryCard.tsx**:
  - **Toasts**: Mensajes de mes legendario con interpolación
  - **Labels**: Títulos, criterios de éxito, desglose semanal
  - **Fechas**: Formato de fechas en inglés
  - **Mensajes de error**: Textos estandarizados

- **StreakWidget.tsx**:
  - **Labels**: Racha actual, mejor racha, progreso
  - **Mensajes motivacionales**: Según nivel de racha
  - **Estados de carga**: Loading y retry
  - **Mensajes de error**: Textos estandarizados

- **XpPanel.tsx**:
  - **Labels**: Nivel, progreso, actividad reciente
  - **Tipos de actividad**: Iconos y colores por tipo de logro
  - **Formato de fechas**: Relativo (ayer, hace X días)
  - **Estados de carga**: Loading y retry

### Características Técnicas

#### Organización de Constantes
- **Estructura jerárquica**: Agrupadas por funcionalidad
- **TypeScript**: Constantes tipadas con `as const`
- **Interpolación**: Función `formatMessage` para variables
- **Consistencia**: Nomenclatura uniforme en inglés

#### Categorías de Textos
- **TOASTS**: Mensajes de notificaciones
- **LABELS**: Etiquetas de UI
- **ERRORS**: Mensajes de error
- **LOADING**: Estados de carga
- **ACTIONS**: Acciones de usuario

#### Funcionalidades de Interpolación
- **formatMessage**: Reemplaza `{variable}` con valores
- **Type safety**: Parámetros tipados
- **Flexibilidad**: Soporte para strings y números

### Beneficios de la Centralización

#### Mantenimiento
- **Un solo lugar**: Todos los textos en un archivo
- **Consistencia**: Nomenclatura uniforme
- **Fácil actualización**: Cambios centralizados
- **Type safety**: Prevención de errores tipográficos

#### Escalabilidad
- **Preparado para i18n**: Estructura lista para múltiples idiomas
- **Reutilización**: Constantes compartidas entre componentes
- **Extensibilidad**: Fácil agregar nuevos idiomas

#### Desarrollo
- **IntelliSense**: Autocompletado de constantes
- **Refactoring**: Cambios seguros con TypeScript
- **Testing**: Fácil mockear textos para tests

### Estructura de Constantes

#### PLATE_BUILDER
```typescript
TOASTS: {
  EMPTY_PLATE: { title, description }
  DAY_COMPLETE: { title, description }
  CALORIE_EXCESS: { title, description }
  EXTRAS_DETECTED: { title, description }
  MISSING_GROUPS: { title, description }
  SAVE_ERROR: { title, description }
}
LABELS: {
  INGREDIENT_LIBRARY, SEARCH_PLACEHOLDER, PLATE_BUILDER,
  DAILY_GOAL, CARBOHYDRATES, PROTEIN, FAT, VEGETABLES_FRUITS,
  EXTRAS_TREATS, SAVE_DAY, SAVING, INCLUDED, MISSING
}
```

#### SUMMARY
```typescript
TOASTS: {
  PERFECT_WEEK: { title, description: "You've earned {amount} XP..." }
  LEGENDARY_MONTH: { title, description: "You've earned {amount} XP..." }
}
LABELS: {
  WEEKLY_SUMMARY, MONTHLY_SUMMARY, PERFECT_WEEK, INCOMPLETE_WEEK,
  LEGENDARY_MONTH, INCOMPLETE_MONTH, CALORIES, SUCCESSFUL_DAYS,
  SUCCESSFUL_WEEKS, SUCCESS_CRITERIA, WEEKLY_BREAKDOWN,
  ALL_DAYS_SUCCESSFUL, CALORIES_WITHIN_WEEKLY_GOAL,
  ALL_WEEKS_SUCCESSFUL, CALORIES_WITHIN_MONTHLY_GOAL,
  WEEK_1, LOADING_SUMMARY, RETRY
}
```

#### GAMIFICATION
```typescript
LABELS: {
  CURRENT_STREAK, BEST_STREAK, DAYS, TOTAL_XP, LEVEL,
  PROGRESS_TO_LEVEL, RECENT_ACTIVITY, LOADING, RETRY
}
STREAK: {
  START_STREAK, GOOD_START, KEEP_GOING, EXCELLENT_STREAK,
  LEGENDARY_STREAK, MAINTAIN_STREAK, PROGRESS, LEGENDARY,
  TOWARDS_7_DAYS, TOWARDS_4_DAYS, TOWARDS_2_DAYS
}
XP_ACTIVITY: {
  SUCCESSFUL_DAY: { icon: "📅", label: "Successful Day", color: "text-green-600" }
  STREAK: { icon: "🔥", label: "Streak", color: "text-orange-600" }
  PERFECT_WEEK: { icon: "📊", label: "Perfect Week", color: "text-blue-600" }
  LEGENDARY_MONTH: { icon: "👑", label: "Legendary Month", color: "text-purple-600" }
  DEFAULT: { icon: "⭐", label: "Achievement", color: "text-gray-600" }
}
DATE_FORMATS: {
  YESTERDAY: "Yesterday"
  DAYS_AGO: "days ago"
  DATE_FORMAT: "MMM dd"
}
```

#### COMMON
```typescript
ERRORS: {
  UNKNOWN_ERROR, FETCH_ERROR, NETWORK_ERROR, VALIDATION_ERROR
}
LOADING: {
  LOADING, SAVING, PROCESSING
}
ACTIONS: {
  RETRY, SAVE, CANCEL, CLOSE, REFRESH
}
```

### Integración con Componentes

#### Importación
```typescript
import { PLATE_BUILDER, SUMMARY, GAMIFICATION, formatMessage } from '@/lib/i18n/en';
```

#### Uso de Constantes
```typescript
// Labels simples
<span>{PLATE_BUILDER.LABELS.INGREDIENT_LIBRARY}</span>

// Toasts con interpolación
toast({
  title: SUMMARY.TOASTS.PERFECT_WEEK.title,
  description: formatMessage(SUMMARY.TOASTS.PERFECT_WEEK.description, { amount: xpAmount })
});
```

#### Formato de Fechas
```typescript
// Cambio de español a inglés
date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
```

### Preparación para Futuro i18n

#### Estructura Escalable
- **Archivo base**: `en.ts` como referencia
- **Futuro**: `es.ts`, `fr.ts`, etc.
- **Runtime**: Preparado para librerías como `react-i18next`

#### Beneficios Inmediatos
- **Consistencia**: Textos uniformes en toda la app
- **Mantenimiento**: Cambios centralizados
- **Type safety**: Prevención de errores
- **Developer experience**: Mejor IntelliSense

## Puertas de Calidad (Quality Gates)

### Archivos Creados

#### Configuración de ESLint Estricta (`.eslintrc.json`)

- **Reglas TypeScript estrictas**: 
  - `@typescript-eslint/no-unused-vars`: Error para variables no utilizadas
  - `@typescript-eslint/no-explicit-any`: Warning para uso de `any`
  - `@typescript-eslint/prefer-const`: Error para variables que deberían ser const
  - `@typescript-eslint/no-non-null-assertion`: Warning para assertions no-null
  - `@typescript-eslint/no-empty-function`: Warning para funciones vacías
  - `@typescript-eslint/no-inferrable-types`: Error para tipos inferibles
  - `@typescript-eslint/prefer-nullish-coalescing`: Error para usar `??` en lugar de `||`
  - `@typescript-eslint/prefer-optional-chain`: Error para usar `?.` en lugar de `&&`
  - `@typescript-eslint/no-unnecessary-type-assertion`: Error para type assertions innecesarios
  - `@typescript-eslint/no-floating-promises`: Error para promesas no manejadas
  - `@typescript-eslint/await-thenable`: Error para await en valores no thenable
  - `@typescript-eslint/no-misused-promises`: Error para promesas mal usadas

- **Reglas de Import**:
  - `import/order`: Ordenamiento automático de imports
  - `import/no-unused-modules`: Error para módulos no utilizados
  - `import/no-duplicates`: Error para imports duplicados

- **Reglas de Calidad de Código**:
  - `no-console`: Warning para console.log
  - `no-debugger`: Error para debugger statements
  - `no-alert`: Warning para alert/confirm/prompt
  - `prefer-const`: Error para variables que deberían ser const
  - `no-var`: Error para uso de var
  - `eqeqeq`: Error para usar === en lugar de ==
  - `curly`: Error para llaves obligatorias en if/for/while
  - `no-eval`: Error para eval()
  - `no-implied-eval`: Error para eval implícito
  - `no-new-func`: Error para new Function()
  - `no-script-url`: Error para javascript: URLs
  - `no-sequences`: Error para comma operator
  - `no-throw-literal`: Error para throw de literales
  - `no-unmodified-loop-condition`: Error para condiciones de loop no modificadas
  - `no-unused-expressions`: Error para expresiones no utilizadas
  - `no-useless-call`: Error para .call() innecesario
  - `no-useless-concat`: Error para concatenación innecesaria
  - `no-useless-return`: Error para return innecesario
  - `prefer-arrow-callback`: Error para usar arrow functions
  - `prefer-template`: Error para usar template literals
  - `yoda`: Error para condiciones yoda

- **Reglas de React**:
  - `react/jsx-no-useless-fragment`: Error para fragments innecesarios
  - `react/jsx-key`: Error para elementos sin key
  - `react/jsx-no-duplicate-props`: Error para props duplicados
  - `react/jsx-no-undef`: Error para componentes no definidos
  - `react/no-array-index-key`: Warning para usar index como key
  - `react/no-children-prop`: Error para children como prop
  - `react/no-danger-with-children`: Error para dangerouslySetInnerHTML con children
  - `react/no-deprecated`: Error para APIs deprecadas
  - `react/no-direct-mutation-state`: Error para mutación directa de state
  - `react/no-find-dom-node`: Error para findDOMNode
  - `react/no-is-mounted`: Error para isMounted
  - `react/no-render-return-value`: Error para return value de render
  - `react/no-string-refs`: Error para string refs
  - `react/no-unescaped-entities`: Error para entidades no escapadas
  - `react/no-unknown-property`: Error para props desconocidos
  - `react/no-unsafe`: Error para métodos unsafe
  - `react/require-render-return`: Error para render sin return
  - `react/self-closing-comp`: Error para componentes auto-cerrados

- **Reglas de Next.js**:
  - `@next/next/no-img-element`: Error para usar `<img>` en lugar de `<Image>`
  - `@next/next/no-html-link-for-pages`: Error para links HTML en lugar de Link
  - `@next/next/no-sync-scripts`: Error para scripts síncronos
  - `@next/next/no-title-in-document-head`: Error para title en document head
  - `@next/next/no-unwanted-polyfillio`: Error para polyfills no deseados
  - `@next/next/no-css-tags`: Error para CSS tags
  - `@next/next/no-document-import-in-page`: Error para importar document en pages
  - `@next/next/no-head-import-in-document`: Error para importar head en document
  - `@next/next/no-page-custom-font`: Error para fuentes personalizadas en pages
  - `@next/next/no-styled-jsx-in-document`: Error para styled-jsx en document
  - `@next/next/no-typos`: Error para typos en Next.js

- **Overrides para Tests**:
  - Desactiva `@typescript-eslint/no-explicit-any` en archivos de test
  - Desactiva `no-console` en archivos de test

#### Tests Unitarios Extendidos (`__tests__/lib/nutri/validation.test.ts`)

- **Edge Cases Agregados**:
  - **Valores negativos**: Target de calorías negativo
  - **Valores muy grandes**: Calorías de millones
  - **Valores decimales**: Calorías con decimales
  - **Múltiples items del mismo grupo**: Varios carbohidratos, etc.
  - **Solo treats**: Array con solo elementos treat
  - **Mezcla de treats y grupos válidos**: Combinación de ambos
  - **Valores límite**: Exactamente en el límite y justo por encima
  - **Cantidades muy pequeñas**: 1 gramo de ingredientes
  - **Cantidades muy grandes**: 10kg de ingredientes

- **Cobertura de Casos**:
  - **Boundary testing**: Valores exactos en límites
  - **Edge case testing**: Valores extremos
  - **Data type testing**: Diferentes tipos de datos
  - **Business logic testing**: Lógica de negocio específica

#### Tests Unitarios para Streak Updates (`__tests__/lib/streak-updates.test.ts`)

- **Mock Database Class**:
  - **MockStreak interface**: Estructura de datos de racha
  - **MockDayEntry interface**: Estructura de entrada diaria
  - **MockDatabase class**: Simulación de base de datos
    - `getStreak()`: Obtener racha actual
    - `upsertStreak()`: Crear/actualizar racha
    - `getDayEntry()`: Obtener entrada del día
    - `getYesterdayEntry()`: Obtener entrada de ayer
    - `addDayEntry()`: Agregar entrada diaria
    - `clear()`: Limpiar datos de test
    - `getStreakData()`: Obtener datos de racha para verificación

- **StreakManager Class**:
  - **updateStreak()**: Lógica principal de actualización de racha
  - **Lógica de negocio**: 
    - Incrementar racha si ayer fue exitoso
    - Reiniciar racha si ayer no fue exitoso
    - Actualizar mejor racha cuando se supera
    - Mantener mejor racha en fallos

- **Test Cases**:
  - **Casos exitosos**:
    - Primer día exitoso (racha = 1)
    - Incrementar racha cuando ayer fue exitoso
    - Actualizar mejor racha cuando se supera
    - Iniciar nueva racha cuando ayer no fue exitoso
    - Iniciar nueva racha cuando no hay entrada de ayer

  - **Casos de fallo**:
    - Reiniciar racha a 0 en fallo
    - Mantener mejor racha en fallo
    - Manejar fallo sin racha existente

  - **Edge cases**:
    - Múltiples días consecutivos exitosos
    - Interrupción y reinicio de racha
    - Rachas muy largas (100+ días)
    - Condiciones de límite de fecha (cambio de mes)
    - Actualizaciones concurrentes de racha

### Características Técnicas

#### ESLint Configuration
- **Extends**: next/core-web-vitals, next/typescript
- **Rules**: 50+ reglas estrictas para TypeScript, React, Next.js
- **Overrides**: Configuración específica para archivos de test
- **Import ordering**: Ordenamiento automático y alfabético
- **Code quality**: Prevención de anti-patterns comunes

#### Test Coverage
- **evaluateDay**: 15+ test cases cubriendo edge cases
- **Streak Updates**: 20+ test cases con mock database
- **Mock Database**: Simulación completa de operaciones DB
- **Business Logic**: Cobertura completa de lógica de negocio

#### Quality Gates
- **TypeScript strict**: Prevención de errores de tipo
- **Import management**: Imports organizados y sin duplicados
- **Code patterns**: Uso de mejores prácticas
- **React best practices**: Patrones recomendados de React
- **Next.js compliance**: Cumplimiento de convenciones Next.js

### Beneficios de las Quality Gates

#### Desarrollo
- **Prevención de errores**: Detección temprana de problemas
- **Consistencia**: Código uniforme en todo el proyecto
- **Mejores prácticas**: Enfoque en patrones recomendados
- **Mantenibilidad**: Código más fácil de mantener

#### Testing
- **Cobertura completa**: Edge cases y casos límite
- **Mock database**: Tests aislados y rápidos
- **Business logic**: Validación de lógica de negocio
- **Regression prevention**: Prevención de regresiones

#### CI/CD
- **Automated checks**: Verificaciones automáticas
- **Quality gates**: Bloqueo de código de baja calidad
- **Consistent standards**: Estándares consistentes
- **Developer feedback**: Feedback inmediato a desarrolladores

### Integración con Workflow

#### Pre-commit Hooks
- **ESLint**: Verificación automática antes de commit
- **Type checking**: Verificación de tipos TypeScript
- **Test running**: Ejecución de tests relevantes

#### CI Pipeline
- **Lint checks**: Verificación de ESLint en CI
- **Test execution**: Ejecución de todos los tests
- **Quality gates**: Bloqueo de merge si fallan checks
- **Coverage reports**: Reportes de cobertura de tests

#### Development Workflow
- **IDE integration**: ESLint integrado en IDE
- **Real-time feedback**: Feedback en tiempo real
- **Auto-fixing**: Corrección automática de problemas
- **Import organization**: Organización automática de imports
  - **TODO**: Integración con Supabase para datos reales

- **monthly/route.ts**: Endpoint GET para resumen mensual
  - **Input**: month (YYYY-MM), goalId
  - **Agregación**: success_weeks_count sobre semanas del mes
  - **Lógica de éxito**: todas las semanas exitosas
  - **XP automático**: +800 XP si es exitoso y no se ha otorgado antes
  - **Cálculo de semanas**: Generación automática de semanas en el mes
  - **Validación**: Zod schemas para parámetros de entrada
  - **Mock data**: Datos de prueba para desarrollo

## Centralización de Strings de Internacionalización (i18n)

### Archivos Creados

#### Archivo de Constantes de Internacionalización (`/lib/i18n/`)

- **en.ts**: Constantes centralizadas para todos los textos en inglés
  - **PLATE_BUILDER**: Toasts y labels del constructor de platos
  - **CALENDAR**: Labels del calendario
  - **SUMMARY**: Toasts y labels de resúmenes semanales/mensuales
  - **GAMIFICATION**: Labels y mensajes de gamificación
  - **COMMON**: Mensajes comunes (errores, loading, acciones)
  - **formatMessage**: Función helper para interpolación de variables
  - **TypeScript**: Constantes tipadas con `as const` para type safety

### Archivos Actualizados

#### Componentes Actualizados para usar i18n

- **PlateBuilder.tsx**: 
  - **Toasts**: Todos los mensajes de toast ahora usan constantes
  - **Labels**: Biblioteca de ingredientes, constructor de platos, grupos nutricionales
  - **Placeholders**: Texto de búsqueda y botones
  - **Tooltips**: Mensajes de estado (incluido/faltante)

- **WeeklySummaryCard.tsx**:
  - **Toasts**: Mensajes de semana perfecta con interpolación
  - **Labels**: Títulos, criterios de éxito, estados de carga
  - **Fechas**: Formato de fechas en inglés
  - **Mensajes de error**: Textos estandarizados

- **MonthlySummaryCard.tsx**:
  - **Toasts**: Mensajes de mes legendario con interpolación
  - **Labels**: Títulos, criterios de éxito, desglose semanal
  - **Fechas**: Formato de fechas en inglés
  - **Mensajes de error**: Textos estandarizados

- **StreakWidget.tsx**:
  - **Labels**: Racha actual, mejor racha, progreso
  - **Mensajes motivacionales**: Según nivel de racha
  - **Estados de carga**: Loading y retry
  - **Mensajes de error**: Textos estandarizados

- **XpPanel.tsx**:
  - **Labels**: Nivel, progreso, actividad reciente
  - **Tipos de actividad**: Iconos y colores por tipo de logro
  - **Formato de fechas**: Relativo (ayer, hace X días)
  - **Estados de carga**: Loading y retry

### Características Técnicas

#### Organización de Constantes
- **Estructura jerárquica**: Agrupadas por funcionalidad
- **TypeScript**: Constantes tipadas con `as const`
- **Interpolación**: Función `formatMessage` para variables
- **Consistencia**: Nomenclatura uniforme en inglés

#### Categorías de Textos
- **TOASTS**: Mensajes de notificaciones
- **LABELS**: Etiquetas de UI
- **ERRORS**: Mensajes de error
- **LOADING**: Estados de carga
- **ACTIONS**: Acciones de usuario

#### Funcionalidades de Interpolación
- **formatMessage**: Reemplaza `{variable}` con valores
- **Type safety**: Parámetros tipados
- **Flexibilidad**: Soporte para strings y números

### Beneficios de la Centralización

#### Mantenimiento
- **Un solo lugar**: Todos los textos en un archivo
- **Consistencia**: Nomenclatura uniforme
- **Fácil actualización**: Cambios centralizados
- **Type safety**: Prevención de errores tipográficos

#### Escalabilidad
- **Preparado para i18n**: Estructura lista para múltiples idiomas
- **Reutilización**: Constantes compartidas entre componentes
- **Extensibilidad**: Fácil agregar nuevos idiomas

#### Desarrollo
- **IntelliSense**: Autocompletado de constantes
- **Refactoring**: Cambios seguros con TypeScript
- **Testing**: Fácil mockear textos para tests

### Estructura de Constantes

#### PLATE_BUILDER
```typescript
TOASTS: {
  EMPTY_PLATE: { title, description }
  DAY_COMPLETE: { title, description }
  CALORIE_EXCESS: { title, description }
  EXTRAS_DETECTED: { title, description }
  MISSING_GROUPS: { title, description }
  SAVE_ERROR: { title, description }
}
LABELS: {
  INGREDIENT_LIBRARY, SEARCH_PLACEHOLDER, PLATE_BUILDER,
  DAILY_GOAL, CARBOHYDRATES, PROTEIN, FAT, VEGETABLES_FRUITS,
  EXTRAS_TREATS, SAVE_DAY, SAVING, INCLUDED, MISSING
}
```

#### SUMMARY
```typescript
TOASTS: {
  PERFECT_WEEK: { title, description: "You've earned {amount} XP..." }
  LEGENDARY_MONTH: { title, description: "You've earned {amount} XP..." }
}
LABELS: {
  WEEKLY_SUMMARY, MONTHLY_SUMMARY, PERFECT_WEEK, INCOMPLETE_WEEK,
  LEGENDARY_MONTH, INCOMPLETE_MONTH, CALORIES, SUCCESSFUL_DAYS,
  SUCCESSFUL_WEEKS, SUCCESS_CRITERIA, WEEKLY_BREAKDOWN,
  ALL_DAYS_SUCCESSFUL, CALORIES_WITHIN_WEEKLY_GOAL,
  ALL_WEEKS_SUCCESSFUL, CALORIES_WITHIN_MONTHLY_GOAL,
  WEEK_1, LOADING_SUMMARY, RETRY
}
```

#### GAMIFICATION
```typescript
LABELS: {
  CURRENT_STREAK, BEST_STREAK, DAYS, TOTAL_XP, LEVEL,
  PROGRESS_TO_LEVEL, RECENT_ACTIVITY, LOADING, RETRY
}
STREAK: {
  START_STREAK, GOOD_START, KEEP_GOING, EXCELLENT_STREAK,
  LEGENDARY_STREAK, MAINTAIN_STREAK, PROGRESS, LEGENDARY,
  TOWARDS_7_DAYS, TOWARDS_4_DAYS, TOWARDS_2_DAYS
}
XP_ACTIVITY: {
  SUCCESSFUL_DAY: { icon: "📅", label: "Successful Day", color: "text-green-600" }
  STREAK: { icon: "🔥", label: "Streak", color: "text-orange-600" }
  PERFECT_WEEK: { icon: "📊", label: "Perfect Week", color: "text-blue-600" }
  LEGENDARY_MONTH: { icon: "👑", label: "Legendary Month", color: "text-purple-600" }
  DEFAULT: { icon: "⭐", label: "Achievement", color: "text-gray-600" }
}
DATE_FORMATS: {
  YESTERDAY: "Yesterday"
  DAYS_AGO: "days ago"
  DATE_FORMAT: "MMM dd"
}
```

#### COMMON
```typescript
ERRORS: {
  UNKNOWN_ERROR, FETCH_ERROR, NETWORK_ERROR, VALIDATION_ERROR
}
LOADING: {
  LOADING, SAVING, PROCESSING
}
ACTIONS: {
  RETRY, SAVE, CANCEL, CLOSE, REFRESH
}
```

### Integración con Componentes

#### Importación
```typescript
import { PLATE_BUILDER, SUMMARY, GAMIFICATION, formatMessage } from '@/lib/i18n/en';
```

#### Uso de Constantes
```typescript
// Labels simples
<span>{PLATE_BUILDER.LABELS.INGREDIENT_LIBRARY}</span>

// Toasts con interpolación
toast({
  title: SUMMARY.TOASTS.PERFECT_WEEK.title,
  description: formatMessage(SUMMARY.TOASTS.PERFECT_WEEK.description, { amount: xpAmount })
});
```

#### Formato de Fechas
```typescript
// Cambio de español a inglés
date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
```

### Preparación para Futuro i18n

#### Estructura Escalable
- **Archivo base**: `en.ts` como referencia
- **Futuro**: `es.ts`, `fr.ts`, etc.
- **Runtime**: Preparado para librerías como `react-i18next`

#### Beneficios Inmediatos
- **Consistencia**: Textos uniformes en toda la app
- **Mantenimiento**: Cambios centralizados
- **Type safety**: Prevención de errores
- **Developer experience**: Mejor IntelliSense

## Puertas de Calidad (Quality Gates)

### Archivos Creados

#### Configuración de ESLint Estricta (`.eslintrc.json`)

- **Reglas TypeScript estrictas**: 
  - `@typescript-eslint/no-unused-vars`: Error para variables no utilizadas
  - `@typescript-eslint/no-explicit-any`: Warning para uso de `any`
  - `@typescript-eslint/prefer-const`: Error para variables que deberían ser const
  - `@typescript-eslint/no-non-null-assertion`: Warning para assertions no-null
  - `@typescript-eslint/no-empty-function`: Warning para funciones vacías
  - `@typescript-eslint/no-inferrable-types`: Error para tipos inferibles
  - `@typescript-eslint/prefer-nullish-coalescing`: Error para usar `??` en lugar de `||`
  - `@typescript-eslint/prefer-optional-chain`: Error para usar `?.` en lugar de `&&`
  - `@typescript-eslint/no-unnecessary-type-assertion`: Error para type assertions innecesarios
  - `@typescript-eslint/no-floating-promises`: Error para promesas no manejadas
  - `@typescript-eslint/await-thenable`: Error para await en valores no thenable
  - `@typescript-eslint/no-misused-promises`: Error para promesas mal usadas

- **Reglas de Import**:
  - `import/order`: Ordenamiento automático de imports
  - `import/no-unused-modules`: Error para módulos no utilizados
  - `import/no-duplicates`: Error para imports duplicados

- **Reglas de Calidad de Código**:
  - `no-console`: Warning para console.log
  - `no-debugger`: Error para debugger statements
  - `no-alert`: Warning para alert/confirm/prompt
  - `prefer-const`: Error para variables que deberían ser const
  - `no-var`: Error para uso de var
  - `eqeqeq`: Error para usar === en lugar de ==
  - `curly`: Error para llaves obligatorias en if/for/while
  - `no-eval`: Error para eval()
  - `no-implied-eval`: Error para eval implícito
  - `no-new-func`: Error para new Function()
  - `no-script-url`: Error para javascript: URLs
  - `no-sequences`: Error para comma operator
  - `no-throw-literal`: Error para throw de literales
  - `no-unmodified-loop-condition`: Error para condiciones de loop no modificadas
  - `no-unused-expressions`: Error para expresiones no utilizadas
  - `no-useless-call`: Error para .call() innecesario
  - `no-useless-concat`: Error para concatenación innecesaria
  - `no-useless-return`: Error para return innecesario
  - `prefer-arrow-callback`: Error para usar arrow functions
  - `prefer-template`: Error para usar template literals
  - `yoda`: Error para condiciones yoda

- **Reglas de React**:
  - `react/jsx-no-useless-fragment`: Error para fragments innecesarios
  - `react/jsx-key`: Error para elementos sin key
  - `react/jsx-no-duplicate-props`: Error para props duplicados
  - `react/jsx-no-undef`: Error para componentes no definidos
  - `react/no-array-index-key`: Warning para usar index como key
  - `react/no-children-prop`: Error para children como prop
  - `react/no-danger-with-children`: Error para dangerouslySetInnerHTML con children
  - `react/no-deprecated`: Error para APIs deprecadas
  - `react/no-direct-mutation-state`: Error para mutación directa de state
  - `react/no-find-dom-node`: Error para findDOMNode
  - `react/no-is-mounted`: Error para isMounted
  - `react/no-render-return-value`: Error para return value de render
  - `react/no-string-refs`: Error para string refs
  - `react/no-unescaped-entities`: Error para entidades no escapadas
  - `react/no-unknown-property`: Error para props desconocidos
  - `react/no-unsafe`: Error para métodos unsafe
  - `react/require-render-return`: Error para render sin return
  - `react/self-closing-comp`: Error para componentes auto-cerrados

- **Reglas de Next.js**:
  - `@next/next/no-img-element`: Error para usar `<img>` en lugar de `<Image>`
  - `@next/next/no-html-link-for-pages`: Error para links HTML en lugar de Link
  - `@next/next/no-sync-scripts`: Error para scripts síncronos
  - `@next/next/no-title-in-document-head`: Error para title en document head
  - `@next/next/no-unwanted-polyfillio`: Error para polyfills no deseados
  - `@next/next/no-css-tags`: Error para CSS tags
  - `@next/next/no-document-import-in-page`: Error para importar document en pages
  - `@next/next/no-head-import-in-document`: Error para importar head en document
  - `@next/next/no-page-custom-font`: Error para fuentes personalizadas en pages
  - `@next/next/no-styled-jsx-in-document`: Error para styled-jsx en document
  - `@next/next/no-typos`: Error para typos en Next.js

- **Overrides para Tests**:
  - Desactiva `@typescript-eslint/no-explicit-any` en archivos de test
  - Desactiva `no-console` en archivos de test

#### Tests Unitarios Extendidos (`__tests__/lib/nutri/validation.test.ts`)

- **Edge Cases Agregados**:
  - **Valores negativos**: Target de calorías negativo
  - **Valores muy grandes**: Calorías de millones
  - **Valores decimales**: Calorías con decimales
  - **Múltiples items del mismo grupo**: Varios carbohidratos, etc.
  - **Solo treats**: Array con solo elementos treat
  - **Mezcla de treats y grupos válidos**: Combinación de ambos
  - **Valores límite**: Exactamente en el límite y justo por encima
  - **Cantidades muy pequeñas**: 1 gramo de ingredientes
  - **Cantidades muy grandes**: 10kg de ingredientes

- **Cobertura de Casos**:
  - **Boundary testing**: Valores exactos en límites
  - **Edge case testing**: Valores extremos
  - **Data type testing**: Diferentes tipos de datos
  - **Business logic testing**: Lógica de negocio específica

#### Tests Unitarios para Streak Updates (`__tests__/lib/streak-updates.test.ts`)

- **Mock Database Class**:
  - **MockStreak interface**: Estructura de datos de racha
  - **MockDayEntry interface**: Estructura de entrada diaria
  - **MockDatabase class**: Simulación de base de datos
    - `getStreak()`: Obtener racha actual
    - `upsertStreak()`: Crear/actualizar racha
    - `getDayEntry()`: Obtener entrada del día
    - `getYesterdayEntry()`: Obtener entrada de ayer
    - `addDayEntry()`: Agregar entrada diaria
    - `clear()`: Limpiar datos de test
    - `getStreakData()`: Obtener datos de racha para verificación

- **StreakManager Class**:
  - **updateStreak()**: Lógica principal de actualización de racha
  - **Lógica de negocio**: 
    - Incrementar racha si ayer fue exitoso
    - Reiniciar racha si ayer no fue exitoso
    - Actualizar mejor racha cuando se supera
    - Mantener mejor racha en fallos

- **Test Cases**:
  - **Casos exitosos**:
    - Primer día exitoso (racha = 1)
    - Incrementar racha cuando ayer fue exitoso
    - Actualizar mejor racha cuando se supera
    - Iniciar nueva racha cuando ayer no fue exitoso
    - Iniciar nueva racha cuando no hay entrada de ayer

  - **Casos de fallo**:
    - Reiniciar racha a 0 en fallo
    - Mantener mejor racha en fallo
    - Manejar fallo sin racha existente

  - **Edge cases**:
    - Múltiples días consecutivos exitosos
    - Interrupción y reinicio de racha
    - Rachas muy largas (100+ días)
    - Condiciones de límite de fecha (cambio de mes)
    - Actualizaciones concurrentes de racha

### Características Técnicas

#### ESLint Configuration
- **Extends**: next/core-web-vitals, next/typescript
- **Rules**: 50+ reglas estrictas para TypeScript, React, Next.js
- **Overrides**: Configuración específica para archivos de test
- **Import ordering**: Ordenamiento automático y alfabético
- **Code quality**: Prevención de anti-patterns comunes

#### Test Coverage
- **evaluateDay**: 15+ test cases cubriendo edge cases
- **Streak Updates**: 20+ test cases con mock database
- **Mock Database**: Simulación completa de operaciones DB
- **Business Logic**: Cobertura completa de lógica de negocio

#### Quality Gates
- **TypeScript strict**: Prevención de errores de tipo
- **Import management**: Imports organizados y sin duplicados
- **Code patterns**: Uso de mejores prácticas
- **React best practices**: Patrones recomendados de React
- **Next.js compliance**: Cumplimiento de convenciones Next.js

### Beneficios de las Quality Gates

#### Desarrollo
- **Prevención de errores**: Detección temprana de problemas
- **Consistencia**: Código uniforme en todo el proyecto
- **Mejores prácticas**: Enfoque en patrones recomendados
- **Mantenibilidad**: Código más fácil de mantener

#### Testing
- **Cobertura completa**: Edge cases y casos límite
- **Mock database**: Tests aislados y rápidos
- **Business logic**: Validación de lógica de negocio
- **Regression prevention**: Prevención de regresiones

#### CI/CD
- **Automated checks**: Verificaciones automáticas
- **Quality gates**: Bloqueo de código de baja calidad
- **Consistent standards**: Estándares consistentes
- **Developer feedback**: Feedback inmediato a desarrolladores

### Integración con Workflow

#### Pre-commit Hooks
- **ESLint**: Verificación automática antes de commit
- **Type checking**: Verificación de tipos TypeScript
- **Test running**: Ejecución de tests relevantes

#### CI Pipeline
- **Lint checks**: Verificación de ESLint en CI
- **Test execution**: Ejecución de todos los tests
- **Quality gates**: Bloqueo de merge si fallan checks
- **Coverage reports**: Reportes de cobertura de tests

#### Development Workflow
- **IDE integration**: ESLint integrado en IDE
- **Real-time feedback**: Feedback en tiempo real
- **Auto-fixing**: Corrección automática de problemas
- **Import organization**: Organización automática de imports
  - **TODO**: Integración con Supabase para datos reales

#### Componentes de Resumen (`/components/summary/`)

- **WeeklySummaryCard.tsx**: Tarjeta de resumen semanal
  - **Estado reactivo**: loading, error, data con useState
  - **Fetch automático**: useEffect para cargar datos al montar
  - **Toast notifications**: Mensaje de éxito cuando se otorga XP
  - **Visualización**: Progress bar, badges, iconos de estado
  - **Criterios de éxito**: Lista visual de condiciones cumplidas
  - **Refresh manual**: Botón para recargar datos
  - **Formato de fechas**: Rango de semana legible
  - **Responsive**: Diseño adaptativo con shadcn/ui

- **MonthlySummaryCard.tsx**: Tarjeta de resumen mensual
  - **Estado reactivo**: loading, error, data con useState
  - **Fetch automático**: useEffect para cargar datos al montar
  - **Toast notifications**: Mensaje de éxito cuando se otorga XP
  - **Visualización**: Progress bar, badges, iconos de estado
  - **Desglose semanal**: Grid visual de semanas exitosas/fallidas
  - **Criterios de éxito**: Lista visual de condiciones cumplidas
  - **Refresh manual**: Botón para recargar datos
  - **Formato de fechas**: Mes legible en español
  - **Responsive**: Diseño adaptativo con shadcn/ui

### Características Técnicas

- **Validación de entrada**: Zod schemas para todos los parámetros
- **Manejo de errores**: Try-catch con mensajes específicos
- **Estado de carga**: Loading states con spinners
- **Toast system**: Notificaciones contextuales para XP
- **Cálculos en tiempo real**: Progreso y porcentajes automáticos
- **Mock data**: Datos de prueba para desarrollo

## Centralización de Strings de Internacionalización (i18n)

### Archivos Creados

#### Archivo de Constantes de Internacionalización (`/lib/i18n/`)

- **en.ts**: Constantes centralizadas para todos los textos en inglés
  - **PLATE_BUILDER**: Toasts y labels del constructor de platos
  - **CALENDAR**: Labels del calendario
  - **SUMMARY**: Toasts y labels de resúmenes semanales/mensuales
  - **GAMIFICATION**: Labels y mensajes de gamificación
  - **COMMON**: Mensajes comunes (errores, loading, acciones)
  - **formatMessage**: Función helper para interpolación de variables
  - **TypeScript**: Constantes tipadas con `as const` para type safety

### Archivos Actualizados

#### Componentes Actualizados para usar i18n

- **PlateBuilder.tsx**: 
  - **Toasts**: Todos los mensajes de toast ahora usan constantes
  - **Labels**: Biblioteca de ingredientes, constructor de platos, grupos nutricionales
  - **Placeholders**: Texto de búsqueda y botones
  - **Tooltips**: Mensajes de estado (incluido/faltante)

- **WeeklySummaryCard.tsx**:
  - **Toasts**: Mensajes de semana perfecta con interpolación
  - **Labels**: Títulos, criterios de éxito, estados de carga
  - **Fechas**: Formato de fechas en inglés
  - **Mensajes de error**: Textos estandarizados

- **MonthlySummaryCard.tsx**:
  - **Toasts**: Mensajes de mes legendario con interpolación
  - **Labels**: Títulos, criterios de éxito, desglose semanal
  - **Fechas**: Formato de fechas en inglés
  - **Mensajes de error**: Textos estandarizados

- **StreakWidget.tsx**:
  - **Labels**: Racha actual, mejor racha, progreso
  - **Mensajes motivacionales**: Según nivel de racha
  - **Estados de carga**: Loading y retry
  - **Mensajes de error**: Textos estandarizados

- **XpPanel.tsx**:
  - **Labels**: Nivel, progreso, actividad reciente
  - **Tipos de actividad**: Iconos y colores por tipo de logro
  - **Formato de fechas**: Relativo (ayer, hace X días)
  - **Estados de carga**: Loading y retry

### Características Técnicas

#### Organización de Constantes
- **Estructura jerárquica**: Agrupadas por funcionalidad
- **TypeScript**: Constantes tipadas con `as const`
- **Interpolación**: Función `formatMessage` para variables
- **Consistencia**: Nomenclatura uniforme en inglés

#### Categorías de Textos
- **TOASTS**: Mensajes de notificaciones
- **LABELS**: Etiquetas de UI
- **ERRORS**: Mensajes de error
- **LOADING**: Estados de carga
- **ACTIONS**: Acciones de usuario

#### Funcionalidades de Interpolación
- **formatMessage**: Reemplaza `{variable}` con valores
- **Type safety**: Parámetros tipados
- **Flexibilidad**: Soporte para strings y números

### Beneficios de la Centralización

#### Mantenimiento
- **Un solo lugar**: Todos los textos en un archivo
- **Consistencia**: Nomenclatura uniforme
- **Fácil actualización**: Cambios centralizados
- **Type safety**: Prevención de errores tipográficos

#### Escalabilidad
- **Preparado para i18n**: Estructura lista para múltiples idiomas
- **Reutilización**: Constantes compartidas entre componentes
- **Extensibilidad**: Fácil agregar nuevos idiomas

#### Desarrollo
- **IntelliSense**: Autocompletado de constantes
- **Refactoring**: Cambios seguros con TypeScript
- **Testing**: Fácil mockear textos para tests

### Estructura de Constantes

#### PLATE_BUILDER
```typescript
TOASTS: {
  EMPTY_PLATE: { title, description }
  DAY_COMPLETE: { title, description }
  CALORIE_EXCESS: { title, description }
  EXTRAS_DETECTED: { title, description }
  MISSING_GROUPS: { title, description }
  SAVE_ERROR: { title, description }
}
LABELS: {
  INGREDIENT_LIBRARY, SEARCH_PLACEHOLDER, PLATE_BUILDER,
  DAILY_GOAL, CARBOHYDRATES, PROTEIN, FAT, VEGETABLES_FRUITS,
  EXTRAS_TREATS, SAVE_DAY, SAVING, INCLUDED, MISSING
}
```

#### SUMMARY
```typescript
TOASTS: {
  PERFECT_WEEK: { title, description: "You've earned {amount} XP..." }
  LEGENDARY_MONTH: { title, description: "You've earned {amount} XP..." }
}
LABELS: {
  WEEKLY_SUMMARY, MONTHLY_SUMMARY, PERFECT_WEEK, INCOMPLETE_WEEK,
  LEGENDARY_MONTH, INCOMPLETE_MONTH, CALORIES, SUCCESSFUL_DAYS,
  SUCCESSFUL_WEEKS, SUCCESS_CRITERIA, WEEKLY_BREAKDOWN,
  ALL_DAYS_SUCCESSFUL, CALORIES_WITHIN_WEEKLY_GOAL,
  ALL_WEEKS_SUCCESSFUL, CALORIES_WITHIN_MONTHLY_GOAL,
  WEEK_1, LOADING_SUMMARY, RETRY
}
```

#### GAMIFICATION
```typescript
LABELS: {
  CURRENT_STREAK, BEST_STREAK, DAYS, TOTAL_XP, LEVEL,
  PROGRESS_TO_LEVEL, RECENT_ACTIVITY, LOADING, RETRY
}
STREAK: {
  START_STREAK, GOOD_START, KEEP_GOING, EXCELLENT_STREAK,
  LEGENDARY_STREAK, MAINTAIN_STREAK, PROGRESS, LEGENDARY,
  TOWARDS_7_DAYS, TOWARDS_4_DAYS, TOWARDS_2_DAYS
}
XP_ACTIVITY: {
  SUCCESSFUL_DAY: { icon: "📅", label: "Successful Day", color: "text-green-600" }
  STREAK: { icon: "🔥", label: "Streak", color: "text-orange-600" }
  PERFECT_WEEK: { icon: "📊", label: "Perfect Week", color: "text-blue-600" }
  LEGENDARY_MONTH: { icon: "👑", label: "Legendary Month", color: "text-purple-600" }
  DEFAULT: { icon: "⭐", label: "Achievement", color: "text-gray-600" }
}
DATE_FORMATS: {
  YESTERDAY: "Yesterday"
  DAYS_AGO: "days ago"
  DATE_FORMAT: "MMM dd"
}
```

#### COMMON
```typescript
ERRORS: {
  UNKNOWN_ERROR, FETCH_ERROR, NETWORK_ERROR, VALIDATION_ERROR
}
LOADING: {
  LOADING, SAVING, PROCESSING
}
ACTIONS: {
  RETRY, SAVE, CANCEL, CLOSE, REFRESH
}
```

### Integración con Componentes

#### Importación
```typescript
import { PLATE_BUILDER, SUMMARY, GAMIFICATION, formatMessage } from '@/lib/i18n/en';
```

#### Uso de Constantes
```typescript
// Labels simples
<span>{PLATE_BUILDER.LABELS.INGREDIENT_LIBRARY}</span>

// Toasts con interpolación
toast({
  title: SUMMARY.TOASTS.PERFECT_WEEK.title,
  description: formatMessage(SUMMARY.TOASTS.PERFECT_WEEK.description, { amount: xpAmount })
});
```

#### Formato de Fechas
```typescript
// Cambio de español a inglés
date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
```

### Preparación para Futuro i18n

#### Estructura Escalable
- **Archivo base**: `en.ts` como referencia
- **Futuro**: `es.ts`, `fr.ts`, etc.
- **Runtime**: Preparado para librerías como `react-i18next`

#### Beneficios Inmediatos
- **Consistencia**: Textos uniformes en toda la app
- **Mantenimiento**: Cambios centralizados
- **Type safety**: Prevención de errores
- **Developer experience**: Mejor IntelliSense

## Puertas de Calidad (Quality Gates)

### Archivos Creados

#### Configuración de ESLint Estricta (`.eslintrc.json`)

- **Reglas TypeScript estrictas**: 
  - `@typescript-eslint/no-unused-vars`: Error para variables no utilizadas
  - `@typescript-eslint/no-explicit-any`: Warning para uso de `any`
  - `@typescript-eslint/prefer-const`: Error para variables que deberían ser const
  - `@typescript-eslint/no-non-null-assertion`: Warning para assertions no-null
  - `@typescript-eslint/no-empty-function`: Warning para funciones vacías
  - `@typescript-eslint/no-inferrable-types`: Error para tipos inferibles
  - `@typescript-eslint/prefer-nullish-coalescing`: Error para usar `??` en lugar de `||`
  - `@typescript-eslint/prefer-optional-chain`: Error para usar `?.` en lugar de `&&`
  - `@typescript-eslint/no-unnecessary-type-assertion`: Error para type assertions innecesarios
  - `@typescript-eslint/no-floating-promises`: Error para promesas no manejadas
  - `@typescript-eslint/await-thenable`: Error para await en valores no thenable
  - `@typescript-eslint/no-misused-promises`: Error para promesas mal usadas

- **Reglas de Import**:
  - `import/order`: Ordenamiento automático de imports
  - `import/no-unused-modules`: Error para módulos no utilizados
  - `import/no-duplicates`: Error para imports duplicados

- **Reglas de Calidad de Código**:
  - `no-console`: Warning para console.log
  - `no-debugger`: Error para debugger statements
  - `no-alert`: Warning para alert/confirm/prompt
  - `prefer-const`: Error para variables que deberían ser const
  - `no-var`: Error para uso de var
  - `eqeqeq`: Error para usar === en lugar de ==
  - `curly`: Error para llaves obligatorias en if/for/while
  - `no-eval`: Error para eval()
  - `no-implied-eval`: Error para eval implícito
  - `no-new-func`: Error para new Function()
  - `no-script-url`: Error para javascript: URLs
  - `no-sequences`: Error para comma operator
  - `no-throw-literal`: Error para throw de literales
  - `no-unmodified-loop-condition`: Error para condiciones de loop no modificadas
  - `no-unused-expressions`: Error para expresiones no utilizadas
  - `no-useless-call`: Error para .call() innecesario
  - `no-useless-concat`: Error para concatenación innecesaria
  - `no-useless-return`: Error para return innecesario
  - `prefer-arrow-callback`: Error para usar arrow functions
  - `prefer-template`: Error para usar template literals
  - `yoda`: Error para condiciones yoda

- **Reglas de React**:
  - `react/jsx-no-useless-fragment`: Error para fragments innecesarios
  - `react/jsx-key`: Error para elementos sin key
  - `react/jsx-no-duplicate-props`: Error para props duplicados
  - `react/jsx-no-undef`: Error para componentes no definidos
  - `react/no-array-index-key`: Warning para usar index como key
  - `react/no-children-prop`: Error para children como prop
  - `react/no-danger-with-children`: Error para dangerouslySetInnerHTML con children
  - `react/no-deprecated`: Error para APIs deprecadas
  - `react/no-direct-mutation-state`: Error para mutación directa de state
  - `react/no-find-dom-node`: Error para findDOMNode
  - `react/no-is-mounted`: Error para isMounted
  - `react/no-render-return-value`: Error para return value de render
  - `react/no-string-refs`: Error para string refs
  - `react/no-unescaped-entities`: Error para entidades no escapadas
  - `react/no-unknown-property`: Error para props desconocidos
  - `react/no-unsafe`: Error para métodos unsafe
  - `react/require-render-return`: Error para render sin return
  - `react/self-closing-comp`: Error para componentes auto-cerrados

- **Reglas de Next.js**:
  - `@next/next/no-img-element`: Error para usar `<img>` en lugar de `<Image>`
  - `@next/next/no-html-link-for-pages`: Error para links HTML en lugar de Link
  - `@next/next/no-sync-scripts`: Error para scripts síncronos
  - `@next/next/no-title-in-document-head`: Error para title en document head
  - `@next/next/no-unwanted-polyfillio`: Error para polyfills no deseados
  - `@next/next/no-css-tags`: Error para CSS tags
  - `@next/next/no-document-import-in-page`: Error para importar document en pages
  - `@next/next/no-head-import-in-document`: Error para importar head en document
  - `@next/next/no-page-custom-font`: Error para fuentes personalizadas en pages
  - `@next/next/no-styled-jsx-in-document`: Error para styled-jsx en document
  - `@next/next/no-typos`: Error para typos en Next.js

- **Overrides para Tests**:
  - Desactiva `@typescript-eslint/no-explicit-any` en archivos de test
  - Desactiva `no-console` en archivos de test

#### Tests Unitarios Extendidos (`__tests__/lib/nutri/validation.test.ts`)

- **Edge Cases Agregados**:
  - **Valores negativos**: Target de calorías negativo
  - **Valores muy grandes**: Calorías de millones
  - **Valores decimales**: Calorías con decimales
  - **Múltiples items del mismo grupo**: Varios carbohidratos, etc.
  - **Solo treats**: Array con solo elementos treat
  - **Mezcla de treats y grupos válidos**: Combinación de ambos
  - **Valores límite**: Exactamente en el límite y justo por encima
  - **Cantidades muy pequeñas**: 1 gramo de ingredientes
  - **Cantidades muy grandes**: 10kg de ingredientes

- **Cobertura de Casos**:
  - **Boundary testing**: Valores exactos en límites
  - **Edge case testing**: Valores extremos
  - **Data type testing**: Diferentes tipos de datos
  - **Business logic testing**: Lógica de negocio específica

#### Tests Unitarios para Streak Updates (`__tests__/lib/streak-updates.test.ts`)

- **Mock Database Class**:
  - **MockStreak interface**: Estructura de datos de racha
  - **MockDayEntry interface**: Estructura de entrada diaria
  - **MockDatabase class**: Simulación de base de datos
    - `getStreak()`: Obtener racha actual
    - `upsertStreak()`: Crear/actualizar racha
    - `getDayEntry()`: Obtener entrada del día
    - `getYesterdayEntry()`: Obtener entrada de ayer
    - `addDayEntry()`: Agregar entrada diaria
    - `clear()`: Limpiar datos de test
    - `getStreakData()`: Obtener datos de racha para verificación

- **StreakManager Class**:
  - **updateStreak()**: Lógica principal de actualización de racha
  - **Lógica de negocio**: 
    - Incrementar racha si ayer fue exitoso
    - Reiniciar racha si ayer no fue exitoso
    - Actualizar mejor racha cuando se supera
    - Mantener mejor racha en fallos

- **Test Cases**:
  - **Casos exitosos**:
    - Primer día exitoso (racha = 1)
    - Incrementar racha cuando ayer fue exitoso
    - Actualizar mejor racha cuando se supera
    - Iniciar nueva racha cuando ayer no fue exitoso
    - Iniciar nueva racha cuando no hay entrada de ayer

  - **Casos de fallo**:
    - Reiniciar racha a 0 en fallo
    - Mantener mejor racha en fallo
    - Manejar fallo sin racha existente

  - **Edge cases**:
    - Múltiples días consecutivos exitosos
    - Interrupción y reinicio de racha
    - Rachas muy largas (100+ días)
    - Condiciones de límite de fecha (cambio de mes)
    - Actualizaciones concurrentes de racha

### Características Técnicas

#### ESLint Configuration
- **Extends**: next/core-web-vitals, next/typescript
- **Rules**: 50+ reglas estrictas para TypeScript, React, Next.js
- **Overrides**: Configuración específica para archivos de test
- **Import ordering**: Ordenamiento automático y alfabético
- **Code quality**: Prevención de anti-patterns comunes

#### Test Coverage
- **evaluateDay**: 15+ test cases cubriendo edge cases
- **Streak Updates**: 20+ test cases con mock database
- **Mock Database**: Simulación completa de operaciones DB
- **Business Logic**: Cobertura completa de lógica de negocio

#### Quality Gates
- **TypeScript strict**: Prevención de errores de tipo
- **Import management**: Imports organizados y sin duplicados
- **Code patterns**: Uso de mejores prácticas
- **React best practices**: Patrones recomendados de React
- **Next.js compliance**: Cumplimiento de convenciones Next.js

### Beneficios de las Quality Gates

#### Desarrollo
- **Prevención de errores**: Detección temprana de problemas
- **Consistencia**: Código uniforme en todo el proyecto
- **Mejores prácticas**: Enfoque en patrones recomendados
- **Mantenibilidad**: Código más fácil de mantener

#### Testing
- **Cobertura completa**: Edge cases y casos límite
- **Mock database**: Tests aislados y rápidos
- **Business logic**: Validación de lógica de negocio
- **Regression prevention**: Prevención de regresiones

#### CI/CD
- **Automated checks**: Verificaciones automáticas
- **Quality gates**: Bloqueo de código de baja calidad
- **Consistent standards**: Estándares consistentes
- **Developer feedback**: Feedback inmediato a desarrolladores

### Integración con Workflow

#### Pre-commit Hooks
- **ESLint**: Verificación automática antes de commit
- **Type checking**: Verificación de tipos TypeScript
- **Test running**: Ejecución de tests relevantes

#### CI Pipeline
- **Lint checks**: Verificación de ESLint en CI
- **Test execution**: Ejecución de todos los tests
- **Quality gates**: Bloqueo de merge si fallan checks
- **Coverage reports**: Reportes de cobertura de tests

#### Development Workflow
- **IDE integration**: ESLint integrado en IDE
- **Real-time feedback**: Feedback en tiempo real
- **Auto-fixing**: Corrección automática de problemas
- **Import organization**: Organización automática de imports
- **TypeScript**: Interfaces estrictas para todos los datos
- **Responsive design**: Componentes adaptativos

### Funcionalidades de los Endpoints

#### Resumen Semanal
- **Cálculo de métricas**: Total de calorías, días exitosos, días con datos
- **Lógica de éxito**: Todos los días exitosos + calorías ≤ objetivo
- **XP automático**: +200 XP por semana perfecta (una sola vez)
- **Validación de duplicados**: Verificación de XP ya otorgado
- **Generación de fechas**: Cálculo automático de rango semanal

#### Resumen Mensual
- **Agregación de semanas**: Suma de métricas semanales
- **Lógica de éxito**: Todas las semanas exitosas
- **XP automático**: +800 XP por mes legendario (una sola vez)
- **Validación de duplicados**: Verificación de XP ya otorgado
- **Cálculo de semanas**: Generación automática de semanas en el mes

### Funcionalidades de las Tarjetas

#### WeeklySummaryCard
- **Visualización de progreso**: Barra de progreso de calorías
- **Estado de éxito**: Iconos y colores según resultado
- **Criterios visuales**: Lista de condiciones con checkmarks
- **Refresh manual**: Botón para recargar datos
- **Toast de éxito**: Notificación cuando se otorga XP
- **Formato de fechas**: Rango de semana legible

#### MonthlySummaryCard
- **Visualización de progreso**: Barra de progreso de calorías
- **Estado de éxito**: Iconos y colores según resultado
- **Desglose semanal**: Grid visual de semanas
- **Criterios visuales**: Lista de condiciones con checkmarks
- **Refresh manual**: Botón para recargar datos
- **Toast de éxito**: Notificación cuando se otorga XP
- **Formato de fechas**: Mes legible en español

### Sistema de XP

- **Semana perfecta**: +200 XP (una sola vez por semana)
- **Mes legendario**: +800 XP (una sola vez por mes)
- **Validación de duplicados**: Verificación de XP ya otorgado
- **Toast notifications**: Mensajes de éxito contextuales
- **Persistencia**: TODO: Integración con Supabase

### Integración con Sistema Existente

- **API endpoints**: Usa estructura existente de Next.js
- **Validación**: Integra con Zod schemas existentes
- **Toast system**: Usa useToast hook existente
- **shadcn/ui**: Componentes UI consistentes
- **TypeScript**: Interfaces compatibles con tipos existentes
- **Mock data**: Datos de prueba para desarrollo

## Centralización de Strings de Internacionalización (i18n)

### Archivos Creados

#### Archivo de Constantes de Internacionalización (`/lib/i18n/`)

- **en.ts**: Constantes centralizadas para todos los textos en inglés
  - **PLATE_BUILDER**: Toasts y labels del constructor de platos
  - **CALENDAR**: Labels del calendario
  - **SUMMARY**: Toasts y labels de resúmenes semanales/mensuales
  - **GAMIFICATION**: Labels y mensajes de gamificación
  - **COMMON**: Mensajes comunes (errores, loading, acciones)
  - **formatMessage**: Función helper para interpolación de variables
  - **TypeScript**: Constantes tipadas con `as const` para type safety

### Archivos Actualizados

#### Componentes Actualizados para usar i18n

- **PlateBuilder.tsx**: 
  - **Toasts**: Todos los mensajes de toast ahora usan constantes
  - **Labels**: Biblioteca de ingredientes, constructor de platos, grupos nutricionales
  - **Placeholders**: Texto de búsqueda y botones
  - **Tooltips**: Mensajes de estado (incluido/faltante)

- **WeeklySummaryCard.tsx**:
  - **Toasts**: Mensajes de semana perfecta con interpolación
  - **Labels**: Títulos, criterios de éxito, estados de carga
  - **Fechas**: Formato de fechas en inglés
  - **Mensajes de error**: Textos estandarizados

- **MonthlySummaryCard.tsx**:
  - **Toasts**: Mensajes de mes legendario con interpolación
  - **Labels**: Títulos, criterios de éxito, desglose semanal
  - **Fechas**: Formato de fechas en inglés
  - **Mensajes de error**: Textos estandarizados

- **StreakWidget.tsx**:
  - **Labels**: Racha actual, mejor racha, progreso
  - **Mensajes motivacionales**: Según nivel de racha
  - **Estados de carga**: Loading y retry
  - **Mensajes de error**: Textos estandarizados

- **XpPanel.tsx**:
  - **Labels**: Nivel, progreso, actividad reciente
  - **Tipos de actividad**: Iconos y colores por tipo de logro
  - **Formato de fechas**: Relativo (ayer, hace X días)
  - **Estados de carga**: Loading y retry

### Características Técnicas

#### Organización de Constantes
- **Estructura jerárquica**: Agrupadas por funcionalidad
- **TypeScript**: Constantes tipadas con `as const`
- **Interpolación**: Función `formatMessage` para variables
- **Consistencia**: Nomenclatura uniforme en inglés

#### Categorías de Textos
- **TOASTS**: Mensajes de notificaciones
- **LABELS**: Etiquetas de UI
- **ERRORS**: Mensajes de error
- **LOADING**: Estados de carga
- **ACTIONS**: Acciones de usuario

#### Funcionalidades de Interpolación
- **formatMessage**: Reemplaza `{variable}` con valores
- **Type safety**: Parámetros tipados
- **Flexibilidad**: Soporte para strings y números

### Beneficios de la Centralización

#### Mantenimiento
- **Un solo lugar**: Todos los textos en un archivo
- **Consistencia**: Nomenclatura uniforme
- **Fácil actualización**: Cambios centralizados
- **Type safety**: Prevención de errores tipográficos

#### Escalabilidad
- **Preparado para i18n**: Estructura lista para múltiples idiomas
- **Reutilización**: Constantes compartidas entre componentes
- **Extensibilidad**: Fácil agregar nuevos idiomas

#### Desarrollo
- **IntelliSense**: Autocompletado de constantes
- **Refactoring**: Cambios seguros con TypeScript
- **Testing**: Fácil mockear textos para tests

### Estructura de Constantes

#### PLATE_BUILDER
```typescript
TOASTS: {
  EMPTY_PLATE: { title, description }
  DAY_COMPLETE: { title, description }
  CALORIE_EXCESS: { title, description }
  EXTRAS_DETECTED: { title, description }
  MISSING_GROUPS: { title, description }
  SAVE_ERROR: { title, description }
}
LABELS: {
  INGREDIENT_LIBRARY, SEARCH_PLACEHOLDER, PLATE_BUILDER,
  DAILY_GOAL, CARBOHYDRATES, PROTEIN, FAT, VEGETABLES_FRUITS,
  EXTRAS_TREATS, SAVE_DAY, SAVING, INCLUDED, MISSING
}
```

#### SUMMARY
```typescript
TOASTS: {
  PERFECT_WEEK: { title, description: "You've earned {amount} XP..." }
  LEGENDARY_MONTH: { title, description: "You've earned {amount} XP..." }
}
LABELS: {
  WEEKLY_SUMMARY, MONTHLY_SUMMARY, PERFECT_WEEK, INCOMPLETE_WEEK,
  LEGENDARY_MONTH, INCOMPLETE_MONTH, CALORIES, SUCCESSFUL_DAYS,
  SUCCESSFUL_WEEKS, SUCCESS_CRITERIA, WEEKLY_BREAKDOWN,
  ALL_DAYS_SUCCESSFUL, CALORIES_WITHIN_WEEKLY_GOAL,
  ALL_WEEKS_SUCCESSFUL, CALORIES_WITHIN_MONTHLY_GOAL,
  WEEK_1, LOADING_SUMMARY, RETRY
}
```

#### GAMIFICATION
```typescript
LABELS: {
  CURRENT_STREAK, BEST_STREAK, DAYS, TOTAL_XP, LEVEL,
  PROGRESS_TO_LEVEL, RECENT_ACTIVITY, LOADING, RETRY
}
STREAK: {
  START_STREAK, GOOD_START, KEEP_GOING, EXCELLENT_STREAK,
  LEGENDARY_STREAK, MAINTAIN_STREAK, PROGRESS, LEGENDARY,
  TOWARDS_7_DAYS, TOWARDS_4_DAYS, TOWARDS_2_DAYS
}
XP_ACTIVITY: {
  SUCCESSFUL_DAY: { icon: "📅", label: "Successful Day", color: "text-green-600" }
  STREAK: { icon: "🔥", label: "Streak", color: "text-orange-600" }
  PERFECT_WEEK: { icon: "📊", label: "Perfect Week", color: "text-blue-600" }
  LEGENDARY_MONTH: { icon: "👑", label: "Legendary Month", color: "text-purple-600" }
  DEFAULT: { icon: "⭐", label: "Achievement", color: "text-gray-600" }
}
DATE_FORMATS: {
  YESTERDAY: "Yesterday"
  DAYS_AGO: "days ago"
  DATE_FORMAT: "MMM dd"
}
```

#### COMMON
```typescript
ERRORS: {
  UNKNOWN_ERROR, FETCH_ERROR, NETWORK_ERROR, VALIDATION_ERROR
}
LOADING: {
  LOADING, SAVING, PROCESSING
}
ACTIONS: {
  RETRY, SAVE, CANCEL, CLOSE, REFRESH
}
```

### Integración con Componentes

#### Importación
```typescript
import { PLATE_BUILDER, SUMMARY, GAMIFICATION, formatMessage } from '@/lib/i18n/en';
```

#### Uso de Constantes
```typescript
// Labels simples
<span>{PLATE_BUILDER.LABELS.INGREDIENT_LIBRARY}</span>

// Toasts con interpolación
toast({
  title: SUMMARY.TOASTS.PERFECT_WEEK.title,
  description: formatMessage(SUMMARY.TOASTS.PERFECT_WEEK.description, { amount: xpAmount })
});
```

#### Formato de Fechas
```typescript
// Cambio de español a inglés
date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
```

### Preparación para Futuro i18n

#### Estructura Escalable
- **Archivo base**: `en.ts` como referencia
- **Futuro**: `es.ts`, `fr.ts`, etc.
- **Runtime**: Preparado para librerías como `react-i18next`

#### Beneficios Inmediatos
- **Consistencia**: Textos uniformes en toda la app
- **Mantenimiento**: Cambios centralizados
- **Type safety**: Prevención de errores
- **Developer experience**: Mejor IntelliSense

## Puertas de Calidad (Quality Gates)

### Archivos Creados

#### Configuración de ESLint Estricta (`.eslintrc.json`)

- **Reglas TypeScript estrictas**: 
  - `@typescript-eslint/no-unused-vars`: Error para variables no utilizadas
  - `@typescript-eslint/no-explicit-any`: Warning para uso de `any`
  - `@typescript-eslint/prefer-const`: Error para variables que deberían ser const
  - `@typescript-eslint/no-non-null-assertion`: Warning para assertions no-null
  - `@typescript-eslint/no-empty-function`: Warning para funciones vacías
  - `@typescript-eslint/no-inferrable-types`: Error para tipos inferibles
  - `@typescript-eslint/prefer-nullish-coalescing`: Error para usar `??` en lugar de `||`
  - `@typescript-eslint/prefer-optional-chain`: Error para usar `?.` en lugar de `&&`
  - `@typescript-eslint/no-unnecessary-type-assertion`: Error para type assertions innecesarios
  - `@typescript-eslint/no-floating-promises`: Error para promesas no manejadas
  - `@typescript-eslint/await-thenable`: Error para await en valores no thenable
  - `@typescript-eslint/no-misused-promises`: Error para promesas mal usadas

- **Reglas de Import**:
  - `import/order`: Ordenamiento automático de imports
  - `import/no-unused-modules`: Error para módulos no utilizados
  - `import/no-duplicates`: Error para imports duplicados

- **Reglas de Calidad de Código**:
  - `no-console`: Warning para console.log
  - `no-debugger`: Error para debugger statements
  - `no-alert`: Warning para alert/confirm/prompt
  - `prefer-const`: Error para variables que deberían ser const
  - `no-var`: Error para uso de var
  - `eqeqeq`: Error para usar === en lugar de ==
  - `curly`: Error para llaves obligatorias en if/for/while
  - `no-eval`: Error para eval()
  - `no-implied-eval`: Error para eval implícito
  - `no-new-func`: Error para new Function()
  - `no-script-url`: Error para javascript: URLs
  - `no-sequences`: Error para comma operator
  - `no-throw-literal`: Error para throw de literales
  - `no-unmodified-loop-condition`: Error para condiciones de loop no modificadas
  - `no-unused-expressions`: Error para expresiones no utilizadas
  - `no-useless-call`: Error para .call() innecesario
  - `no-useless-concat`: Error para concatenación innecesaria
  - `no-useless-return`: Error para return innecesario
  - `prefer-arrow-callback`: Error para usar arrow functions
  - `prefer-template`: Error para usar template literals
  - `yoda`: Error para condiciones yoda

- **Reglas de React**:
  - `react/jsx-no-useless-fragment`: Error para fragments innecesarios
  - `react/jsx-key`: Error para elementos sin key
  - `react/jsx-no-duplicate-props`: Error para props duplicados
  - `react/jsx-no-undef`: Error para componentes no definidos
  - `react/no-array-index-key`: Warning para usar index como key
  - `react/no-children-prop`: Error para children como prop
  - `react/no-danger-with-children`: Error para dangerouslySetInnerHTML con children
  - `react/no-deprecated`: Error para APIs deprecadas
  - `react/no-direct-mutation-state`: Error para mutación directa de state
  - `react/no-find-dom-node`: Error para findDOMNode
  - `react/no-is-mounted`: Error para isMounted
  - `react/no-render-return-value`: Error para return value de render
  - `react/no-string-refs`: Error para string refs
  - `react/no-unescaped-entities`: Error para entidades no escapadas
  - `react/no-unknown-property`: Error para props desconocidos
  - `react/no-unsafe`: Error para métodos unsafe
  - `react/require-render-return`: Error para render sin return
  - `react/self-closing-comp`: Error para componentes auto-cerrados

- **Reglas de Next.js**:
  - `@next/next/no-img-element`: Error para usar `<img>` en lugar de `<Image>`
  - `@next/next/no-html-link-for-pages`: Error para links HTML en lugar de Link
  - `@next/next/no-sync-scripts`: Error para scripts síncronos
  - `@next/next/no-title-in-document-head`: Error para title en document head
  - `@next/next/no-unwanted-polyfillio`: Error para polyfills no deseados
  - `@next/next/no-css-tags`: Error para CSS tags
  - `@next/next/no-document-import-in-page`: Error para importar document en pages
  - `@next/next/no-head-import-in-document`: Error para importar head en document
  - `@next/next/no-page-custom-font`: Error para fuentes personalizadas en pages
  - `@next/next/no-styled-jsx-in-document`: Error para styled-jsx en document
  - `@next/next/no-typos`: Error para typos en Next.js

- **Overrides para Tests**:
  - Desactiva `@typescript-eslint/no-explicit-any` en archivos de test
  - Desactiva `no-console` en archivos de test

#### Tests Unitarios Extendidos (`__tests__/lib/nutri/validation.test.ts`)

- **Edge Cases Agregados**:
  - **Valores negativos**: Target de calorías negativo
  - **Valores muy grandes**: Calorías de millones
  - **Valores decimales**: Calorías con decimales
  - **Múltiples items del mismo grupo**: Varios carbohidratos, etc.
  - **Solo treats**: Array con solo elementos treat
  - **Mezcla de treats y grupos válidos**: Combinación de ambos
  - **Valores límite**: Exactamente en el límite y justo por encima
  - **Cantidades muy pequeñas**: 1 gramo de ingredientes
  - **Cantidades muy grandes**: 10kg de ingredientes

- **Cobertura de Casos**:
  - **Boundary testing**: Valores exactos en límites
  - **Edge case testing**: Valores extremos
  - **Data type testing**: Diferentes tipos de datos
  - **Business logic testing**: Lógica de negocio específica

#### Tests Unitarios para Streak Updates (`__tests__/lib/streak-updates.test.ts`)

- **Mock Database Class**:
  - **MockStreak interface**: Estructura de datos de racha
  - **MockDayEntry interface**: Estructura de entrada diaria
  - **MockDatabase class**: Simulación de base de datos
    - `getStreak()`: Obtener racha actual
    - `upsertStreak()`: Crear/actualizar racha
    - `getDayEntry()`: Obtener entrada del día
    - `getYesterdayEntry()`: Obtener entrada de ayer
    - `addDayEntry()`: Agregar entrada diaria
    - `clear()`: Limpiar datos de test
    - `getStreakData()`: Obtener datos de racha para verificación

- **StreakManager Class**:
  - **updateStreak()**: Lógica principal de actualización de racha
  - **Lógica de negocio**: 
    - Incrementar racha si ayer fue exitoso
    - Reiniciar racha si ayer no fue exitoso
    - Actualizar mejor racha cuando se supera
    - Mantener mejor racha en fallos

- **Test Cases**:
  - **Casos exitosos**:
    - Primer día exitoso (racha = 1)
    - Incrementar racha cuando ayer fue exitoso
    - Actualizar mejor racha cuando se supera
    - Iniciar nueva racha cuando ayer no fue exitoso
    - Iniciar nueva racha cuando no hay entrada de ayer

  - **Casos de fallo**:
    - Reiniciar racha a 0 en fallo
    - Mantener mejor racha en fallo
    - Manejar fallo sin racha existente

  - **Edge cases**:
    - Múltiples días consecutivos exitosos
    - Interrupción y reinicio de racha
    - Rachas muy largas (100+ días)
    - Condiciones de límite de fecha (cambio de mes)
    - Actualizaciones concurrentes de racha

### Características Técnicas

#### ESLint Configuration
- **Extends**: next/core-web-vitals, next/typescript
- **Rules**: 50+ reglas estrictas para TypeScript, React, Next.js
- **Overrides**: Configuración específica para archivos de test
- **Import ordering**: Ordenamiento automático y alfabético
- **Code quality**: Prevención de anti-patterns comunes

#### Test Coverage
- **evaluateDay**: 15+ test cases cubriendo edge cases
- **Streak Updates**: 20+ test cases con mock database
- **Mock Database**: Simulación completa de operaciones DB
- **Business Logic**: Cobertura completa de lógica de negocio

#### Quality Gates
- **TypeScript strict**: Prevención de errores de tipo
- **Import management**: Imports organizados y sin duplicados
- **Code patterns**: Uso de mejores prácticas
- **React best practices**: Patrones recomendados de React
- **Next.js compliance**: Cumplimiento de convenciones Next.js

### Beneficios de las Quality Gates

#### Desarrollo
- **Prevención de errores**: Detección temprana de problemas
- **Consistencia**: Código uniforme en todo el proyecto
- **Mejores prácticas**: Enfoque en patrones recomendados
- **Mantenibilidad**: Código más fácil de mantener

#### Testing
- **Cobertura completa**: Edge cases y casos límite
- **Mock database**: Tests aislados y rápidos
- **Business logic**: Validación de lógica de negocio
- **Regression prevention**: Prevención de regresiones

#### CI/CD
- **Automated checks**: Verificaciones automáticas
- **Quality gates**: Bloqueo de código de baja calidad
- **Consistent standards**: Estándares consistentes
- **Developer feedback**: Feedback inmediato a desarrolladores

### Integración con Workflow

#### Pre-commit Hooks
- **ESLint**: Verificación automática antes de commit
- **Type checking**: Verificación de tipos TypeScript
- **Test running**: Ejecución de tests relevantes

#### CI Pipeline
- **Lint checks**: Verificación de ESLint en CI
- **Test execution**: Ejecución de todos los tests
- **Quality gates**: Bloqueo de merge si fallan checks
- **Coverage reports**: Reportes de cobertura de tests

#### Development Workflow
- **IDE integration**: ESLint integrado en IDE
- **Real-time feedback**: Feedback en tiempo real
- **Auto-fixing**: Corrección automática de problemas
- **Import organization**: Organización automática de imports

## Widgets de Gamificación (Streak y XP)

### Archivos Creados

#### Endpoint de Gamificación (`/app/api/gamification/`)

- **route.ts**: Endpoint GET para datos de gamificación
  - **Respuesta**: streak (current, best), totalXp, lastReasons[]
  - **Agregación**: Suma de XP del ledger, últimos 5 motivos
  - **Mock data**: Datos de prueba para desarrollo

## Centralización de Strings de Internacionalización (i18n)

### Archivos Creados

#### Archivo de Constantes de Internacionalización (`/lib/i18n/`)

- **en.ts**: Constantes centralizadas para todos los textos en inglés
  - **PLATE_BUILDER**: Toasts y labels del constructor de platos
  - **CALENDAR**: Labels del calendario
  - **SUMMARY**: Toasts y labels de resúmenes semanales/mensuales
  - **GAMIFICATION**: Labels y mensajes de gamificación
  - **COMMON**: Mensajes comunes (errores, loading, acciones)
  - **formatMessage**: Función helper para interpolación de variables
  - **TypeScript**: Constantes tipadas con `as const` para type safety

### Archivos Actualizados

#### Componentes Actualizados para usar i18n

- **PlateBuilder.tsx**: 
  - **Toasts**: Todos los mensajes de toast ahora usan constantes
  - **Labels**: Biblioteca de ingredientes, constructor de platos, grupos nutricionales
  - **Placeholders**: Texto de búsqueda y botones
  - **Tooltips**: Mensajes de estado (incluido/faltante)

- **WeeklySummaryCard.tsx**:
  - **Toasts**: Mensajes de semana perfecta con interpolación
  - **Labels**: Títulos, criterios de éxito, estados de carga
  - **Fechas**: Formato de fechas en inglés
  - **Mensajes de error**: Textos estandarizados

- **MonthlySummaryCard.tsx**:
  - **Toasts**: Mensajes de mes legendario con interpolación
  - **Labels**: Títulos, criterios de éxito, desglose semanal
  - **Fechas**: Formato de fechas en inglés
  - **Mensajes de error**: Textos estandarizados

- **StreakWidget.tsx**:
  - **Labels**: Racha actual, mejor racha, progreso
  - **Mensajes motivacionales**: Según nivel de racha
  - **Estados de carga**: Loading y retry
  - **Mensajes de error**: Textos estandarizados

- **XpPanel.tsx**:
  - **Labels**: Nivel, progreso, actividad reciente
  - **Tipos de actividad**: Iconos y colores por tipo de logro
  - **Formato de fechas**: Relativo (ayer, hace X días)
  - **Estados de carga**: Loading y retry

### Características Técnicas

#### Organización de Constantes
- **Estructura jerárquica**: Agrupadas por funcionalidad
- **TypeScript**: Constantes tipadas con `as const`
- **Interpolación**: Función `formatMessage` para variables
- **Consistencia**: Nomenclatura uniforme en inglés

#### Categorías de Textos
- **TOASTS**: Mensajes de notificaciones
- **LABELS**: Etiquetas de UI
- **ERRORS**: Mensajes de error
- **LOADING**: Estados de carga
- **ACTIONS**: Acciones de usuario

#### Funcionalidades de Interpolación
- **formatMessage**: Reemplaza `{variable}` con valores
- **Type safety**: Parámetros tipados
- **Flexibilidad**: Soporte para strings y números

### Beneficios de la Centralización

#### Mantenimiento
- **Un solo lugar**: Todos los textos en un archivo
- **Consistencia**: Nomenclatura uniforme
- **Fácil actualización**: Cambios centralizados
- **Type safety**: Prevención de errores tipográficos

#### Escalabilidad
- **Preparado para i18n**: Estructura lista para múltiples idiomas
- **Reutilización**: Constantes compartidas entre componentes
- **Extensibilidad**: Fácil agregar nuevos idiomas

#### Desarrollo
- **IntelliSense**: Autocompletado de constantes
- **Refactoring**: Cambios seguros con TypeScript
- **Testing**: Fácil mockear textos para tests

### Estructura de Constantes

#### PLATE_BUILDER
```typescript
TOASTS: {
  EMPTY_PLATE: { title, description }
  DAY_COMPLETE: { title, description }
  CALORIE_EXCESS: { title, description }
  EXTRAS_DETECTED: { title, description }
  MISSING_GROUPS: { title, description }
  SAVE_ERROR: { title, description }
}
LABELS: {
  INGREDIENT_LIBRARY, SEARCH_PLACEHOLDER, PLATE_BUILDER,
  DAILY_GOAL, CARBOHYDRATES, PROTEIN, FAT, VEGETABLES_FRUITS,
  EXTRAS_TREATS, SAVE_DAY, SAVING, INCLUDED, MISSING
}
```

#### SUMMARY
```typescript
TOASTS: {
  PERFECT_WEEK: { title, description: "You've earned {amount} XP..." }
  LEGENDARY_MONTH: { title, description: "You've earned {amount} XP..." }
}
LABELS: {
  WEEKLY_SUMMARY, MONTHLY_SUMMARY, PERFECT_WEEK, INCOMPLETE_WEEK,
  LEGENDARY_MONTH, INCOMPLETE_MONTH, CALORIES, SUCCESSFUL_DAYS,
  SUCCESSFUL_WEEKS, SUCCESS_CRITERIA, WEEKLY_BREAKDOWN,
  ALL_DAYS_SUCCESSFUL, CALORIES_WITHIN_WEEKLY_GOAL,
  ALL_WEEKS_SUCCESSFUL, CALORIES_WITHIN_MONTHLY_GOAL,
  WEEK_1, LOADING_SUMMARY, RETRY
}
```

#### GAMIFICATION
```typescript
LABELS: {
  CURRENT_STREAK, BEST_STREAK, DAYS, TOTAL_XP, LEVEL,
  PROGRESS_TO_LEVEL, RECENT_ACTIVITY, LOADING, RETRY
}
STREAK: {
  START_STREAK, GOOD_START, KEEP_GOING, EXCELLENT_STREAK,
  LEGENDARY_STREAK, MAINTAIN_STREAK, PROGRESS, LEGENDARY,
  TOWARDS_7_DAYS, TOWARDS_4_DAYS, TOWARDS_2_DAYS
}
XP_ACTIVITY: {
  SUCCESSFUL_DAY: { icon: "📅", label: "Successful Day", color: "text-green-600" }
  STREAK: { icon: "🔥", label: "Streak", color: "text-orange-600" }
  PERFECT_WEEK: { icon: "📊", label: "Perfect Week", color: "text-blue-600" }
  LEGENDARY_MONTH: { icon: "👑", label: "Legendary Month", color: "text-purple-600" }
  DEFAULT: { icon: "⭐", label: "Achievement", color: "text-gray-600" }
}
DATE_FORMATS: {
  YESTERDAY: "Yesterday"
  DAYS_AGO: "days ago"
  DATE_FORMAT: "MMM dd"
}
```

#### COMMON
```typescript
ERRORS: {
  UNKNOWN_ERROR, FETCH_ERROR, NETWORK_ERROR, VALIDATION_ERROR
}
LOADING: {
  LOADING, SAVING, PROCESSING
}
ACTIONS: {
  RETRY, SAVE, CANCEL, CLOSE, REFRESH
}
```

### Integración con Componentes

#### Importación
```typescript
import { PLATE_BUILDER, SUMMARY, GAMIFICATION, formatMessage } from '@/lib/i18n/en';
```

#### Uso de Constantes
```typescript
// Labels simples
<span>{PLATE_BUILDER.LABELS.INGREDIENT_LIBRARY}</span>

// Toasts con interpolación
toast({
  title: SUMMARY.TOASTS.PERFECT_WEEK.title,
  description: formatMessage(SUMMARY.TOASTS.PERFECT_WEEK.description, { amount: xpAmount })
});
```

#### Formato de Fechas
```typescript
// Cambio de español a inglés
date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
```

### Preparación para Futuro i18n

#### Estructura Escalable
- **Archivo base**: `en.ts` como referencia
- **Futuro**: `es.ts`, `fr.ts`, etc.
- **Runtime**: Preparado para librerías como `react-i18next`

#### Beneficios Inmediatos
- **Consistencia**: Textos uniformes en toda la app
- **Mantenimiento**: Cambios centralizados
- **Type safety**: Prevención de errores
- **Developer experience**: Mejor IntelliSense

## Puertas de Calidad (Quality Gates)

### Archivos Creados

#### Configuración de ESLint Estricta (`.eslintrc.json`)

- **Reglas TypeScript estrictas**: 
  - `@typescript-eslint/no-unused-vars`: Error para variables no utilizadas
  - `@typescript-eslint/no-explicit-any`: Warning para uso de `any`
  - `@typescript-eslint/prefer-const`: Error para variables que deberían ser const
  - `@typescript-eslint/no-non-null-assertion`: Warning para assertions no-null
  - `@typescript-eslint/no-empty-function`: Warning para funciones vacías
  - `@typescript-eslint/no-inferrable-types`: Error para tipos inferibles
  - `@typescript-eslint/prefer-nullish-coalescing`: Error para usar `??` en lugar de `||`
  - `@typescript-eslint/prefer-optional-chain`: Error para usar `?.` en lugar de `&&`
  - `@typescript-eslint/no-unnecessary-type-assertion`: Error para type assertions innecesarios
  - `@typescript-eslint/no-floating-promises`: Error para promesas no manejadas
  - `@typescript-eslint/await-thenable`: Error para await en valores no thenable
  - `@typescript-eslint/no-misused-promises`: Error para promesas mal usadas

- **Reglas de Import**:
  - `import/order`: Ordenamiento automático de imports
  - `import/no-unused-modules`: Error para módulos no utilizados
  - `import/no-duplicates`: Error para imports duplicados

- **Reglas de Calidad de Código**:
  - `no-console`: Warning para console.log
  - `no-debugger`: Error para debugger statements
  - `no-alert`: Warning para alert/confirm/prompt
  - `prefer-const`: Error para variables que deberían ser const
  - `no-var`: Error para uso de var
  - `eqeqeq`: Error para usar === en lugar de ==
  - `curly`: Error para llaves obligatorias en if/for/while
  - `no-eval`: Error para eval()
  - `no-implied-eval`: Error para eval implícito
  - `no-new-func`: Error para new Function()
  - `no-script-url`: Error para javascript: URLs
  - `no-sequences`: Error para comma operator
  - `no-throw-literal`: Error para throw de literales
  - `no-unmodified-loop-condition`: Error para condiciones de loop no modificadas
  - `no-unused-expressions`: Error para expresiones no utilizadas
  - `no-useless-call`: Error para .call() innecesario
  - `no-useless-concat`: Error para concatenación innecesaria
  - `no-useless-return`: Error para return innecesario
  - `prefer-arrow-callback`: Error para usar arrow functions
  - `prefer-template`: Error para usar template literals
  - `yoda`: Error para condiciones yoda

- **Reglas de React**:
  - `react/jsx-no-useless-fragment`: Error para fragments innecesarios
  - `react/jsx-key`: Error para elementos sin key
  - `react/jsx-no-duplicate-props`: Error para props duplicados
  - `react/jsx-no-undef`: Error para componentes no definidos
  - `react/no-array-index-key`: Warning para usar index como key
  - `react/no-children-prop`: Error para children como prop
  - `react/no-danger-with-children`: Error para dangerouslySetInnerHTML con children
  - `react/no-deprecated`: Error para APIs deprecadas
  - `react/no-direct-mutation-state`: Error para mutación directa de state
  - `react/no-find-dom-node`: Error para findDOMNode
  - `react/no-is-mounted`: Error para isMounted
  - `react/no-render-return-value`: Error para return value de render
  - `react/no-string-refs`: Error para string refs
  - `react/no-unescaped-entities`: Error para entidades no escapadas
  - `react/no-unknown-property`: Error para props desconocidos
  - `react/no-unsafe`: Error para métodos unsafe
  - `react/require-render-return`: Error para render sin return
  - `react/self-closing-comp`: Error para componentes auto-cerrados

- **Reglas de Next.js**:
  - `@next/next/no-img-element`: Error para usar `<img>` en lugar de `<Image>`
  - `@next/next/no-html-link-for-pages`: Error para links HTML en lugar de Link
  - `@next/next/no-sync-scripts`: Error para scripts síncronos
  - `@next/next/no-title-in-document-head`: Error para title en document head
  - `@next/next/no-unwanted-polyfillio`: Error para polyfills no deseados
  - `@next/next/no-css-tags`: Error para CSS tags
  - `@next/next/no-document-import-in-page`: Error para importar document en pages
  - `@next/next/no-head-import-in-document`: Error para importar head en document
  - `@next/next/no-page-custom-font`: Error para fuentes personalizadas en pages
  - `@next/next/no-styled-jsx-in-document`: Error para styled-jsx en document
  - `@next/next/no-typos`: Error para typos en Next.js

- **Overrides para Tests**:
  - Desactiva `@typescript-eslint/no-explicit-any` en archivos de test
  - Desactiva `no-console` en archivos de test

#### Tests Unitarios Extendidos (`__tests__/lib/nutri/validation.test.ts`)

- **Edge Cases Agregados**:
  - **Valores negativos**: Target de calorías negativo
  - **Valores muy grandes**: Calorías de millones
  - **Valores decimales**: Calorías con decimales
  - **Múltiples items del mismo grupo**: Varios carbohidratos, etc.
  - **Solo treats**: Array con solo elementos treat
  - **Mezcla de treats y grupos válidos**: Combinación de ambos
  - **Valores límite**: Exactamente en el límite y justo por encima
  - **Cantidades muy pequeñas**: 1 gramo de ingredientes
  - **Cantidades muy grandes**: 10kg de ingredientes

- **Cobertura de Casos**:
  - **Boundary testing**: Valores exactos en límites
  - **Edge case testing**: Valores extremos
  - **Data type testing**: Diferentes tipos de datos
  - **Business logic testing**: Lógica de negocio específica

#### Tests Unitarios para Streak Updates (`__tests__/lib/streak-updates.test.ts`)

- **Mock Database Class**:
  - **MockStreak interface**: Estructura de datos de racha
  - **MockDayEntry interface**: Estructura de entrada diaria
  - **MockDatabase class**: Simulación de base de datos
    - `getStreak()`: Obtener racha actual
    - `upsertStreak()`: Crear/actualizar racha
    - `getDayEntry()`: Obtener entrada del día
    - `getYesterdayEntry()`: Obtener entrada de ayer
    - `addDayEntry()`: Agregar entrada diaria
    - `clear()`: Limpiar datos de test
    - `getStreakData()`: Obtener datos de racha para verificación

- **StreakManager Class**:
  - **updateStreak()**: Lógica principal de actualización de racha
  - **Lógica de negocio**: 
    - Incrementar racha si ayer fue exitoso
    - Reiniciar racha si ayer no fue exitoso
    - Actualizar mejor racha cuando se supera
    - Mantener mejor racha en fallos

- **Test Cases**:
  - **Casos exitosos**:
    - Primer día exitoso (racha = 1)
    - Incrementar racha cuando ayer fue exitoso
    - Actualizar mejor racha cuando se supera
    - Iniciar nueva racha cuando ayer no fue exitoso
    - Iniciar nueva racha cuando no hay entrada de ayer

  - **Casos de fallo**:
    - Reiniciar racha a 0 en fallo
    - Mantener mejor racha en fallo
    - Manejar fallo sin racha existente

  - **Edge cases**:
    - Múltiples días consecutivos exitosos
    - Interrupción y reinicio de racha
    - Rachas muy largas (100+ días)
    - Condiciones de límite de fecha (cambio de mes)
    - Actualizaciones concurrentes de racha

### Características Técnicas

#### ESLint Configuration
- **Extends**: next/core-web-vitals, next/typescript
- **Rules**: 50+ reglas estrictas para TypeScript, React, Next.js
- **Overrides**: Configuración específica para archivos de test
- **Import ordering**: Ordenamiento automático y alfabético
- **Code quality**: Prevención de anti-patterns comunes

#### Test Coverage
- **evaluateDay**: 15+ test cases cubriendo edge cases
- **Streak Updates**: 20+ test cases con mock database
- **Mock Database**: Simulación completa de operaciones DB
- **Business Logic**: Cobertura completa de lógica de negocio

#### Quality Gates
- **TypeScript strict**: Prevención de errores de tipo
- **Import management**: Imports organizados y sin duplicados
- **Code patterns**: Uso de mejores prácticas
- **React best practices**: Patrones recomendados de React
- **Next.js compliance**: Cumplimiento de convenciones Next.js

### Beneficios de las Quality Gates

#### Desarrollo
- **Prevención de errores**: Detección temprana de problemas
- **Consistencia**: Código uniforme en todo el proyecto
- **Mejores prácticas**: Enfoque en patrones recomendados
- **Mantenibilidad**: Código más fácil de mantener

#### Testing
- **Cobertura completa**: Edge cases y casos límite
- **Mock database**: Tests aislados y rápidos
- **Business logic**: Validación de lógica de negocio
- **Regression prevention**: Prevención de regresiones

#### CI/CD
- **Automated checks**: Verificaciones automáticas
- **Quality gates**: Bloqueo de código de baja calidad
- **Consistent standards**: Estándares consistentes
- **Developer feedback**: Feedback inmediato a desarrolladores

### Integración con Workflow

#### Pre-commit Hooks
- **ESLint**: Verificación automática antes de commit
- **Type checking**: Verificación de tipos TypeScript
- **Test running**: Ejecución de tests relevantes

#### CI Pipeline
- **Lint checks**: Verificación de ESLint en CI
- **Test execution**: Ejecución de todos los tests
- **Quality gates**: Bloqueo de merge si fallan checks
- **Coverage reports**: Reportes de cobertura de tests

#### Development Workflow
- **IDE integration**: ESLint integrado en IDE
- **Real-time feedback**: Feedback en tiempo real
- **Auto-fixing**: Corrección automática de problemas
- **Import organization**: Organización automática de imports
  - **TODO**: Integración con Supabase para datos reales

#### Componentes de Gamificación (`/components/gamification/`)

- **StreakWidget.tsx**: Widget de racha actual y mejor racha
  - **Estado reactivo**: loading, error, data con useState
  - **Fetch automático**: useEffect para cargar datos al montar
  - **Visualización**: Badges, iconos de llama y trofeo
  - **Colores dinámicos**: Basados en duración de racha
  - **Mensajes motivacionales**: Según nivel de racha
  - **Barra de progreso**: Hacia siguiente hito (2, 4, 7 días)
  - **Refresh manual**: Botón para recargar datos
  - **Responsive**: Diseño compacto para header

- **XpPanel.tsx**: Panel de experiencia y nivel
  - **Estado reactivo**: loading, error, data con useState
  - **Fetch automático**: useEffect para cargar datos al montar
  - **Sistema de niveles**: Cálculo automático basado en XP total
  - **Barra de progreso**: Hacia siguiente nivel
  - **Actividad reciente**: Últimos 5 motivos de XP ganado
  - **Iconos contextuales**: Emojis y colores por tipo de logro
  - **Formato de fechas**: Relativo (ayer, hace X días)
  - **Refresh manual**: Botón para recargar datos
  - **Responsive**: Diseño compacto para header

### Características Técnicas

- **Validación de entrada**: Sin parámetros requeridos
- **Manejo de errores**: Try-catch con mensajes específicos
- **Estado de carga**: Loading states con spinners
- **Cálculos en tiempo real**: Niveles y progreso automáticos
- **Mock data**: Datos de prueba para desarrollo

## Centralización de Strings de Internacionalización (i18n)

### Archivos Creados

#### Archivo de Constantes de Internacionalización (`/lib/i18n/`)

- **en.ts**: Constantes centralizadas para todos los textos en inglés
  - **PLATE_BUILDER**: Toasts y labels del constructor de platos
  - **CALENDAR**: Labels del calendario
  - **SUMMARY**: Toasts y labels de resúmenes semanales/mensuales
  - **GAMIFICATION**: Labels y mensajes de gamificación
  - **COMMON**: Mensajes comunes (errores, loading, acciones)
  - **formatMessage**: Función helper para interpolación de variables
  - **TypeScript**: Constantes tipadas con `as const` para type safety

### Archivos Actualizados

#### Componentes Actualizados para usar i18n

- **PlateBuilder.tsx**: 
  - **Toasts**: Todos los mensajes de toast ahora usan constantes
  - **Labels**: Biblioteca de ingredientes, constructor de platos, grupos nutricionales
  - **Placeholders**: Texto de búsqueda y botones
  - **Tooltips**: Mensajes de estado (incluido/faltante)

- **WeeklySummaryCard.tsx**:
  - **Toasts**: Mensajes de semana perfecta con interpolación
  - **Labels**: Títulos, criterios de éxito, estados de carga
  - **Fechas**: Formato de fechas en inglés
  - **Mensajes de error**: Textos estandarizados

- **MonthlySummaryCard.tsx**:
  - **Toasts**: Mensajes de mes legendario con interpolación
  - **Labels**: Títulos, criterios de éxito, desglose semanal
  - **Fechas**: Formato de fechas en inglés
  - **Mensajes de error**: Textos estandarizados

- **StreakWidget.tsx**:
  - **Labels**: Racha actual, mejor racha, progreso
  - **Mensajes motivacionales**: Según nivel de racha
  - **Estados de carga**: Loading y retry
  - **Mensajes de error**: Textos estandarizados

- **XpPanel.tsx**:
  - **Labels**: Nivel, progreso, actividad reciente
  - **Tipos de actividad**: Iconos y colores por tipo de logro
  - **Formato de fechas**: Relativo (ayer, hace X días)
  - **Estados de carga**: Loading y retry

### Características Técnicas

#### Organización de Constantes
- **Estructura jerárquica**: Agrupadas por funcionalidad
- **TypeScript**: Constantes tipadas con `as const`
- **Interpolación**: Función `formatMessage` para variables
- **Consistencia**: Nomenclatura uniforme en inglés

#### Categorías de Textos
- **TOASTS**: Mensajes de notificaciones
- **LABELS**: Etiquetas de UI
- **ERRORS**: Mensajes de error
- **LOADING**: Estados de carga
- **ACTIONS**: Acciones de usuario

#### Funcionalidades de Interpolación
- **formatMessage**: Reemplaza `{variable}` con valores
- **Type safety**: Parámetros tipados
- **Flexibilidad**: Soporte para strings y números

### Beneficios de la Centralización

#### Mantenimiento
- **Un solo lugar**: Todos los textos en un archivo
- **Consistencia**: Nomenclatura uniforme
- **Fácil actualización**: Cambios centralizados
- **Type safety**: Prevención de errores tipográficos

#### Escalabilidad
- **Preparado para i18n**: Estructura lista para múltiples idiomas
- **Reutilización**: Constantes compartidas entre componentes
- **Extensibilidad**: Fácil agregar nuevos idiomas

#### Desarrollo
- **IntelliSense**: Autocompletado de constantes
- **Refactoring**: Cambios seguros con TypeScript
- **Testing**: Fácil mockear textos para tests

### Estructura de Constantes

#### PLATE_BUILDER
```typescript
TOASTS: {
  EMPTY_PLATE: { title, description }
  DAY_COMPLETE: { title, description }
  CALORIE_EXCESS: { title, description }
  EXTRAS_DETECTED: { title, description }
  MISSING_GROUPS: { title, description }
  SAVE_ERROR: { title, description }
}
LABELS: {
  INGREDIENT_LIBRARY, SEARCH_PLACEHOLDER, PLATE_BUILDER,
  DAILY_GOAL, CARBOHYDRATES, PROTEIN, FAT, VEGETABLES_FRUITS,
  EXTRAS_TREATS, SAVE_DAY, SAVING, INCLUDED, MISSING
}
```

#### SUMMARY
```typescript
TOASTS: {
  PERFECT_WEEK: { title, description: "You've earned {amount} XP..." }
  LEGENDARY_MONTH: { title, description: "You've earned {amount} XP..." }
}
LABELS: {
  WEEKLY_SUMMARY, MONTHLY_SUMMARY, PERFECT_WEEK, INCOMPLETE_WEEK,
  LEGENDARY_MONTH, INCOMPLETE_MONTH, CALORIES, SUCCESSFUL_DAYS,
  SUCCESSFUL_WEEKS, SUCCESS_CRITERIA, WEEKLY_BREAKDOWN,
  ALL_DAYS_SUCCESSFUL, CALORIES_WITHIN_WEEKLY_GOAL,
  ALL_WEEKS_SUCCESSFUL, CALORIES_WITHIN_MONTHLY_GOAL,
  WEEK_1, LOADING_SUMMARY, RETRY
}
```

#### GAMIFICATION
```typescript
LABELS: {
  CURRENT_STREAK, BEST_STREAK, DAYS, TOTAL_XP, LEVEL,
  PROGRESS_TO_LEVEL, RECENT_ACTIVITY, LOADING, RETRY
}
STREAK: {
  START_STREAK, GOOD_START, KEEP_GOING, EXCELLENT_STREAK,
  LEGENDARY_STREAK, MAINTAIN_STREAK, PROGRESS, LEGENDARY,
  TOWARDS_7_DAYS, TOWARDS_4_DAYS, TOWARDS_2_DAYS
}
XP_ACTIVITY: {
  SUCCESSFUL_DAY: { icon: "📅", label: "Successful Day", color: "text-green-600" }
  STREAK: { icon: "🔥", label: "Streak", color: "text-orange-600" }
  PERFECT_WEEK: { icon: "📊", label: "Perfect Week", color: "text-blue-600" }
  LEGENDARY_MONTH: { icon: "👑", label: "Legendary Month", color: "text-purple-600" }
  DEFAULT: { icon: "⭐", label: "Achievement", color: "text-gray-600" }
}
DATE_FORMATS: {
  YESTERDAY: "Yesterday"
  DAYS_AGO: "days ago"
  DATE_FORMAT: "MMM dd"
}
```

#### COMMON
```typescript
ERRORS: {
  UNKNOWN_ERROR, FETCH_ERROR, NETWORK_ERROR, VALIDATION_ERROR
}
LOADING: {
  LOADING, SAVING, PROCESSING
}
ACTIONS: {
  RETRY, SAVE, CANCEL, CLOSE, REFRESH
}
```

### Integración con Componentes

#### Importación
```typescript
import { PLATE_BUILDER, SUMMARY, GAMIFICATION, formatMessage } from '@/lib/i18n/en';
```

#### Uso de Constantes
```typescript
// Labels simples
<span>{PLATE_BUILDER.LABELS.INGREDIENT_LIBRARY}</span>

// Toasts con interpolación
toast({
  title: SUMMARY.TOASTS.PERFECT_WEEK.title,
  description: formatMessage(SUMMARY.TOASTS.PERFECT_WEEK.description, { amount: xpAmount })
});
```

#### Formato de Fechas
```typescript
// Cambio de español a inglés
date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
```

### Preparación para Futuro i18n

#### Estructura Escalable
- **Archivo base**: `en.ts` como referencia
- **Futuro**: `es.ts`, `fr.ts`, etc.
- **Runtime**: Preparado para librerías como `react-i18next`

#### Beneficios Inmediatos
- **Consistencia**: Textos uniformes en toda la app
- **Mantenimiento**: Cambios centralizados
- **Type safety**: Prevención de errores
- **Developer experience**: Mejor IntelliSense

## Puertas de Calidad (Quality Gates)

### Archivos Creados

#### Configuración de ESLint Estricta (`.eslintrc.json`)

- **Reglas TypeScript estrictas**: 
  - `@typescript-eslint/no-unused-vars`: Error para variables no utilizadas
  - `@typescript-eslint/no-explicit-any`: Warning para uso de `any`
  - `@typescript-eslint/prefer-const`: Error para variables que deberían ser const
  - `@typescript-eslint/no-non-null-assertion`: Warning para assertions no-null
  - `@typescript-eslint/no-empty-function`: Warning para funciones vacías
  - `@typescript-eslint/no-inferrable-types`: Error para tipos inferibles
  - `@typescript-eslint/prefer-nullish-coalescing`: Error para usar `??` en lugar de `||`
  - `@typescript-eslint/prefer-optional-chain`: Error para usar `?.` en lugar de `&&`
  - `@typescript-eslint/no-unnecessary-type-assertion`: Error para type assertions innecesarios
  - `@typescript-eslint/no-floating-promises`: Error para promesas no manejadas
  - `@typescript-eslint/await-thenable`: Error para await en valores no thenable
  - `@typescript-eslint/no-misused-promises`: Error para promesas mal usadas

- **Reglas de Import**:
  - `import/order`: Ordenamiento automático de imports
  - `import/no-unused-modules`: Error para módulos no utilizados
  - `import/no-duplicates`: Error para imports duplicados

- **Reglas de Calidad de Código**:
  - `no-console`: Warning para console.log
  - `no-debugger`: Error para debugger statements
  - `no-alert`: Warning para alert/confirm/prompt
  - `prefer-const`: Error para variables que deberían ser const
  - `no-var`: Error para uso de var
  - `eqeqeq`: Error para usar === en lugar de ==
  - `curly`: Error para llaves obligatorias en if/for/while
  - `no-eval`: Error para eval()
  - `no-implied-eval`: Error para eval implícito
  - `no-new-func`: Error para new Function()
  - `no-script-url`: Error para javascript: URLs
  - `no-sequences`: Error para comma operator
  - `no-throw-literal`: Error para throw de literales
  - `no-unmodified-loop-condition`: Error para condiciones de loop no modificadas
  - `no-unused-expressions`: Error para expresiones no utilizadas
  - `no-useless-call`: Error para .call() innecesario
  - `no-useless-concat`: Error para concatenación innecesaria
  - `no-useless-return`: Error para return innecesario
  - `prefer-arrow-callback`: Error para usar arrow functions
  - `prefer-template`: Error para usar template literals
  - `yoda`: Error para condiciones yoda

- **Reglas de React**:
  - `react/jsx-no-useless-fragment`: Error para fragments innecesarios
  - `react/jsx-key`: Error para elementos sin key
  - `react/jsx-no-duplicate-props`: Error para props duplicados
  - `react/jsx-no-undef`: Error para componentes no definidos
  - `react/no-array-index-key`: Warning para usar index como key
  - `react/no-children-prop`: Error para children como prop
  - `react/no-danger-with-children`: Error para dangerouslySetInnerHTML con children
  - `react/no-deprecated`: Error para APIs deprecadas
  - `react/no-direct-mutation-state`: Error para mutación directa de state
  - `react/no-find-dom-node`: Error para findDOMNode
  - `react/no-is-mounted`: Error para isMounted
  - `react/no-render-return-value`: Error para return value de render
  - `react/no-string-refs`: Error para string refs
  - `react/no-unescaped-entities`: Error para entidades no escapadas
  - `react/no-unknown-property`: Error para props desconocidos
  - `react/no-unsafe`: Error para métodos unsafe
  - `react/require-render-return`: Error para render sin return
  - `react/self-closing-comp`: Error para componentes auto-cerrados

- **Reglas de Next.js**:
  - `@next/next/no-img-element`: Error para usar `<img>` en lugar de `<Image>`
  - `@next/next/no-html-link-for-pages`: Error para links HTML en lugar de Link
  - `@next/next/no-sync-scripts`: Error para scripts síncronos
  - `@next/next/no-title-in-document-head`: Error para title en document head
  - `@next/next/no-unwanted-polyfillio`: Error para polyfills no deseados
  - `@next/next/no-css-tags`: Error para CSS tags
  - `@next/next/no-document-import-in-page`: Error para importar document en pages
  - `@next/next/no-head-import-in-document`: Error para importar head en document
  - `@next/next/no-page-custom-font`: Error para fuentes personalizadas en pages
  - `@next/next/no-styled-jsx-in-document`: Error para styled-jsx en document
  - `@next/next/no-typos`: Error para typos en Next.js

- **Overrides para Tests**:
  - Desactiva `@typescript-eslint/no-explicit-any` en archivos de test
  - Desactiva `no-console` en archivos de test

#### Tests Unitarios Extendidos (`__tests__/lib/nutri/validation.test.ts`)

- **Edge Cases Agregados**:
  - **Valores negativos**: Target de calorías negativo
  - **Valores muy grandes**: Calorías de millones
  - **Valores decimales**: Calorías con decimales
  - **Múltiples items del mismo grupo**: Varios carbohidratos, etc.
  - **Solo treats**: Array con solo elementos treat
  - **Mezcla de treats y grupos válidos**: Combinación de ambos
  - **Valores límite**: Exactamente en el límite y justo por encima
  - **Cantidades muy pequeñas**: 1 gramo de ingredientes
  - **Cantidades muy grandes**: 10kg de ingredientes

- **Cobertura de Casos**:
  - **Boundary testing**: Valores exactos en límites
  - **Edge case testing**: Valores extremos
  - **Data type testing**: Diferentes tipos de datos
  - **Business logic testing**: Lógica de negocio específica

#### Tests Unitarios para Streak Updates (`__tests__/lib/streak-updates.test.ts`)

- **Mock Database Class**:
  - **MockStreak interface**: Estructura de datos de racha
  - **MockDayEntry interface**: Estructura de entrada diaria
  - **MockDatabase class**: Simulación de base de datos
    - `getStreak()`: Obtener racha actual
    - `upsertStreak()`: Crear/actualizar racha
    - `getDayEntry()`: Obtener entrada del día
    - `getYesterdayEntry()`: Obtener entrada de ayer
    - `addDayEntry()`: Agregar entrada diaria
    - `clear()`: Limpiar datos de test
    - `getStreakData()`: Obtener datos de racha para verificación

- **StreakManager Class**:
  - **updateStreak()**: Lógica principal de actualización de racha
  - **Lógica de negocio**: 
    - Incrementar racha si ayer fue exitoso
    - Reiniciar racha si ayer no fue exitoso
    - Actualizar mejor racha cuando se supera
    - Mantener mejor racha en fallos

- **Test Cases**:
  - **Casos exitosos**:
    - Primer día exitoso (racha = 1)
    - Incrementar racha cuando ayer fue exitoso
    - Actualizar mejor racha cuando se supera
    - Iniciar nueva racha cuando ayer no fue exitoso
    - Iniciar nueva racha cuando no hay entrada de ayer

  - **Casos de fallo**:
    - Reiniciar racha a 0 en fallo
    - Mantener mejor racha en fallo
    - Manejar fallo sin racha existente

  - **Edge cases**:
    - Múltiples días consecutivos exitosos
    - Interrupción y reinicio de racha
    - Rachas muy largas (100+ días)
    - Condiciones de límite de fecha (cambio de mes)
    - Actualizaciones concurrentes de racha

### Características Técnicas

#### ESLint Configuration
- **Extends**: next/core-web-vitals, next/typescript
- **Rules**: 50+ reglas estrictas para TypeScript, React, Next.js
- **Overrides**: Configuración específica para archivos de test
- **Import ordering**: Ordenamiento automático y alfabético
- **Code quality**: Prevención de anti-patterns comunes

#### Test Coverage
- **evaluateDay**: 15+ test cases cubriendo edge cases
- **Streak Updates**: 20+ test cases con mock database
- **Mock Database**: Simulación completa de operaciones DB
- **Business Logic**: Cobertura completa de lógica de negocio

#### Quality Gates
- **TypeScript strict**: Prevención de errores de tipo
- **Import management**: Imports organizados y sin duplicados
- **Code patterns**: Uso de mejores prácticas
- **React best practices**: Patrones recomendados de React
- **Next.js compliance**: Cumplimiento de convenciones Next.js

### Beneficios de las Quality Gates

#### Desarrollo
- **Prevención de errores**: Detección temprana de problemas
- **Consistencia**: Código uniforme en todo el proyecto
- **Mejores prácticas**: Enfoque en patrones recomendados
- **Mantenibilidad**: Código más fácil de mantener

#### Testing
- **Cobertura completa**: Edge cases y casos límite
- **Mock database**: Tests aislados y rápidos
- **Business logic**: Validación de lógica de negocio
- **Regression prevention**: Prevención de regresiones

#### CI/CD
- **Automated checks**: Verificaciones automáticas
- **Quality gates**: Bloqueo de código de baja calidad
- **Consistent standards**: Estándares consistentes
- **Developer feedback**: Feedback inmediato a desarrolladores

### Integración con Workflow

#### Pre-commit Hooks
- **ESLint**: Verificación automática antes de commit
- **Type checking**: Verificación de tipos TypeScript
- **Test running**: Ejecución de tests relevantes

#### CI Pipeline
- **Lint checks**: Verificación de ESLint en CI
- **Test execution**: Ejecución de todos los tests
- **Quality gates**: Bloqueo de merge si fallan checks
- **Coverage reports**: Reportes de cobertura de tests

#### Development Workflow
- **IDE integration**: ESLint integrado en IDE
- **Real-time feedback**: Feedback en tiempo real
- **Auto-fixing**: Corrección automática de problemas
- **Import organization**: Organización automática de imports
- **TypeScript**: Interfaces estrictas para todos los datos
- **Responsive design**: Componentes compactos para header

### Funcionalidades del Endpoint

#### Datos de Gamificación
- **Streak**: Racha actual y mejor racha histórica
- **Total XP**: Suma de todos los puntos de experiencia
- **Últimos motivos**: Últimos 5 logros con fecha y cantidad
- **Agregación**: Cálculo automático de métricas
- **Ordenamiento**: Por fecha descendente

### Funcionalidades de los Widgets

#### StreakWidget
- **Racha actual**: Badge con color según duración
- **Mejor racha**: Badge con icono de trofeo
- **Mensajes motivacionales**: Según nivel de racha
- **Barra de progreso**: Hacia siguiente hito
- **Colores dinámicos**: Verde, azul, amarillo, naranja
- **Iconos**: Llama para actual, trofeo para mejor

#### XpPanel
- **Total XP**: Display grande con icono de rayo
- **Nivel actual**: Badge con icono de estrella
- **Progreso al siguiente nivel**: Barra con porcentaje
- **Actividad reciente**: Lista de últimos logros
- **Iconos contextuales**: Emojis por tipo de logro
- **Fechas relativas**: "Ayer", "Hace X días"

### Sistema de Niveles

- **Nivel 1**: 0-99 XP
- **Nivel 2**: 100-249 XP
- **Nivel 3**: 250-499 XP
- **Nivel 4**: 500-749 XP
- **Nivel 5**: 750-999 XP
- **Nivel 6**: 1000-1499 XP
- **Nivel 7**: 1500-1999 XP
- **Nivel 8**: 2000-2999 XP
- **Nivel 9**: 3000-4999 XP
- **Nivel 10+**: 5000+ XP (incrementos de 1000)

### Tipos de Logros

- **Día exitoso**: 📅 +50 XP (verde)
- **Racha**: 🔥 +25 XP (naranja)
- **Semana perfecta**: 📊 +200 XP (azul)
- **Mes legendario**: 👑 +800 XP (púrpura)

### Integración con Sistema Existente

- **API endpoints**: Usa estructura existente de Next.js
- **Toast system**: Usa useToast hook existente
- **shadcn/ui**: Componentes UI consistentes
- **TypeScript**: Interfaces compatibles con tipos existentes
- **Mock data**: Datos de prueba para desarrollo

## Centralización de Strings de Internacionalización (i18n)

### Archivos Creados

#### Archivo de Constantes de Internacionalización (`/lib/i18n/`)

- **en.ts**: Constantes centralizadas para todos los textos en inglés
  - **PLATE_BUILDER**: Toasts y labels del constructor de platos
  - **CALENDAR**: Labels del calendario
  - **SUMMARY**: Toasts y labels de resúmenes semanales/mensuales
  - **GAMIFICATION**: Labels y mensajes de gamificación
  - **COMMON**: Mensajes comunes (errores, loading, acciones)
  - **formatMessage**: Función helper para interpolación de variables
  - **TypeScript**: Constantes tipadas con `as const` para type safety

### Archivos Actualizados

#### Componentes Actualizados para usar i18n

- **PlateBuilder.tsx**: 
  - **Toasts**: Todos los mensajes de toast ahora usan constantes
  - **Labels**: Biblioteca de ingredientes, constructor de platos, grupos nutricionales
  - **Placeholders**: Texto de búsqueda y botones
  - **Tooltips**: Mensajes de estado (incluido/faltante)

- **WeeklySummaryCard.tsx**:
  - **Toasts**: Mensajes de semana perfecta con interpolación
  - **Labels**: Títulos, criterios de éxito, estados de carga
  - **Fechas**: Formato de fechas en inglés
  - **Mensajes de error**: Textos estandarizados

- **MonthlySummaryCard.tsx**:
  - **Toasts**: Mensajes de mes legendario con interpolación
  - **Labels**: Títulos, criterios de éxito, desglose semanal
  - **Fechas**: Formato de fechas en inglés
  - **Mensajes de error**: Textos estandarizados

- **StreakWidget.tsx**:
  - **Labels**: Racha actual, mejor racha, progreso
  - **Mensajes motivacionales**: Según nivel de racha
  - **Estados de carga**: Loading y retry
  - **Mensajes de error**: Textos estandarizados

- **XpPanel.tsx**:
  - **Labels**: Nivel, progreso, actividad reciente
  - **Tipos de actividad**: Iconos y colores por tipo de logro
  - **Formato de fechas**: Relativo (ayer, hace X días)
  - **Estados de carga**: Loading y retry

### Características Técnicas

#### Organización de Constantes
- **Estructura jerárquica**: Agrupadas por funcionalidad
- **TypeScript**: Constantes tipadas con `as const`
- **Interpolación**: Función `formatMessage` para variables
- **Consistencia**: Nomenclatura uniforme en inglés

#### Categorías de Textos
- **TOASTS**: Mensajes de notificaciones
- **LABELS**: Etiquetas de UI
- **ERRORS**: Mensajes de error
- **LOADING**: Estados de carga
- **ACTIONS**: Acciones de usuario

#### Funcionalidades de Interpolación
- **formatMessage**: Reemplaza `{variable}` con valores
- **Type safety**: Parámetros tipados
- **Flexibilidad**: Soporte para strings y números

### Beneficios de la Centralización

#### Mantenimiento
- **Un solo lugar**: Todos los textos en un archivo
- **Consistencia**: Nomenclatura uniforme
- **Fácil actualización**: Cambios centralizados
- **Type safety**: Prevención de errores tipográficos

#### Escalabilidad
- **Preparado para i18n**: Estructura lista para múltiples idiomas
- **Reutilización**: Constantes compartidas entre componentes
- **Extensibilidad**: Fácil agregar nuevos idiomas

#### Desarrollo
- **IntelliSense**: Autocompletado de constantes
- **Refactoring**: Cambios seguros con TypeScript
- **Testing**: Fácil mockear textos para tests

### Estructura de Constantes

#### PLATE_BUILDER
```typescript
TOASTS: {
  EMPTY_PLATE: { title, description }
  DAY_COMPLETE: { title, description }
  CALORIE_EXCESS: { title, description }
  EXTRAS_DETECTED: { title, description }
  MISSING_GROUPS: { title, description }
  SAVE_ERROR: { title, description }
}
LABELS: {
  INGREDIENT_LIBRARY, SEARCH_PLACEHOLDER, PLATE_BUILDER,
  DAILY_GOAL, CARBOHYDRATES, PROTEIN, FAT, VEGETABLES_FRUITS,
  EXTRAS_TREATS, SAVE_DAY, SAVING, INCLUDED, MISSING
}
```

#### SUMMARY
```typescript
TOASTS: {
  PERFECT_WEEK: { title, description: "You've earned {amount} XP..." }
  LEGENDARY_MONTH: { title, description: "You've earned {amount} XP..." }
}
LABELS: {
  WEEKLY_SUMMARY, MONTHLY_SUMMARY, PERFECT_WEEK, INCOMPLETE_WEEK,
  LEGENDARY_MONTH, INCOMPLETE_MONTH, CALORIES, SUCCESSFUL_DAYS,
  SUCCESSFUL_WEEKS, SUCCESS_CRITERIA, WEEKLY_BREAKDOWN,
  ALL_DAYS_SUCCESSFUL, CALORIES_WITHIN_WEEKLY_GOAL,
  ALL_WEEKS_SUCCESSFUL, CALORIES_WITHIN_MONTHLY_GOAL,
  WEEK_1, LOADING_SUMMARY, RETRY
}
```

#### GAMIFICATION
```typescript
LABELS: {
  CURRENT_STREAK, BEST_STREAK, DAYS, TOTAL_XP, LEVEL,
  PROGRESS_TO_LEVEL, RECENT_ACTIVITY, LOADING, RETRY
}
STREAK: {
  START_STREAK, GOOD_START, KEEP_GOING, EXCELLENT_STREAK,
  LEGENDARY_STREAK, MAINTAIN_STREAK, PROGRESS, LEGENDARY,
  TOWARDS_7_DAYS, TOWARDS_4_DAYS, TOWARDS_2_DAYS
}
XP_ACTIVITY: {
  SUCCESSFUL_DAY: { icon: "📅", label: "Successful Day", color: "text-green-600" }
  STREAK: { icon: "🔥", label: "Streak", color: "text-orange-600" }
  PERFECT_WEEK: { icon: "📊", label: "Perfect Week", color: "text-blue-600" }
  LEGENDARY_MONTH: { icon: "👑", label: "Legendary Month", color: "text-purple-600" }
  DEFAULT: { icon: "⭐", label: "Achievement", color: "text-gray-600" }
}
DATE_FORMATS: {
  YESTERDAY: "Yesterday"
  DAYS_AGO: "days ago"
  DATE_FORMAT: "MMM dd"
}
```

#### COMMON
```typescript
ERRORS: {
  UNKNOWN_ERROR, FETCH_ERROR, NETWORK_ERROR, VALIDATION_ERROR
}
LOADING: {
  LOADING, SAVING, PROCESSING
}
ACTIONS: {
  RETRY, SAVE, CANCEL, CLOSE, REFRESH
}
```

### Integración con Componentes

#### Importación
```typescript
import { PLATE_BUILDER, SUMMARY, GAMIFICATION, formatMessage } from '@/lib/i18n/en';
```

#### Uso de Constantes
```typescript
// Labels simples
<span>{PLATE_BUILDER.LABELS.INGREDIENT_LIBRARY}</span>

// Toasts con interpolación
toast({
  title: SUMMARY.TOASTS.PERFECT_WEEK.title,
  description: formatMessage(SUMMARY.TOASTS.PERFECT_WEEK.description, { amount: xpAmount })
});
```

#### Formato de Fechas
```typescript
// Cambio de español a inglés
date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
```

### Preparación para Futuro i18n

#### Estructura Escalable
- **Archivo base**: `en.ts` como referencia
- **Futuro**: `es.ts`, `fr.ts`, etc.
- **Runtime**: Preparado para librerías como `react-i18next`

#### Beneficios Inmediatos
- **Consistencia**: Textos uniformes en toda la app
- **Mantenimiento**: Cambios centralizados
- **Type safety**: Prevención de errores
- **Developer experience**: Mejor IntelliSense

## Puertas de Calidad (Quality Gates)

### Archivos Creados

#### Configuración de ESLint Estricta (`.eslintrc.json`)

- **Reglas TypeScript estrictas**: 
  - `@typescript-eslint/no-unused-vars`: Error para variables no utilizadas
  - `@typescript-eslint/no-explicit-any`: Warning para uso de `any`
  - `@typescript-eslint/prefer-const`: Error para variables que deberían ser const
  - `@typescript-eslint/no-non-null-assertion`: Warning para assertions no-null
  - `@typescript-eslint/no-empty-function`: Warning para funciones vacías
  - `@typescript-eslint/no-inferrable-types`: Error para tipos inferibles
  - `@typescript-eslint/prefer-nullish-coalescing`: Error para usar `??` en lugar de `||`
  - `@typescript-eslint/prefer-optional-chain`: Error para usar `?.` en lugar de `&&`
  - `@typescript-eslint/no-unnecessary-type-assertion`: Error para type assertions innecesarios
  - `@typescript-eslint/no-floating-promises`: Error para promesas no manejadas
  - `@typescript-eslint/await-thenable`: Error para await en valores no thenable
  - `@typescript-eslint/no-misused-promises`: Error para promesas mal usadas

- **Reglas de Import**:
  - `import/order`: Ordenamiento automático de imports
  - `import/no-unused-modules`: Error para módulos no utilizados
  - `import/no-duplicates`: Error para imports duplicados

- **Reglas de Calidad de Código**:
  - `no-console`: Warning para console.log
  - `no-debugger`: Error para debugger statements
  - `no-alert`: Warning para alert/confirm/prompt
  - `prefer-const`: Error para variables que deberían ser const
  - `no-var`: Error para uso de var
  - `eqeqeq`: Error para usar === en lugar de ==
  - `curly`: Error para llaves obligatorias en if/for/while
  - `no-eval`: Error para eval()
  - `no-implied-eval`: Error para eval implícito
  - `no-new-func`: Error para new Function()
  - `no-script-url`: Error para javascript: URLs
  - `no-sequences`: Error para comma operator
  - `no-throw-literal`: Error para throw de literales
  - `no-unmodified-loop-condition`: Error para condiciones de loop no modificadas
  - `no-unused-expressions`: Error para expresiones no utilizadas
  - `no-useless-call`: Error para .call() innecesario
  - `no-useless-concat`: Error para concatenación innecesaria
  - `no-useless-return`: Error para return innecesario
  - `prefer-arrow-callback`: Error para usar arrow functions
  - `prefer-template`: Error para usar template literals
  - `yoda`: Error para condiciones yoda

- **Reglas de React**:
  - `react/jsx-no-useless-fragment`: Error para fragments innecesarios
  - `react/jsx-key`: Error para elementos sin key
  - `react/jsx-no-duplicate-props`: Error para props duplicados
  - `react/jsx-no-undef`: Error para componentes no definidos
  - `react/no-array-index-key`: Warning para usar index como key
  - `react/no-children-prop`: Error para children como prop
  - `react/no-danger-with-children`: Error para dangerouslySetInnerHTML con children
  - `react/no-deprecated`: Error para APIs deprecadas
  - `react/no-direct-mutation-state`: Error para mutación directa de state
  - `react/no-find-dom-node`: Error para findDOMNode
  - `react/no-is-mounted`: Error para isMounted
  - `react/no-render-return-value`: Error para return value de render
  - `react/no-string-refs`: Error para string refs
  - `react/no-unescaped-entities`: Error para entidades no escapadas
  - `react/no-unknown-property`: Error para props desconocidos
  - `react/no-unsafe`: Error para métodos unsafe
  - `react/require-render-return`: Error para render sin return
  - `react/self-closing-comp`: Error para componentes auto-cerrados

- **Reglas de Next.js**:
  - `@next/next/no-img-element`: Error para usar `<img>` en lugar de `<Image>`
  - `@next/next/no-html-link-for-pages`: Error para links HTML en lugar de Link
  - `@next/next/no-sync-scripts`: Error para scripts síncronos
  - `@next/next/no-title-in-document-head`: Error para title en document head
  - `@next/next/no-unwanted-polyfillio`: Error para polyfills no deseados
  - `@next/next/no-css-tags`: Error para CSS tags
  - `@next/next/no-document-import-in-page`: Error para importar document en pages
  - `@next/next/no-head-import-in-document`: Error para importar head en document
  - `@next/next/no-page-custom-font`: Error para fuentes personalizadas en pages
  - `@next/next/no-styled-jsx-in-document`: Error para styled-jsx en document
  - `@next/next/no-typos`: Error para typos en Next.js

- **Overrides para Tests**:
  - Desactiva `@typescript-eslint/no-explicit-any` en archivos de test
  - Desactiva `no-console` en archivos de test

#### Tests Unitarios Extendidos (`__tests__/lib/nutri/validation.test.ts`)

- **Edge Cases Agregados**:
  - **Valores negativos**: Target de calorías negativo
  - **Valores muy grandes**: Calorías de millones
  - **Valores decimales**: Calorías con decimales
  - **Múltiples items del mismo grupo**: Varios carbohidratos, etc.
  - **Solo treats**: Array con solo elementos treat
  - **Mezcla de treats y grupos válidos**: Combinación de ambos
  - **Valores límite**: Exactamente en el límite y justo por encima
  - **Cantidades muy pequeñas**: 1 gramo de ingredientes
  - **Cantidades muy grandes**: 10kg de ingredientes

- **Cobertura de Casos**:
  - **Boundary testing**: Valores exactos en límites
  - **Edge case testing**: Valores extremos
  - **Data type testing**: Diferentes tipos de datos
  - **Business logic testing**: Lógica de negocio específica

#### Tests Unitarios para Streak Updates (`__tests__/lib/streak-updates.test.ts`)

- **Mock Database Class**:
  - **MockStreak interface**: Estructura de datos de racha
  - **MockDayEntry interface**: Estructura de entrada diaria
  - **MockDatabase class**: Simulación de base de datos
    - `getStreak()`: Obtener racha actual
    - `upsertStreak()`: Crear/actualizar racha
    - `getDayEntry()`: Obtener entrada del día
    - `getYesterdayEntry()`: Obtener entrada de ayer
    - `addDayEntry()`: Agregar entrada diaria
    - `clear()`: Limpiar datos de test
    - `getStreakData()`: Obtener datos de racha para verificación

- **StreakManager Class**:
  - **updateStreak()**: Lógica principal de actualización de racha
  - **Lógica de negocio**: 
    - Incrementar racha si ayer fue exitoso
    - Reiniciar racha si ayer no fue exitoso
    - Actualizar mejor racha cuando se supera
    - Mantener mejor racha en fallos

- **Test Cases**:
  - **Casos exitosos**:
    - Primer día exitoso (racha = 1)
    - Incrementar racha cuando ayer fue exitoso
    - Actualizar mejor racha cuando se supera
    - Iniciar nueva racha cuando ayer no fue exitoso
    - Iniciar nueva racha cuando no hay entrada de ayer

  - **Casos de fallo**:
    - Reiniciar racha a 0 en fallo
    - Mantener mejor racha en fallo
    - Manejar fallo sin racha existente

  - **Edge cases**:
    - Múltiples días consecutivos exitosos
    - Interrupción y reinicio de racha
    - Rachas muy largas (100+ días)
    - Condiciones de límite de fecha (cambio de mes)
    - Actualizaciones concurrentes de racha

### Características Técnicas

#### ESLint Configuration
- **Extends**: next/core-web-vitals, next/typescript
- **Rules**: 50+ reglas estrictas para TypeScript, React, Next.js
- **Overrides**: Configuración específica para archivos de test
- **Import ordering**: Ordenamiento automático y alfabético
- **Code quality**: Prevención de anti-patterns comunes

#### Test Coverage
- **evaluateDay**: 15+ test cases cubriendo edge cases
- **Streak Updates**: 20+ test cases con mock database
- **Mock Database**: Simulación completa de operaciones DB
- **Business Logic**: Cobertura completa de lógica de negocio

#### Quality Gates
- **TypeScript strict**: Prevención de errores de tipo
- **Import management**: Imports organizados y sin duplicados
- **Code patterns**: Uso de mejores prácticas
- **React best practices**: Patrones recomendados de React
- **Next.js compliance**: Cumplimiento de convenciones Next.js

### Beneficios de las Quality Gates

#### Desarrollo
- **Prevención de errores**: Detección temprana de problemas
- **Consistencia**: Código uniforme en todo el proyecto
- **Mejores prácticas**: Enfoque en patrones recomendados
- **Mantenibilidad**: Código más fácil de mantener

#### Testing
- **Cobertura completa**: Edge cases y casos límite
- **Mock database**: Tests aislados y rápidos
- **Business logic**: Validación de lógica de negocio
- **Regression prevention**: Prevención de regresiones

#### CI/CD
- **Automated checks**: Verificaciones automáticas
- **Quality gates**: Bloqueo de código de baja calidad
- **Consistent standards**: Estándares consistentes
- **Developer feedback**: Feedback inmediato a desarrolladores

### Integración con Workflow

#### Pre-commit Hooks
- **ESLint**: Verificación automática antes de commit
- **Type checking**: Verificación de tipos TypeScript
- **Test running**: Ejecución de tests relevantes

#### CI Pipeline
- **Lint checks**: Verificación de ESLint en CI
- **Test execution**: Ejecución de todos los tests
- **Quality gates**: Bloqueo de merge si fallan checks
- **Coverage reports**: Reportes de cobertura de tests

#### Development Workflow
- **IDE integration**: ESLint integrado en IDE
- **Real-time feedback**: Feedback en tiempo real
- **Auto-fixing**: Corrección automática de problemas
- **Import organization**: Organización automática de imports
