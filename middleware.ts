import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Rutas estáticas que no necesitan verificación de auth
  const staticRoutes = [
    '/_next',
    '/api',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml'
  ]

  if (staticRoutes.some(route => pathname.startsWith(route))) {
    return res
  }

  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rutas públicas que no requieren autenticación
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
    '/calorie-calculator', // Calculadora de calorías debe ser pública
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

  // Rutas que requieren autenticación
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
    // '/calorie-calculator', // Removido - ahora es ruta pública
    '/account',
    '/checkout',
    '/admin'
  ]

  const isPublicRoute = publicRoutes.includes(pathname)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isOnboardingRoute = pathname === '/onboarding'

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute) {
    return res
  }

  // Si es una ruta protegida y no hay sesión, redirigir a login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si hay sesión y está en onboarding, verificar si realmente necesita onboarding
  if (session && isOnboardingRoute) {
    try {
      // Verificar metadata del usuario
      const onboardingComplete = session.user.user_metadata?.onboarding_complete === true
      
      if (onboardingComplete) {
        // Si ya completó onboarding, redirigir al dashboard
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    } catch (error) {
      console.error('Error checking onboarding status in middleware:', error)
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
