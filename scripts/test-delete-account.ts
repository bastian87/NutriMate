#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDeleteAccount() {
  console.log('🧪 Probando funcionalidad de eliminación de cuenta...')
  
  try {
    // 1. Verificar qué tablas existen y tienen datos de usuario
    const userId = 'test-user-id' // Reemplaza con un ID real para probar
    
    console.log('\n📊 Verificando datos del usuario en cada tabla:')
    
    const tables = [
      'users',
      'user_preferences', 
      'user_favorites',
      'grocery_lists',
      'grocery_list_items',
      'user_subscriptions',
      'recipes',
      'recipe_ingredients'
      // Nota: recipe_ratings NO se eliminan para mantener la reputación de la comunidad
    ]
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', userId)
          .limit(5)
        
        if (error) {
          console.log(`❌ ${table}: Error - ${error.message}`)
        } else {
          const count = data?.length || 0
          console.log(`✅ ${table}: ${count} registros encontrados`)
        }
      } catch (err) {
        console.log(`❌ ${table}: Error de conexión`)
      }
    }
    
    console.log('\n💡 Para probar la eliminación completa:')
    console.log('1. Crea un usuario de prueba')
    console.log('2. Agrega datos en las diferentes tablas')
    console.log('3. Ejecuta la eliminación de cuenta')
    console.log('4. Verifica que todos los datos se hayan eliminado')
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  }
}

// Función para verificar estructura de tablas
async function checkTableStructure() {
  console.log('\n🔍 Verificando estructura de tablas...')
  
  const tableQueries = [
    { name: 'users', query: 'SELECT column_name FROM information_schema.columns WHERE table_name = \'users\' AND table_schema = \'public\'' },
    { name: 'user_favorites', query: 'SELECT column_name FROM information_schema.columns WHERE table_name = \'user_favorites\' AND table_schema = \'public\'' },
    { name: 'grocery_lists', query: 'SELECT column_name FROM information_schema.columns WHERE table_name = \'grocery_lists\' AND table_schema = \'public\'' },
    { name: 'user_subscriptions', query: 'SELECT column_name FROM information_schema.columns WHERE table_name = \'user_subscriptions\' AND table_schema = \'public\'' }
  ]
  
  for (const table of tableQueries) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: table.query })
      if (error) {
        console.log(`❌ ${table.name}: Error al verificar estructura`)
      } else {
        console.log(`✅ ${table.name}: Estructura verificada`)
      }
    } catch (err) {
      console.log(`❌ ${table.name}: No se pudo verificar`)
    }
  }
}

// Ejecutar según el argumento
const command = process.argv[2]

if (command === 'structure') {
  checkTableStructure()
} else {
  testDeleteAccount()
} 