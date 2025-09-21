import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testProfileFinalize() {
  try {
    console.log('🧪 Testing Profile Finalize API...')

    // 1. Create a test user
    const testEmail = `test-profile-${Date.now()}@example.com`
    const testPassword = 'testpassword123'

    console.log('📝 Creating test user...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          username: 'testuser'
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

    // 2. Test the profile finalize API
    const profileData = {
      full_name: 'Test User Final',
      username: 'testuserfinal',
      age: 30,
      gender: 'male',
      height: 175,
      weight: 70,
      activity_level: 'moderate',
      health_goal: 'maintain_weight',
      calorie_target: 2200,
      dietary_preferences: ['vegetarian'],
      excluded_ingredients: ['nuts'],
      include_snacks: false,
      allergies: [],
      intolerances: [],
      max_prep_time: 45,
      macro_priority: 'balanced'
    }

    console.log('🚀 Calling profile finalize API...')
    const response = await fetch('/api/profile/finalize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.session.access_token}`
      },
      body: JSON.stringify(profileData)
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Profile created successfully:', result)
    } else {
      console.error('❌ Error creating profile:', result)
    }

    // 3. Test duplicate profile creation (should fail)
    console.log('🔄 Testing duplicate profile creation...')
    const duplicateResponse = await fetch('/api/profile/finalize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.session.access_token}`
      },
      body: JSON.stringify(profileData)
    })

    const duplicateResult = await duplicateResponse.json()

    if (duplicateResponse.status === 409) {
      console.log('✅ Duplicate profile correctly rejected:', duplicateResult)
    } else {
      console.error('❌ Duplicate profile should have been rejected:', duplicateResult)
    }

    // 4. Clean up - delete the test user
    console.log('🧹 Cleaning up test user...')
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id)
    
    if (deleteError) {
      console.error('⚠️ Error deleting test user:', deleteError)
    } else {
      console.log('✅ Test user deleted successfully')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testProfileFinalize()
