-- Create meal_plans table
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meal_plan_meals table
CREATE TABLE IF NOT EXISTS public.meal_plan_meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_subscriptions table (optional, for premium features)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON public.meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_created_at ON public.meal_plans(created_at);
CREATE INDEX IF NOT EXISTS idx_meal_plan_meals_meal_plan_id ON public.meal_plan_meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_meals_recipe_id ON public.meal_plan_meals(recipe_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can create their own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can update their own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can delete their own meal plans" ON public.meal_plans;

DROP POLICY IF EXISTS "Users can view meals from their meal plans" ON public.meal_plan_meals;
DROP POLICY IF EXISTS "Users can create meals for their meal plans" ON public.meal_plan_meals;
DROP POLICY IF EXISTS "Users can update meals from their meal plans" ON public.meal_plan_meals;
DROP POLICY IF EXISTS "Users can delete meals from their meal plans" ON public.meal_plan_meals;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;

-- Create RLS policies for meal_plans
CREATE POLICY "Users can view their own meal plans" ON public.meal_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal plans" ON public.meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans" ON public.meal_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans" ON public.meal_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for meal_plan_meals
CREATE POLICY "Users can view meals from their meal plans" ON public.meal_plan_meals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE meal_plans.id = meal_plan_meals.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create meals for their meal plans" ON public.meal_plan_meals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE meal_plans.id = meal_plan_meals.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update meals from their meal plans" ON public.meal_plan_meals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE meal_plans.id = meal_plan_meals.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete meals from their meal plans" ON public.meal_plan_meals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE meal_plans.id = meal_plan_meals.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

-- Create RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- No test data insertion - tables are ready for real user data
SELECT 'Meal plan tables created successfully! Ready for user data.' as message;
