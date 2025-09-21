import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testOnboardingGuard() {
  try {
    console.log('🧪 Testing Onboarding Guard...')

    // 1. Crear un usuario de prueba
    const testEmail = `test-guard-${Date.now()}@example.com`
    const testPassword = 'testpassword123'

    console.log('📝 Creating test user...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test Guard User',
          username: 'testguarduser'
        }
      }
    })

    if (authError) {
      console.error('❌ Error creating user:', authError)
      return
    }

    if (!authData.session) {
      console.log('📧 User needs email confirmation, skipping test')
      return
    }

    console.log('✅ User created successfully')

    // 2. Verificar estado inicial (debería necesitar onboarding)
    console.log('🔍 Checking initial onboarding status...')
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Verificar metadata
      const onboardingComplete = user.user_metadata?.onboarding_complete === true
      console.log('📊 Metadata onboarding_complete:', onboardingComplete)

      // Verificar perfil en public.users
      const { data: profile } = await supabase
        .from('users')
        .select('id, username')
        .eq('id', user.id)
        .maybeSingle()

      console.log('📊 Profile exists:', !!profile)
      console.log('📊 Profile username:', profile?.username)

      // Verificar preferencias
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      console.log('📊 Preferences exist:', !!preferences)

      // Determinar si necesita onboarding
      const needsOnboarding = !onboardingComplete && (!profile || !profile.username || !preferences)
      console.log('📊 Needs onboarding:', needsOnboarding)
    }

    // 3. Simular completar onboarding
    console.log('🔄 Simulating onboarding completion...')
    
    // Crear perfil de usuario
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .insert({
        id: user!.id,
        email: user!.email!,
        full_name: 'Test Guard User',
        username: 'testguarduser'
      })
      .select()
      .single()

    if (userError) {
      console.error('❌ Error creating user profile:', userError)
    } else {
      console.log('✅ User profile created')
    }

    // Crear preferencias
    const { data: userPrefs, error: prefsError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: user!.id,
        age: 30,
        gender: 'male',
        height: 175,
        weight: 70,
        activity_level: 'moderate',
        health_goal: 'maintain_weight',
        calorie_target: 2200,
        dietary_preferences: [],
        excluded_ingredients: [],
        include_snacks: false,
        allergies: [],
        intolerances: [],
        max_prep_time: 60,
        macro_priority: 'balanced'
      })
      .select()
      .single()

    if (prefsError) {
      console.error('❌ Error creating user preferences:', prefsError)
    } else {
      console.log('✅ User preferences created')
    }

    // Actualizar metadata
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        onboarding_complete: true
      }
    })

    if (metadataError) {
      console.error('❌ Error updating metadata:', metadataError)
    } else {
      console.log('✅ Metadata updated')
    }

    // 4. Verificar estado después del onboarding
    console.log('🔍 Checking post-onboarding status...')
    const { data: { user: updatedUser } } = await supabase.auth.getUser()
    
    if (updatedUser) {
      const onboardingComplete = updatedUser.user_metadata?.onboarding_complete === true
      console.log('📊 Metadata onboarding_complete:', onboardingComplete)

      const { data: profile } = await supabase
        .from('users')
        .select('id, username')
        .eq('id', updatedUser.id)
        .maybeSingle()

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', updatedUser.id)
        .maybeSingle()

      const needsOnboarding = !onboardingComplete && (!profile || !profile.username || !preferences)
      console.log('📊 Needs onboarding after completion:', needsOnboarding)
    }

    // 5. Limpiar datos de prueba
    console.log('🧹 Cleaning up test data...')
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user!.id)
    
    if (deleteError) {
      console.error('⚠️ Error deleting test user:', deleteError)
    } else {
      console.log('✅ Test data cleaned up')
    }

    console.log('✅ Onboarding guard test completed successfully')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Ejecutar la prueba
testOnboardingGuard()
