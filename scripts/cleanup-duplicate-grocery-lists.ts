#!/usr/bin/env tsx

/**
 * Script para limpiar listas de compras duplicadas
 * 
 * Este script identifica y elimina listas de compras duplicadas,
 * manteniendo solo la más reciente para cada usuario.
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

async function cleanupDuplicateGroceryLists() {
  console.log('🧹 Iniciando limpieza de listas de compras duplicadas...')

  try {
    // Obtener todos los usuarios que tienen listas de compras
    const { data: usersWithLists, error: usersError } = await supabase
      .from('grocery_lists')
      .select('user_id')
      .group('user_id')

    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError)
      return
    }

    console.log(`📊 Encontrados ${usersWithLists?.length || 0} usuarios con listas de compras`)

    let totalDeleted = 0

    for (const { user_id } of usersWithLists || []) {
      console.log(`\n👤 Procesando usuario: ${user_id}`)

      // Obtener todas las listas del usuario
      const { data: userLists, error: listsError } = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })

      if (listsError) {
        console.error(`❌ Error obteniendo listas para usuario ${user_id}:`, listsError)
        continue
      }

      if (!userLists || userLists.length <= 1) {
        console.log(`✅ Usuario ${user_id} tiene ${userLists?.length || 0} listas (no hay duplicados)`)
        continue
      }

      console.log(`⚠️  Usuario ${user_id} tiene ${userLists.length} listas (duplicados encontrados)`)

      // Mantener la lista más reciente (primera en el array ordenado)
      const keepList = userLists[0]
      const listsToDelete = userLists.slice(1)

      console.log(`📝 Manteniendo lista: ${keepList.id} (${keepList.name})`)
      console.log(`🗑️  Eliminando ${listsToDelete.length} listas duplicadas`)

      // Eliminar listas duplicadas
      for (const listToDelete of listsToDelete) {
        // Primero eliminar todos los items de la lista
        const { error: deleteItemsError } = await supabase
          .from('grocery_list_items')
          .delete()
          .eq('grocery_list_id', listToDelete.id)

        if (deleteItemsError) {
          console.error(`❌ Error eliminando items de lista ${listToDelete.id}:`, deleteItemsError)
          continue
        }

        // Luego eliminar la lista
        const { error: deleteListError } = await supabase
          .from('grocery_lists')
          .delete()
          .eq('id', listToDelete.id)

        if (deleteListError) {
          console.error(`❌ Error eliminando lista ${listToDelete.id}:`, deleteListError)
          continue
        }

        console.log(`✅ Lista ${listToDelete.id} eliminada exitosamente`)
        totalDeleted++
      }
    }

    console.log(`\n🎉 Limpieza completada! Se eliminaron ${totalDeleted} listas duplicadas`)

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
  }
}

// Ejecutar el script
cleanupDuplicateGroceryLists()
  .then(() => {
    console.log('✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
