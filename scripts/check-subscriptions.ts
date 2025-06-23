#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { getSubscription } from '../lib/lemonsqueezy-service'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSubscriptions() {
  console.log('🔍 Verificando suscripciones...')
  
  try {
    // Obtener todas las suscripciones activas
    const { data: subscriptions, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('status', 'active')
    
    if (error) {
      console.error('❌ Error al obtener suscripciones:', error)
      return
    }
    
    console.log(`📊 Encontradas ${subscriptions.length} suscripciones activas`)
    
    let validCount = 0
    let invalidCount = 0
    let testModeCount = 0
    
    for (const subscription of subscriptions) {
      console.log(`\n🔍 Verificando suscripción: ${subscription.subscription_id}`)
      
      try {
        const lemonSqueezySub = await getSubscription(subscription.subscription_id)
        
        if (!lemonSqueezySub) {
          console.log(`❌ Suscripción no encontrada en LemonSqueezy: ${subscription.subscription_id}`)
          
          // Verificar si estamos en modo de desarrollo
          const isDevelopment = process.env.NODE_ENV !== "production"
          
          if (isDevelopment) {
            console.log(`🧪 Marcando como suscripción de prueba: ${subscription.subscription_id}`)
            testModeCount++
            
            // Marcar como cancelada y agregar nota sobre modo de prueba
            await supabase
              .from('user_subscriptions')
              .update({ 
                status: 'cancelled',
                updated_at: new Date().toISOString(),
                notes: 'Suscripción de prueba en modo desarrollo - portal de facturación no disponible'
              })
              .eq('subscription_id', subscription.subscription_id)
          } else {
            console.log(`⚠️ Marcando como inválida: ${subscription.subscription_id}`)
            invalidCount++
            
            // Marcar como cancelada
            await supabase
              .from('user_subscriptions')
              .update({ 
                status: 'cancelled',
                updated_at: new Date().toISOString(),
                notes: 'Suscripción no encontrada en LemonSqueezy - requiere atención del soporte'
              })
              .eq('subscription_id', subscription.subscription_id)
          }
        } else {
          console.log(`✅ Suscripción válida: ${subscription.subscription_id}`)
          validCount++
        }
      } catch (error) {
        console.error(`❌ Error al verificar suscripción ${subscription.subscription_id}:`, error)
        invalidCount++
      }
    }
    
    console.log('\n📈 Resumen:')
    console.log(`✅ Suscripciones válidas: ${validCount}`)
    console.log(`❌ Suscripciones inválidas: ${invalidCount}`)
    console.log(`🧪 Suscripciones de prueba limpiadas: ${testModeCount}`)
    
    if (invalidCount > 0 || testModeCount > 0) {
      console.log('\n💡 Recomendaciones:')
      if (testModeCount > 0) {
        console.log(`- ${testModeCount} suscripciones de prueba fueron marcadas como canceladas`)
        console.log('- Los usuarios deberían crear nuevas suscripciones en modo de producción')
      }
      if (invalidCount > 0) {
        console.log(`- ${invalidCount} suscripciones inválidas requieren atención del soporte`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Función específica para limpiar solo suscripciones de prueba
async function cleanTestSubscriptions() {
  console.log('🧪 Limpiando suscripciones de prueba...')
  
  try {
    const { data: subscriptions, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('status', 'active')
    
    if (error) {
      console.error('❌ Error al obtener suscripciones:', error)
      return
    }
    
    let cleanedCount = 0
    
    for (const subscription of subscriptions) {
      try {
        const lemonSqueezySub = await getSubscription(subscription.subscription_id)
        
        if (!lemonSqueezySub) {
          console.log(`🧪 Limpiando suscripción de prueba: ${subscription.subscription_id}`)
          
          await supabase
            .from('user_subscriptions')
            .update({ 
              status: 'cancelled',
              updated_at: new Date().toISOString(),
              notes: 'Suscripción de prueba limpiada automáticamente'
            })
            .eq('subscription_id', subscription.subscription_id)
          
          cleanedCount++
        }
      } catch (error) {
        console.error(`❌ Error al verificar suscripción ${subscription.subscription_id}:`, error)
      }
    }
    
    console.log(`✅ ${cleanedCount} suscripciones de prueba limpiadas`)
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar según el argumento pasado
const command = process.argv[2]

if (command === 'clean-test') {
  cleanTestSubscriptions()
} else {
  checkSubscriptions()
} 
checkSubscriptions() 