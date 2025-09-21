#!/usr/bin/env tsx

/**
 * Script para verificar el estado de las listas de compras
 * 
 * Este script muestra información sobre las listas de compras
 * y identifica posibles duplicados.
 */

import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkGroceryLists() {
  console.log('🔍 Verificando estado de las listas de compras...\n')

  try {
    // Obtener todas las listas de compras
    const { data: allLists, error: listsError } = await supabase
      .from('grocery_lists')
      .select('*')
      .order('created_at', { ascending: false })

    if (listsError) {
      console.error('❌ Error obteniendo listas:', listsError)
      return
    }

    console.log(`📊 Total de listas de compras: ${allLists?.length || 0}\n`)

    if (!allLists || allLists.length === 0) {
      console.log('✅ No hay listas de compras en la base de datos')
      return
    }

    // Agrupar por usuario
    const listsByUser = allLists.reduce((acc, list) => {
      if (!acc[list.user_id]) {
        acc[list.user_id] = []
      }
      acc[list.user_id].push(list)
      return acc
    }, {} as Record<string, Array<typeof allLists[0]>>)

    console.log(`👥 Usuarios con listas: ${Object.keys(listsByUser).length}\n`)

    // Mostrar información por usuario
    for (const [userId, userLists] of Object.entries(listsByUser) as [string, Array<typeof allLists[0]>][]) {
      console.log(`👤 Usuario: ${userId}`)
      console.log(`   📝 Listas: ${userLists.length}`)
      
      if (userLists.length > 1) {
        console.log(`   ⚠️  DUPLICADOS DETECTADOS!`)
        userLists.forEach((list, index) => {
          console.log(`      ${index + 1}. ${list.id} - "${list.name}" (${new Date(list.created_at).toLocaleString()})`)
        })
      } else {
        console.log(`   ✅ Sin duplicados`)
        const list = userLists[0]
        console.log(`      📋 ${list.id} - "${list.name}" (${new Date(list.created_at).toLocaleString()})`)
      }
      console.log('')
    }

    // Mostrar estadísticas de items
    const { data: allItems, error: itemsError } = await supabase
      .from('grocery_list_items')
      .select('grocery_list_id')

    if (!itemsError && allItems) {
      const uniqueListIds = new Set(allItems.map(item => item.grocery_list_id))
      console.log(`📦 Total de listas con items: ${uniqueListIds.size}`)
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error)
  }
}

// Ejecutar el script
checkGroceryLists()
  .then(() => {
    console.log('✅ Verificación completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
