import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testProfileRestart() {
  try {
    console.log('🧪 Testing Profile Restart API...')

    // 1. Create a test user that will be abandoned
    const testEmail = `test-restart-${Date.now()}@example.com`
    const testPassword = 'testpassword123'

    console.log('📝 Creating test user for restart...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test Restart User',
          username: 'testrestartuser'
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

    // 2. Verify user exists and onboarding is not complete
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const onboardingComplete = user.user_metadata?.onboarding_complete === true
      console.log('📊 User onboarding complete:', onboardingComplete)
      console.log('📊 User email:', user.email)
      console.log('📊 User ID:', user.id)
    }

    // 3. Test the profile restart API
    console.log('🚀 Calling profile restart API...')
    const response = await fetch('/api/profile/restart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.session.access_token}`
      }
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Profile restart successful:', result)
    } else {
      console.error('❌ Profile restart failed:', result)
    }

    // 4. Verify user was deleted
    console.log('🔍 Verifying user was deleted...')
    const { data: { user: deletedUser } } = await supabase.auth.getUser()
    
    if (deletedUser) {
      console.log('❌ User still exists after restart')
    } else {
      console.log('✅ User successfully deleted')
    }

    // 5. Test restart API with completed user (should fail)
    console.log('🔄 Testing restart with completed user...')
    
    // Create a user with completed profile
    const completedEmail = `test-completed-${Date.now()}@example.com`
    const { data: completedAuthData, error: completedAuthError } = await supabase.auth.signUp({
      email: completedEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test Completed User',
          username: 'testcompleteduser',
          onboarding_complete: true
        }
      }
    })

    if (completedAuthError || !completedAuthData.session) {
      console.log('📧 Completed user needs email confirmation, skipping test')
    } else {
      // Create profile in database
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .insert({
          id: completedAuthData.user.id,
          email: completedAuthData.user.email!,
          full_name: 'Test Completed User',
          username: 'testcompleteduser'
        })
        .select()
        .single()

      if (userError) {
        console.error('❌ Error creating user profile:', userError)
      } else {
        console.log('✅ Completed user profile created')

        // Try to restart completed user (should fail)
        const restartResponse = await fetch('/api/profile/restart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${completedAuthData.session.access_token}`
          }
        })

        const restartResult = await restartResponse.json()

        if (restartResponse.status === 400) {
          console.log('✅ Restart correctly rejected for completed user:', restartResult.message)
        } else {
          console.error('❌ Restart should have been rejected for completed user:', restartResult)
        }

        // Clean up completed user
        const { error: deleteError } = await supabase.auth.admin.deleteUser(completedAuthData.user.id)
        if (deleteError) {
          console.error('⚠️ Error deleting completed user:', deleteError)
        } else {
          console.log('✅ Completed user cleaned up')
        }
      }
    }

    console.log('✅ Profile restart test completed successfully')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testProfileRestart()
