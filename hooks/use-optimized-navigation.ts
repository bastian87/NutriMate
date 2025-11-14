import { useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/auth/simple-auth-provider'

interface NavigationState {
  isNavigating: boolean
  lastNavigation: string | null
  navigationTimeout: NodeJS.Timeout | null
}

export function useOptimizedNavigation() {
  const router = useRouter()
  const { user, loading } = useAuthContext()
  const stateRef = useRef<NavigationState>({
    isNavigating: false,
    lastNavigation: null,
    navigationTimeout: null
  })

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (stateRef.current.navigationTimeout) {
        clearTimeout(stateRef.current.navigationTimeout)
      }
    }
  }, [])

  const navigateTo = useCallback((path: string, options?: { replace?: boolean }) => {
    // Evitar navegación duplicada
    if (stateRef.current.isNavigating && stateRef.current.lastNavigation === path) {
      console.log('🚫 Navigation already in progress to:', path)
      return
    }

    // Evitar navegación a la misma página
    if (window.location.pathname === path) {
      console.log('🚫 Already on page:', path)
      return
    }

    // Limpiar timeout anterior
    if (stateRef.current.navigationTimeout) {
      clearTimeout(stateRef.current.navigationTimeout)
    }

    stateRef.current.isNavigating = true
    stateRef.current.lastNavigation = path

    console.log('🚀 Navigating to:', path)

    // Usar replace para navegación interna más rápida
    if (options?.replace) {
      router.replace(path)
    } else {
      router.push(path)
    }

    // Resetear estado después de un tiempo
    stateRef.current.navigationTimeout = setTimeout(() => {
      stateRef.current.isNavigating = false
      stateRef.current.lastNavigation = null
    }, 1000)
  }, [router])

  const navigateToDashboard = useCallback(() => {
    navigateTo('/dashboard')
  }, [navigateTo])

  const navigateToRecipes = useCallback(() => {
    navigateTo('/recipes')
  }, [navigateTo])

  const navigateToIngredients = useCallback(() => {
    navigateTo('/ingredients')
  }, [navigateTo])

  const navigateToAccount = useCallback(() => {
    navigateTo('/account')
  }, [navigateTo])

  return {
    navigateTo,
    navigateToDashboard,
    navigateToRecipes,
    navigateToIngredients,
    navigateToAccount,
    isNavigating: stateRef.current.isNavigating
  }
}
