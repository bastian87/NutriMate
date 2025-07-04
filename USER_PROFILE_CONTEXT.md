# UserProfileContext - Guía de Uso

## Descripción

El `UserProfileContext` es un contexto global que centraliza toda la información del usuario en NutriMate, incluyendo perfil, preferencias, suscripción y límites de uso. Este contexto elimina la necesidad de hacer múltiples requests en cada página y proporciona acceso instantáneo a los datos del usuario.

## Características Principales

### 🚀 **Carga Centralizada**
- Todos los datos del usuario se cargan en una sola operación al iniciar sesión
- Requests paralelos para máxima velocidad
- Caché en localStorage para cargas subsecuentes

### 💾 **Persistencia Inteligente**
- Almacenamiento automático en localStorage
- Expiración de caché (1 hora) para mantener datos frescos
- Limpieza automática al cerrar sesión

### ⚡ **Acceso Instantáneo**
- Datos disponibles inmediatamente en todas las páginas
- Sin loaders adicionales en componentes
- Navegación instantánea entre rutas

### 🔒 **Control de Acceso**
- Verificación automática de características premium
- Límites de uso para usuarios free
- Hooks de conveniencia para verificar permisos

## Estructura de Datos

```typescript
interface UserProfileData {
  profile: UserProfile | null          // Información básica del usuario
  preferences: UserPreferences | null  // Preferencias nutricionales
  subscription: Subscription | null    // Estado de suscripción
  usage: UsageLimit | null            // Límites de uso actuales
  isPremium: boolean                  // Estado premium simplificado
  accountType: "free" | "premium"     // Tipo de cuenta
}
```

## Hooks Disponibles

### `useUserProfile()`
Hook principal que proporciona acceso a todos los datos del usuario.

```typescript
const { userData, loading, error, fetchUserProfile, refreshUserProfile } = useUserProfile()

// userData contiene toda la información del usuario
// loading indica si se están cargando los datos
// error contiene cualquier error que haya ocurrido
// fetchUserProfile() carga los datos manualmente
// refreshUserProfile() actualiza los datos desde el servidor
```

### `useIsPremium()`
Hook de conveniencia para verificar si el usuario es premium.

```typescript
const isPremium = useIsPremium()
// Retorna true si el usuario tiene suscripción premium activa
```

### `useAccountType()`
Hook de conveniencia para obtener el tipo de cuenta.

```typescript
const accountType = useAccountType()
// Retorna "free" o "premium"
```

### `useFeatureAccess(feature)`
Hook para verificar acceso a características específicas.

```typescript
const { canAccess, reason } = useFeatureAccess("smart_grocery_lists")

// canAccess: boolean - si el usuario puede acceder a la característica
// reason: string - razón por la que no puede acceder (si aplica)
```

## Características Soportadas

### Características Premium (solo para usuarios premium)
- `export_meal_plans`
- `priority_support`
- `advanced_nutrition_analysis`
- `unlimited_meal_plans`
- `unlimited_custom_recipes`
- `unlimited_saved_recipes`
- `advanced_meal_planning`
- `smart_grocery_lists`

### Características con Límites (usuarios free)
- `save_recipes` - límite de 10 recetas guardadas
- `create_meal_plans` - límite de 2 planes de comidas
- `create_custom_recipes` - límite de 3 recetas personalizadas

### Características Básicas (disponibles para todos)
- `browse_recipes`
- `basic_search`
- `view_nutrition_info`
- `basic_meal_planning`
- `basic_grocery_lists`

## Ejemplos de Uso

### 1. Mostrar Estado de Cuenta en Dashboard

```typescript
import { useIsPremium, useAccountType } from "@/components/auth/user-profile-provider"

export function DashboardHeader() {
  const isPremium = useIsPremium()
  const accountType = useAccountType()

  return (
    <div>
      <h1>Dashboard</h1>
      <Badge variant={isPremium ? "default" : "secondary"}>
        {accountType.toUpperCase()} Account
      </Badge>
    </div>
  )
}
```

### 2. Control de Acceso a Características

```typescript
import { useFeatureAccess } from "@/components/auth/user-profile-provider"

export function GroceryListPage() {
  const { canAccess, reason } = useFeatureAccess("smart_grocery_lists")

  if (!canAccess) {
    return (
      <div>
        <h2>Smart Grocery Lists</h2>
        <p>{reason}</p>
        <Button href="/pricing">Upgrade to Premium</Button>
      </div>
    )
  }

  return <SmartGroceryList />
}
```

### 3. Mostrar Límites de Uso

```typescript
import { useUserProfile } from "@/components/auth/user-profile-provider"

export function UsageInfo() {
  const { userData } = useUserProfile()

  if (!userData?.usage) return null

  return (
    <div>
      <p>Meal Plans: {userData.usage.mealPlans.created}/{userData.usage.mealPlans.maxCreated}</p>
      <p>Saved Recipes: {userData.usage.recipes.saved}/{userData.usage.recipes.maxSaved}</p>
    </div>
  )
}
```

### 4. Actualizar Preferencias

```typescript
import { useUserProfile } from "@/components/auth/user-profile-provider"

export function PreferencesForm() {
  const { updateUserPreferences } = useUserProfile()

  const handleSubmit = async (data) => {
    try {
      await updateUserPreferences({
        calorie_target: data.calories,
        health_goal: data.goal
      })
      // Los datos se actualizan automáticamente en el contexto
    } catch (error) {
      console.error("Error updating preferences:", error)
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

## Migración desde el Sistema Anterior

### Antes (múltiples requests)
```typescript
// En cada página
const { user } = useAuthContext()
const { subscription, loading: subLoading } = useSubscription()
const { preferences, loading: prefLoading } = useUserPreferences()

// Múltiples estados de loading
if (subLoading || prefLoading) return <Loading />

// Verificaciones separadas
const isPremium = subscription?.plan === "premium"
```

### Después (un solo contexto)
```typescript
// En cualquier página
const { userData, loading } = useUserProfile()
const isPremium = useIsPremium()

// Un solo estado de loading
if (loading) return <Loading />

// Acceso directo a todos los datos
const { profile, preferences, subscription, usage } = userData
```

## Configuración

El `UserProfileProvider` debe estar configurado en el layout principal:

```typescript
// app/layout.tsx
import { UserProfileProvider } from "@/components/auth/user-profile-provider"

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <UserProfileProvider>
        {children}
      </UserProfileProvider>
    </AuthProvider>
  )
}
```

## Debugging

### Página de Debug
Visita `/test-user-profile` para ver todos los datos del contexto en tiempo real.

### Componente de Debug
```typescript
import { UserProfileDebug } from "@/components/user-profile-debug"

// Muestra toda la información del contexto
<UserProfileDebug />
```

### Logs de Consola
El contexto registra información útil en la consola:
- Carga inicial de datos
- Actualizaciones de perfil
- Errores de carga
- Estado de caché

## Mejores Prácticas

### ✅ Hacer
- Usar los hooks de conveniencia (`useIsPremium`, `useFeatureAccess`)
- Verificar el estado `loading` antes de acceder a los datos
- Usar `refreshUserProfile()` cuando necesites datos frescos
- Manejar errores apropiadamente

### ❌ No Hacer
- Hacer requests directos a la API para datos del usuario
- Duplicar la lógica de verificación de características
- Ignorar el estado `loading`
- Asumir que los datos siempre están disponibles

## Rendimiento

### Optimizaciones Implementadas
- **Carga Paralela**: Todos los requests se ejecutan simultáneamente
- **Caché Inteligente**: Datos almacenados en localStorage con expiración
- **Actualizaciones Incrementales**: Solo se actualizan los datos que cambian
- **Limpieza Automática**: Caché se limpia al cerrar sesión

### Métricas Esperadas
- **Primera Carga**: ~200-500ms (dependiendo de la red)
- **Cargas Subsecuentes**: ~10-50ms (desde caché)
- **Navegación entre Páginas**: Instantánea
- **Actualización de Datos**: ~100-300ms

## Troubleshooting

### Problema: Datos no se cargan
**Solución**: Verificar que el `UserProfileProvider` esté configurado correctamente en el layout.

### Problema: Datos desactualizados
**Solución**: Usar `refreshUserProfile()` para forzar una actualización desde el servidor.

### Problema: Errores de localStorage
**Solución**: El contexto maneja automáticamente los errores de localStorage y continúa funcionando.

### Problema: Características no funcionan
**Solución**: Verificar que la característica esté en la lista de características soportadas y usar `useFeatureAccess()`.

## Próximas Mejoras

- [ ] Sincronización en tiempo real con WebSockets
- [ ] Compresión de datos en localStorage
- [ ] Prefetching de datos relacionados
- [ ] Métricas de rendimiento automáticas
- [ ] Soporte para múltiples dispositivos 