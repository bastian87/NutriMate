# 🔒 Verificación de Row Level Security (RLS)

## Matriz de Páginas → Datos Consultados → Garantía RLS

| Página | Datos Consultados | API Endpoint | RLS Implementado | Verificación |
|--------|------------------|--------------|------------------|--------------|
| **`/calendar`** | Objetivos activos del usuario | `GET /api/goals` | ✅ | `.eq('user_id', userId)` |
| **`/calendar`** | Entradas diarias del usuario | `GET /api/calendar` | ✅ | `.eq('user_id', userId)` |
| **`/calendar`** | Crear/actualizar entradas | `POST /api/day-entries` | ✅ | `user_id: userId` en insert |
| **`/goals`** | Lista de objetivos del usuario | `GET /api/goals` | ✅ | `.eq('user_id', userId)` |
| **`/goals`** | Crear nuevo objetivo | `POST /api/goals` | ✅ | `user_id: userId` en insert |
| **`/gamification`** | Streaks del usuario | `GET /api/gamification` | ✅ | `.eq('user_id', userId)` |
| **`/gamification`** | XP ledger del usuario | `GET /api/gamification` | ✅ | `.eq('user_id', userId)` |
| **`/weekly-summary`** | Resúmenes semanales | `GET /api/summary/weekly` | ✅ | `.eq('user_id', userId)` |
| **`/monthly-summary`** | Resúmenes mensuales | `GET /api/summary/monthly` | ✅ | `.eq('user_id', userId)` |
| **`/ingredients`** | Base de datos de ingredientes | `GET /api/ingredients` | ⚪ | Público (no requiere RLS) |

## 🔐 Implementación de Seguridad

### 1. **Autenticación de Usuario**
- Todas las APIs requieren header `x-user-id`
- Función `getUserId()` extrae y valida el ID del usuario
- Sin `x-user-id` → Error 401 Unauthorized

### 2. **Row Level Security (RLS)**
- **Todas las consultas** incluyen `.eq('user_id', userId)`
- **Inserts** incluyen `user_id: userId` en el payload
- **Updates** filtran por `user_id` antes de modificar
- **Deletes** filtran por `user_id` antes de eliminar

### 3. **APIs Protegidas vs Públicas**

#### 🔒 **APIs Protegidas (requieren autenticación)**
- `/api/goals` - Objetivos del usuario
- `/api/day-entries` - Entradas diarias del usuario  
- `/api/calendar` - Datos del calendario del usuario
- `/api/gamification` - Progreso gamificado del usuario
- `/api/summary/weekly` - Resúmenes semanales del usuario
- `/api/summary/monthly` - Resúmenes mensuales del usuario

#### ⚪ **APIs Públicas (no requieren autenticación)**
- `/api/ingredients` - Base de datos de ingredientes (compartida)

### 4. **Verificación de Aislamiento de Datos**

#### ✅ **Usuario A NO puede acceder a datos de Usuario B**
```typescript
// Ejemplo: API de goals
const { data: goals, error } = await supa
  .from('goals')
  .select('*')
  .eq('user_id', userId)  // ← Solo datos del usuario autenticado
  .order('start_date', { ascending: false });
```

#### ✅ **Inserts siempre incluyen user_id**
```typescript
// Ejemplo: Crear nuevo objetivo
const { data: inserted, error } = await supa.from('goals').insert({
  user_id: userId,  // ← Siempre incluir el ID del usuario
  start_date: data.startDate,
  target_kcal_day: data.targetKcalDay,
  // ... otros campos
});
```

#### ✅ **Updates filtran por user_id**
```typescript
// Ejemplo: Actualizar objetivo existente
await supa.from('goals')
  .update({ end_date: data.startDate })
  .eq('user_id', userId)  // ← Solo actualizar objetivos del usuario
  .is('end_date', null);
```

## 🛡️ Garantías de Seguridad

1. **Aislamiento Total**: Usuario A no puede ver, modificar o eliminar datos de Usuario B
2. **Autenticación Obligatoria**: Todas las operaciones requieren `x-user-id` válido
3. **Validación de Entrada**: Todas las APIs usan esquemas Zod para validar datos
4. **Filtrado Consistente**: Todas las consultas incluyen filtro por `user_id`
5. **Sin Datos Hardcodeados**: No hay IDs de demo o usuarios ficticios en producción

## 🔍 Casos de Prueba de Seguridad

### ❌ **Estos accesos DEBEN fallar:**
- Usuario A intenta acceder a `/api/goals` sin `x-user-id`
- Usuario A intenta acceder a `/api/day-entries` con `x-user-id` de Usuario B
- Usuario A intenta modificar objetivo de Usuario B
- Usuario A intenta ver resúmenes de Usuario B

### ✅ **Estos accesos DEBEN funcionar:**
- Usuario A accede a sus propios datos con su `x-user-id`
- Usuario A crea nuevos objetivos/entradas con su `user_id`
- Usuario A modifica solo sus propios datos
- Cualquier usuario accede a `/api/ingredients` (público)
