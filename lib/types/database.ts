export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          prep_time_minutes: number
          cook_time_minutes: number
          servings: number
          calories: number
          protein: number
          carbs: number
          fat: number
          fiber: number | null
          sugar: number | null
          sodium: number | null
          difficulty_level: string | null
          cuisine_type: string | null
          meal_type: string | null
          instructions: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          prep_time_minutes?: number
          cook_time_minutes?: number
          servings?: number
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          fiber?: number | null
          sugar?: number | null
          sodium?: number | null
          difficulty_level?: string | null
          cuisine_type?: string | null
          meal_type?: string | null
          instructions?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          prep_time_minutes?: number
          cook_time_minutes?: number
          servings?: number
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          fiber?: number | null
          sugar?: number | null
          sodium?: number | null
          difficulty_level?: string | null
          cuisine_type?: string | null
          meal_type?: string | null
          instructions?: string
          created_at?: string
          updated_at?: string
        }
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          name: string
          quantity: string
          unit: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          name: string
          quantity: string
          unit?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          name?: string
          quantity?: string
          unit?: string | null
          created_at?: string
        }
      }
      recipe_ratings: {
        Row: {
          id: string
          recipe_id: string
          user_id: string
          rating: number
          review: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          user_id: string
          rating: number
          review?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          user_id?: string
          rating?: number
          review?: string | null
          created_at?: string
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          created_at?: string
        }
      }
      grocery_lists: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      grocery_list_items: {
        Row: {
          id: string
          grocery_list_id: string
          recipe_id: string | null
          name: string
          quantity: string | null
          unit: string | null
          category: string | null
          is_checked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          grocery_list_id: string
          recipe_id?: string | null
          name: string
          quantity?: string | null
          unit?: string | null
          category?: string | null
          is_checked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          grocery_list_id?: string
          recipe_id?: string | null
          name?: string
          quantity?: string | null
          unit?: string | null
          category?: string | null
          is_checked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          age: number | null
          gender: string | null
          height: number | null
          weight: number | null
          activity_level: string | null
          health_goal: string | null
          calorie_target: number | null
          dietary_preferences: string[] | null
          excluded_ingredients: string[] | null
          include_snacks: boolean | null
          allergies: string[] | null
          intolerances: string[] | null
          max_prep_time: number | null
          macro_priority: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          age?: number | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          activity_level?: string | null
          health_goal?: string | null
          calorie_target?: number | null
          dietary_preferences?: string[] | null
          excluded_ingredients?: string[] | null
          include_snacks?: boolean | null
          allergies?: string[] | null
          intolerances?: string[] | null
          max_prep_time?: number | null
          macro_priority?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          age?: number | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          activity_level?: string | null
          health_goal?: string | null
          calorie_target?: number | null
          dietary_preferences?: string[] | null
          excluded_ingredients?: string[] | null
          include_snacks?: boolean | null
          allergies?: string[] | null
          intolerances?: string[] | null
          max_prep_time?: number | null
          macro_priority?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      meal_plans: {
        Row: {
          id: string
          user_id: string
          name: string
          start_date: string
          end_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          start_date?: string
          end_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          start_date?: string
          end_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      meal_plan_meals: {
        Row: {
          id: string
          meal_plan_id: string
          recipe_id: string
          day_number: number
          meal_type: string
          created_at: string
        }
        Insert: {
          id?: string
          meal_plan_id: string
          recipe_id: string
          day_number?: number
          meal_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          meal_plan_id?: string
          recipe_id?: string
          day_number?: number
          meal_type?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
