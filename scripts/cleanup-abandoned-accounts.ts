import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Usar service role key para operaciones de admin
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface AbandonedAccount {
  id: string
  email: string
  created_at: string
  email_confirmed_at: string | null
  app_metadata: any
  user_metadata: any
  last_sign_in_at: string | null
}

interface CleanupStats {
  totalChecked: number
  emailPasswordDeleted: number
  oauthRemindersSent: number
  errors: number
  skipped: number
}

async function cleanupAbandonedAccounts() {
  const stats: CleanupStats = {
    totalChecked: 0,
    emailPasswordDeleted: 0,
    oauthRemindersSent: 0,
    errors: 0,
    skipped: 0
  }

  try {
    console.log('🧹 Starting cleanup of abandoned accounts...')
    
    // 1. Obtener todos los usuarios de Supabase Auth
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    console.log(`📊 Found ${users.length} total users`)

    // 2. Filtrar usuarios abandonados (creados hace 48-72 horas)
    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - 72) // 72 horas atrás
    
    const abandonedUsers = users.filter(user => {
      const createdAt = new Date(user.created_at)
      const isOldEnough = createdAt < cutoffTime
      const isUnconfirmed = !user.email_confirmed_at
      const hasNoProfile = !user.user_metadata?.onboarding_complete
      
      return isOldEnough && isUnconfirmed && hasNoProfile
    })

    console.log(`🔍 Found ${abandonedUsers.length} potentially abandoned accounts`)

    stats.totalChecked = abandonedUsers.length

    // 3. Procesar cada usuario abandonado
    for (const user of abandonedUsers) {
      try {
        // Guard: skip users without email
        if (!user.email) {
          console.log(`⏭️  Skipping user ${user.id} - no email address`)
          stats.skipped++
          continue
        }

        // Map to AbandonedAccount shape with guaranteed email
        const abandonedAccount: AbandonedAccount = {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          email_confirmed_at: user.email_confirmed_at ?? null,
          app_metadata: user.app_metadata,
          user_metadata: user.user_metadata,
          last_sign_in_at: user.last_sign_in_at ?? null
        }

        await processAbandonedUser(abandonedAccount, stats)
      } catch (error) {
        console.error(`❌ Error processing user ${user.id}:`, error)
        stats.errors++
      }
    }

    // 4. Mostrar estadísticas finales
    console.log('\n📈 Cleanup Statistics:')
    console.log(`   Total checked: ${stats.totalChecked}`)
    console.log(`   Email/Password deleted: ${stats.emailPasswordDeleted}`)
    console.log(`   OAuth reminders sent: ${stats.oauthRemindersSent}`)
    console.log(`   Errors: ${stats.errors}`)
    console.log(`   Skipped: ${stats.skipped}`)

    console.log('✅ Cleanup completed successfully')

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  }
}

async function processAbandonedUser(user: AbandonedAccount, stats: CleanupStats) {
  const isOAuth = user.app_metadata?.provider && user.app_metadata.provider !== 'email'
  const isEmailPassword = !isOAuth

  // Verificar si realmente no tiene perfil en la base de datos
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error(`❌ Error checking profile for user ${user.id}:`, profileError)
    stats.errors++
    return
  }

  // Si tiene perfil en la base de datos, saltar
  if (profile) {
    console.log(`⏭️  Skipping user ${user.id} - has profile in database`)
    stats.skipped++
    return
  }

  if (isEmailPassword) {
    // Para cuentas de email/password no confirmadas, eliminar directamente
    console.log(`🗑️  Deleting email/password user: ${user.email} (${user.id})`)
    
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
    
    if (deleteError) {
      console.error(`❌ Failed to delete user ${user.id}:`, deleteError)
      stats.errors++
    } else {
      console.log(`✅ Deleted user ${user.id}`)
      stats.emailPasswordDeleted++
    }
  } else {
    // Para cuentas OAuth, enviar recordatorio
    console.log(`📧 Sending reminder to OAuth user: ${user.email} (${user.id})`)
    
    try {
      await sendReminderEmail(user)
      stats.oauthRemindersSent++
    } catch (error) {
      console.error(`❌ Failed to send reminder to ${user.id}:`, error)
      stats.errors++
    }
  }
}

async function sendReminderEmail(user: AbandonedAccount) {
  // Aquí implementarías el envío de email de recordatorio
  // Por ejemplo, usando un servicio como SendGrid, Resend, etc.
  
  console.log(`📧 Would send reminder email to: ${user.email}`)
  console.log(`   Provider: ${user.app_metadata?.provider}`)
  console.log(`   Created: ${user.created_at}`)
  
  // Ejemplo de implementación con un servicio de email:
  /*
  const emailData = {
    to: user.email,
    subject: 'Complete your NutriMate profile setup',
    template: 'onboarding-reminder',
    data: {
      user_name: user.user_metadata?.full_name || 'there',
      provider: user.app_metadata?.provider,
      signup_date: user.created_at
    }
  }
  
  await emailService.send(emailData)
  */
}

// Función para ejecutar desde cron job
async function runCleanup() {
  try {
    await cleanupAbandonedAccounts()
    process.exit(0)
  } catch (error) {
    console.error('Cleanup failed:', error)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runCleanup()
}

export { cleanupAbandonedAccounts, processAbandonedUser, sendReminderEmail }
