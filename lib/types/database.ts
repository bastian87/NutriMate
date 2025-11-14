export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          name: string
          image_url: string | null
          calories: number
          created_by?: string | null
          is_private?: boolean | null
          created_at: string
          updated_at: string
          // Legacy fields may exist in database but are not used in application
          // Removed from types to simplify schema: description, prep_time_minutes, cook_time_minutes,
          // servings, protein, carbs, fat, fiber, sugar, sodium, difficulty_level, cuisine_type,
          // meal_type, instructions
        }
        Insert: {
          id?: string
          name: string
          image_url?: string | null
          calories?: number
          created_by?: string | null
          is_private?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          image_url?: string | null
          calories?: number
          created_at?: string
          updated_at?: string
        }
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          name: string
          amount: string
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          name: string
          amount: string
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          name?: string
          amount?: string
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
      goals: {
        Row: {
          id: string
          user_id: string
          start_date: string
          end_date: string | null
          target_kcal_day: number
          target_kcal_week: number
          target_kcal_month: number
          objective: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_date: string
          end_date?: string | null
          target_kcal_day: number
          target_kcal_week: number
          target_kcal_month: number
          objective: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_date?: string
          end_date?: string | null
          target_kcal_day?: number
          target_kcal_week?: number
          target_kcal_month?: number
          objective?: string
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
          max_prep_time: number | null
          macro_priority: string | null
          allergies: string[] | null
          intolerances: string[] | null
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
          max_prep_time?: number | null
          macro_priority?: string | null
          allergies?: string[] | null
          intolerances?: string[] | null
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
          max_prep_time?: number | null
          macro_priority?: string | null
          allergies?: string[] | null
          intolerances?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string
          subject: string
          message: string
          priority: string
          status: string
          is_premium: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          message: string
          priority?: string
          status?: string
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          message?: string
          priority?: string
          status?: string
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          subscription_id: string
          status: string
          customer_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id: string
          status: string
          customer_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string
          status?: string
          customer_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      food_diary_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          time: string
          category: string
          menu: string
          amount: string | null
          carb: number
          protein: number
          fats: number
          sugar: number
          calories: number | null
          thoughts: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          time: string
          category: string
          menu: string
          amount?: string | null
          carb?: number
          protein?: number
          fats?: number
          sugar?: number
          calories?: number | null
          thoughts?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          time?: string
          category?: string
          menu?: string
          amount?: string | null
          carb?: number
          protein?: number
          fats?: number
          sugar?: number
          calories?: number | null
          thoughts?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
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

export type UserPreferences = {
  id: string;
  user_id: string;
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  activity_level: string | null;
  health_goal: string | null;
  calorie_target: number | null;
  dietary_preferences: string[] | null;
  excluded_ingredients: string[] | null;
  include_snacks: boolean | null;
  max_prep_time: number | null;
  macro_priority: string | null;
  allergies: string[] | null;
  intolerances: string[] | null;
  created_at: string;
  updated_at: string;
};
