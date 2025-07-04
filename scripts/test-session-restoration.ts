import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSessionRestoration() {
  console.log('🧪 Probando restauración de sesión...')
  
  try {
    // 1. Obtener sesión actual
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Error al obtener sesión:', error)
      return
    }
    
    if (session) {
      console.log('✅ Sesión encontrada:', {
        userId: session.user.id,
        email: session.user.email,
        expiresAt: session.expires_at,
        isExpired: session.expires_at ? new Date(session.expires_at * 1000) < new Date() : false
      })
      
      // 2. Verificar si el usuario tiene perfil
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('id', session.user.id)
        .single()
      
      if (profileError) {
        console.log('⚠️ Usuario no tiene perfil o error:', profileError.message)
      } else {
        console.log('✅ Perfil de usuario encontrado:', userProfile)
      }
      
      // 3. Verificar preferencias
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
      
      if (prefError) {
        console.log('⚠️ Usuario no tiene preferencias o error:', prefError.message)
      } else {
        console.log('✅ Preferencias encontradas:', preferences)
      }
      
    } else {
      console.log('ℹ️ No hay sesión activa')
    }
    
  } catch (error) {
    console.error('❌ Error en prueba:', error)
  }
}

async function testAuthStateChange() {
  console.log('\n🔄 Probando AuthStateChange...')
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log(`📡 AuthStateChange: ${event}`, {
      userId: session?.user?.id,
      email: session?.user?.email
    })
  })
  
  // Mantener la suscripción activa por 10 segundos
  setTimeout(() => {
    subscription.unsubscribe()
    console.log('✅ Prueba de AuthStateChange completada')
  }, 10000)
}

async function main() {
  console.log('🚀 Iniciando pruebas de autenticación...\n')
  
  await testSessionRestoration()
  await testAuthStateChange()
  
  console.log('\n✅ Pruebas completadas')
  process.exit(0)
}

main().catch(console.error) 