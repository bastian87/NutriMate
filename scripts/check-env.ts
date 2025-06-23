#!/usr/bin/env node

// Script para verificar variables de entorno
const requiredEnvVars = {
  // Supabase
  'NEXT_PUBLIC_SUPABASE_URL': 'URL de tu proyecto Supabase (ej: https://xxx.supabase.co)',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Clave anónima de Supabase (empieza con eyJ...)',
  'SUPABASE_SERVICE_ROLE_KEY': 'Clave de servicio de Supabase (empieza con eyJ...)',
  
  // LemonSqueezy
  'LEMONSQUEEZY_API_KEY': 'API Key de LemonSqueezy (empieza con eyJ...)',
  'NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID': 'ID de tu tienda en LemonSqueezy',
  'NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_VARIANT_ID': 'ID del producto mensual',
  'NEXT_PUBLIC_LEMONSQUEEZY_ANNUAL_VARIANT_ID': 'ID del producto anual',
  'LEMONSQUEEZY_WEBHOOK_SECRET': 'Secreto del webhook de LemonSqueezy',
  
  // App
  'NEXT_PUBLIC_APP_URL': 'URL de tu aplicación (ej: https://tuapp.com)',
}

console.log('🔍 Verificando variables de entorno...\n')

let allGood = true

for (const [key, description] of Object.entries(requiredEnvVars)) {
  const value = process.env[key]
  
  if (!value) {
    console.log(`❌ ${key}: NO CONFIGURADA`)
    console.log(`   Descripción: ${description}`)
    allGood = false
  } else if (value.includes('your_') || value.includes('example') || value.includes('xxx')) {
    console.log(`⚠️  ${key}: VALOR DE EJEMPLO`)
    console.log(`   Valor actual: ${value}`)
    console.log(`   Descripción: ${description}`)
    allGood = false
  } else {
    console.log(`✅ ${key}: CONFIGURADA`)
  }
}

console.log('\n' + '='.repeat(50))

if (allGood) {
  console.log('🎉 ¡Todas las variables de entorno están configuradas correctamente!')
} else {
  console.log('⚠️  Algunas variables de entorno necesitan ser configuradas.')
  console.log('\n📝 Para configurar las variables:')
  console.log('1. Crea un archivo .env.local en la raíz del proyecto')
  console.log('2. Agrega las variables faltantes con sus valores reales')
  console.log('3. Reinicia el servidor de desarrollo')
  console.log('\n🔗 Enlaces útiles:')
  console.log('- Supabase: https://supabase.com')
  console.log('- LemonSqueezy: https://lemonsqueezy.com')
}

console.log('\n' + '='.repeat(50)) 