"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useOnboardingStatus } from './use-onboarding-status'

interface OnboardingGuardState {
  isLoading: boolean
  needsOnboarding: boolean
  isRedirecting: boolean
}

export function useOnboardingGuard() {
  const router = useRouter()
  const pathname = usePathname()
  const [state, setState] = useState<OnboardingGuardState>({
    isLoading: true,
    needsOnboarding: false,
    isRedirecting: false
  })
  const [user, setUser] = useState<any>(null)

  // Rutas que no requieren verificación de onboarding
  const publicRoutes = [
    '/',
    '/landing',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/privacy-policy',
    '/terms-of-service',
    '/pricing',
    '/auth/callback',
    '/clear-auth',
    '/clear-session',
    '/configure-url',
    '/debug-auth',
    '/debug-subscription',
    '/debug-grocery-list',
    '/test',
    '/test-analytics',
    '/test-billing-portal',
    '/test-pages',
    '/test-user-profile'
  ]

  // Rutas que requieren onboarding completo
  const protectedRoutes = [
    '/dashboard',
    '/calendar',
    '/meal-plans',
    '/recipes',
    '/saved-recipes',
    '/grocery-list',
    '/ingredients',
    '/goals',
    '/gamification',
    '/monthly-summary',
    '/weekly-summary',
    '/calorie-calculator',
    '/account',
    '/account/settings',
    '/account/subscription',
    '/checkout',
    '/checkout/success',
    '/admin',
    '/admin/analytics',
    '/admin/test-users'
  ]

  const isPublicRoute = publicRoutes.includes(pathname)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isOnboardingRoute = pathname === '/onboarding'

  // Obtener estado de onboarding del usuario
  const onboardingStatus = useOnboardingStatus(user)

  useEffect(() => {
    let mounted = true

    const checkUserStatus = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }))

        // Si es una ruta pública, no hacer nada
        if (isPublicRoute) {
          setState({
            isLoading: false,
            needsOnboarding: false,
            isRedirecting: false
          })
          return
        }

        // Obtener sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Error getting session:', sessionError)
          setState({
            isLoading: false,
            needsOnboarding: false,
            isRedirecting: false
          })
          return
        }

        // Actualizar usuario
        setUser(session?.user || null)

        // Si no hay sesión y es una ruta protegida, redirigir a login
        if (!session && isProtectedRoute) {
          if (mounted) {
            setState({
              isLoading: false,
              needsOnboarding: false,
              isRedirecting: true
            })
            router.push('/login')
          }
          return
        }

        // Si no hay sesión, no hacer nada más
        if (!session) {
          setState({
            isLoading: false,
            needsOnboarding: false,
            isRedirecting: false
          })
          return
        }

        if (mounted) {
          setState({
            isLoading: false,
            needsOnboarding: false,
            isRedirecting: false
          })
        }
      } catch (error) {
        console.error('Error in onboarding guard:', error)
        if (mounted) {
          setState({
            isLoading: false,
            needsOnboarding: false,
            isRedirecting: false
          })
        }
      }
    }

    checkUserStatus()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setUser(session?.user || null)
        await checkUserStatus()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [pathname, isPublicRoute, isProtectedRoute, isOnboardingRoute, router])

  // Efecto para manejar redirecciones basadas en el estado de onboarding
  useEffect(() => {
    if (onboardingStatus.isLoading || !user) return

    console.log("🔍 OnboardingGuard redirect check:", {
      needsOnboarding: onboardingStatus.needsOnboarding,
      isComplete: onboardingStatus.isComplete,
      isOnboardingRoute,
      isPublicRoute,
      isProtectedRoute,
      currentPath: pathname,
      userId: user?.id
    })

    // Si necesita onboarding y no está en la página de onboarding, redirigir
    if (onboardingStatus.needsOnboarding && !isOnboardingRoute && !isPublicRoute) {
      console.log("🔄 Redirecting to onboarding from:", pathname)
      setState(prev => ({ ...prev, isRedirecting: true }))
      router.push('/onboarding')
    }
    // Si no necesita onboarding y está en la página de onboarding, redirigir al dashboard
    else if (onboardingStatus.isComplete && isOnboardingRoute) {
      console.log("🔄 Redirecting to dashboard from onboarding")
      setState(prev => ({ ...prev, isRedirecting: true }))
      router.push('/dashboard')
    }
  }, [onboardingStatus, user, isOnboardingRoute, isPublicRoute, router, pathname])

  return {
    ...state,
    needsOnboarding: onboardingStatus.needsOnboarding
  }
}
