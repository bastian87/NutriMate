import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function clearMockIngredients() {
  console.log('🧹 Clearing mock ingredients from database...')

  try {
    // First, let's see what ingredients we have
    const { data: ingredients, error: fetchError } = await supabase
      .from('ingredients')
      .select('*')

    if (fetchError) {
      console.error('❌ Error fetching ingredients:', fetchError)
      return
    }

    console.log(`📊 Found ${ingredients?.length || 0} ingredients in database`)

    if (ingredients && ingredients.length > 0) {
      console.log('📋 Current ingredients:')
      ingredients.forEach((ingredient, index) => {
        console.log(`${index + 1}. ${ingredient.name} (${ingredient.nutrition_data?.group || 'unknown group'})`)
      })

      // Delete all ingredients
      const { error: deleteError } = await supabase
        .from('ingredients')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (deleteError) {
        console.error('❌ Error deleting ingredients:', deleteError)
        return
      }

      console.log('✅ All ingredients have been cleared from the database')
    } else {
      console.log('ℹ️ No ingredients found in database')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the script
clearMockIngredients()
  .then(() => {
    console.log('🎉 Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
