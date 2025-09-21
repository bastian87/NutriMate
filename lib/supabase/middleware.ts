import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    // Crear cliente de Supabase para middleware
    const supabase = createMiddlewareClient({ req, res })
    
    // Verificar sesión
    const { data: { session } } = await supabase.auth.getSession()
    
    // Agregar headers para evitar errores 406
    res.headers.set('Accept', 'application/json')
    res.headers.set('Content-Type', 'application/json')
    
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
