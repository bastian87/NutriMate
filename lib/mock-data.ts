// Mock data for the application

// User preferences
export interface UserPreferences {
  id: string
  userId: string
  age?: number
  gender?: string
  height?: number // in cm
  weight?: number // in kg
  activityLevel?: string
  healthGoal: string
  calorieTarget: number
  dietaryPreferences: string[]
  excludedIngredients: string[]
}

// Recipe and meal plan types
export interface Ingredient {
  id: string
  name: string
  quantity: string
  unit: string | null
}

export interface Recipe {
  id: string
  name: string
  description: string | null
  instructions: string
  prepTimeMinutes: number
  cookTimeMinutes: number
  servings: number
  calories: number
  protein: number
  carbs: number
  fat: number
  imageUrl: string | null
  ingredients: Ingredient[]
  tags: { id: string; name: string }[]
}

export interface Meal {
  id: string
  day: number
  mealType: string
  recipe: Recipe
}

export interface MealPlan {
  id: string
  userId: string
  startDate: string
  endDate: string
  meals: Meal[]
}

// Mock recipes
export const mockRecipes: Recipe[] = [
  {
    id: "recipe1",
    name: "Greek Yogurt Parfait with Berries",
    description:
      "A nutritious and delicious breakfast parfait with layers of Greek yogurt, fresh berries, and crunchy granola.",
    instructions:
      "1. In a bowl, mix the Greek yogurt with vanilla extract.\n2. In a glass or jar, create alternating layers starting with yogurt, then berries, then granola.\n3. Repeat the layers until all ingredients are used, finishing with berries on top.\n4. Drizzle with honey or maple syrup.\n5. Sprinkle chia seeds on top if using.",
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    servings: 1,
    calories: 320,
    protein: 18,
    carbs: 42,
    fat: 10,
    imageUrl: "/placeholder.svg?height=200&width=300&text=Greek+Yogurt+Parfait",
    ingredients: [
      { id: "ing1", name: "Greek yogurt", quantity: "1", unit: "cup" },
      { id: "ing2", name: "Mixed berries", quantity: "1/2", unit: "cup" },
      { id: "ing3", name: "Granola", quantity: "1/4", unit: "cup" },
      { id: "ing4", name: "Honey", quantity: "1", unit: "tbsp" },
      { id: "ing5", name: "Chia seeds", quantity: "1", unit: "tsp" },
    ],
    tags: [
      { id: "tag1", name: "breakfast" },
      { id: "tag2", name: "vegetarian" },
      { id: "tag3", name: "high-protein" },
    ],
  },
  {
    id: "recipe2",
    name: "Mediterranean Quinoa Salad",
    description: "A refreshing and nutritious salad with protein-rich quinoa, fresh vegetables, and tangy feta cheese.",
    instructions:
      "1. Cook quinoa according to package instructions and let cool.\n2. Chop cucumber, tomatoes, red onion, and bell pepper.\n3. Mix vegetables with quinoa in a large bowl.\n4. Add olives and crumbled feta cheese.\n5. Whisk together olive oil, lemon juice, garlic, salt, and pepper for the dressing.\n6. Pour dressing over salad and toss to combine.\n7. Garnish with fresh herbs before serving.",
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    servings: 4,
    calories: 320,
    protein: 10,
    carbs: 42,
    fat: 14,
    imageUrl: "/placeholder.svg?height=200&width=300&text=Mediterranean+Quinoa+Salad",
    ingredients: [
      { id: "ing6", name: "Quinoa", quantity: "1", unit: "cup" },
      { id: "ing7", name: "Cucumber", quantity: "1", unit: "medium" },
      { id: "ing8", name: "Cherry tomatoes", quantity: "1", unit: "cup" },
      { id: "ing9", name: "Red onion", quantity: "1/2", unit: "medium" },
      { id: "ing10", name: "Bell pepper", quantity: "1", unit: "medium" },
      { id: "ing11", name: "Kalamata olives", quantity: "1/3", unit: "cup" },
      { id: "ing12", name: "Feta cheese", quantity: "1/2", unit: "cup" },
      { id: "ing13", name: "Olive oil", quantity: "3", unit: "tbsp" },
      { id: "ing14", name: "Lemon juice", quantity: "2", unit: "tbsp" },
      { id: "ing15", name: "Garlic", quantity: "1", unit: "clove" },
      { id: "ing16", name: "Fresh parsley", quantity: "1/4", unit: "cup" },
      { id: "ing17", name: "Fresh mint", quantity: "2", unit: "tbsp" },
    ],
    tags: [
      { id: "tag4", name: "lunch" },
      { id: "tag5", name: "vegetarian" },
      { id: "tag6", name: "mediterranean" },
    ],
  },
  {
    id: "recipe3",
    name: "Grilled Salmon with Roasted Vegetables",
    description: "Perfectly grilled salmon served with a colorful medley of roasted vegetables.",
    instructions:
      "1. Preheat oven to 425°F (220°C).\n2. Toss vegetables with olive oil, salt, and pepper on a baking sheet.\n3. Roast vegetables for 20-25 minutes, stirring halfway through.\n4. Season salmon with salt, pepper, and herbs.\n5. Grill or pan-sear salmon for 3-4 minutes per side until cooked through.\n6. Serve salmon with roasted vegetables and lemon wedges.",
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    servings: 2,
    calories: 420,
    protein: 35,
    carbs: 20,
    fat: 22,
    imageUrl: "/placeholder.svg?height=200&width=300&text=Grilled+Salmon+with+Roasted+Vegetables",
    ingredients: [
      { id: "ing18", name: "Salmon fillets", quantity: "2", unit: "6 oz fillets" },
      { id: "ing19", name: "Zucchini", quantity: "1", unit: "medium" },
      { id: "ing20", name: "Bell peppers", quantity: "2", unit: "medium" },
      { id: "ing21", name: "Red onion", quantity: "1", unit: "small" },
      { id: "ing22", name: "Cherry tomatoes", quantity: "1", unit: "cup" },
      { id: "ing23", name: "Olive oil", quantity: "2", unit: "tbsp" },
      { id: "ing24", name: "Lemon", quantity: "1", unit: "medium" },
      { id: "ing25", name: "Fresh dill", quantity: "2", unit: "tbsp" },
      { id: "ing26", name: "Garlic powder", quantity: "1/2", unit: "tsp" },
    ],
    tags: [
      { id: "tag7", name: "dinner" },
      { id: "tag8", name: "high-protein" },
      { id: "tag9", name: "pescatarian" },
    ],
  },
  {
    id: "recipe4",
    name: "Vegetable Stir-Fry with Tofu",
    description: "A quick and flavorful stir-fry with crispy tofu and colorful vegetables.",
    instructions:
      "1. Press and drain tofu, then cut into cubes.\n2. Toss tofu with cornstarch, salt, and pepper.\n3. Heat oil in a wok or large pan and cook tofu until crispy on all sides.\n4. Remove tofu and set aside.\n5. In the same pan, stir-fry vegetables until tender-crisp.\n6. Add garlic, ginger, and stir-fry sauce.\n7. Return tofu to the pan and toss to combine.\n8. Serve over rice or noodles, garnished with green onions and sesame seeds.",
    prepTimeMinutes: 20,
    cookTimeMinutes: 15,
    servings: 4,
    calories: 300,
    protein: 15,
    carbs: 30,
    fat: 12,
    imageUrl: "/placeholder.svg?height=200&width=300&text=Vegetable+Stir-Fry+with+Tofu",
    ingredients: [
      { id: "ing27", name: "Firm tofu", quantity: "14", unit: "oz" },
      { id: "ing28", name: "Broccoli", quantity: "2", unit: "cups" },
      { id: "ing29", name: "Carrots", quantity: "2", unit: "medium" },
      { id: "ing30", name: "Bell peppers", quantity: "2", unit: "medium" },
      { id: "ing31", name: "Snow peas", quantity: "1", unit: "cup" },
      { id: "ing32", name: "Garlic", quantity: "3", unit: "cloves" },
      { id: "ing33", name: "Ginger", quantity: "1", unit: "tbsp" },
      { id: "ing34", name: "Soy sauce", quantity: "3", unit: "tbsp" },
      { id: "ing35", name: "Sesame oil", quantity: "1", unit: "tbsp" },
      { id: "ing36", name: "Cornstarch", quantity: "1", unit: "tbsp" },
      { id: "ing37", name: "Green onions", quantity: "3", unit: "stalks" },
      { id: "ing38", name: "Sesame seeds", quantity: "1", unit: "tbsp" },
    ],
    tags: [
      { id: "tag10", name: "dinner" },
      { id: "tag11", name: "vegan" },
      { id: "tag12", name: "asian" },
    ],
  },
  {
    id: "recipe5",
    name: "Avocado Toast with Poached Egg",
    description:
      "A simple yet satisfying breakfast with creamy avocado and perfectly poached eggs on whole grain toast.",
    instructions:
      "1. Bring a pot of water to a gentle simmer for poaching eggs.\n2. Toast the bread slices.\n3. Mash avocado with lime juice, salt, and pepper.\n4. Spread avocado mixture on toast.\n5. Poach eggs for 3-4 minutes.\n6. Place poached eggs on top of avocado toast.\n7. Sprinkle with red pepper flakes, salt, and pepper.\n8. Garnish with fresh herbs if desired.",
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    servings: 2,
    calories: 350,
    protein: 14,
    carbs: 30,
    fat: 20,
    imageUrl: "/placeholder.svg?height=200&width=300&text=Avocado+Toast+with+Poached+Egg",
    ingredients: [
      { id: "ing39", name: "Whole grain bread", quantity: "2", unit: "slices" },
      { id: "ing40", name: "Avocado", quantity: "1", unit: "large" },
      { id: "ing41", name: "Eggs", quantity: "2", unit: "large" },
      { id: "ing42", name: "Lime juice", quantity: "1", unit: "tsp" },
      { id: "ing43", name: "Red pepper flakes", quantity: "1/4", unit: "tsp" },
      { id: "ing44", name: "Fresh cilantro", quantity: "1", unit: "tbsp" },
      { id: "ing45", name: "Salt", quantity: "1/4", unit: "tsp" },
      { id: "ing46", name: "Black pepper", quantity: "1/4", unit: "tsp" },
    ],
    tags: [
      { id: "tag13", name: "breakfast" },
      { id: "tag14", name: "vegetarian" },
      { id: "tag15", name: "high-protein" },
    ],
  },
  {
    id: "recipe6",
    name: "Chickpea and Vegetable Curry",
    description: "A hearty and flavorful vegetable curry with protein-rich chickpeas in a creamy coconut sauce.",
    instructions:
      "1. Heat oil in a large pot over medium heat.\n2. Add onion, garlic, and ginger, and sauté until fragrant.\n3. Add curry powder, turmeric, cumin, and coriander, and cook for 1 minute.\n4. Add diced vegetables and cook for 5 minutes.\n5. Add chickpeas, coconut milk, and vegetable broth.\n6. Simmer for 15-20 minutes until vegetables are tender.\n7. Stir in lime juice and fresh cilantro.\n8. Serve over rice or with naan bread.",
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    servings: 4,
    calories: 380,
    protein: 12,
    carbs: 45,
    fat: 18,
    imageUrl: "/placeholder.svg?height=200&width=300&text=Chickpea+and+Vegetable+Curry",
    ingredients: [
      { id: "ing47", name: "Chickpeas", quantity: "2", unit: "cans (15 oz each)" },
      { id: "ing48", name: "Coconut milk", quantity: "1", unit: "can (14 oz)" },
      { id: "ing49", name: "Onion", quantity: "1", unit: "large" },
      { id: "ing50", name: "Garlic", quantity: "3", unit: "cloves" },
      { id: "ing51", name: "Ginger", quantity: "1", unit: "tbsp" },
      { id: "ing52", name: "Curry powder", quantity: "2", unit: "tbsp" },
      { id: "ing53", name: "Turmeric", quantity: "1", unit: "tsp" },
      { id: "ing54", name: "Cumin", quantity: "1", unit: "tsp" },
      { id: "ing55", name: "Coriander", quantity: "1", unit: "tsp" },
      { id: "ing56", name: "Cauliflower", quantity: "2", unit: "cups" },
      { id: "ing57", name: "Carrots", quantity: "2", unit: "medium" },
      { id: "ing58", name: "Bell pepper", quantity: "1", unit: "large" },
      { id: "ing59", name: "Vegetable broth", quantity: "1", unit: "cup" },
      { id: "ing60", name: "Lime juice", quantity: "2", unit: "tbsp" },
      { id: "ing61", name: "Fresh cilantro", quantity: "1/4", unit: "cup" },
    ],
    tags: [
      { id: "tag16", name: "dinner" },
      { id: "tag17", name: "vegan" },
      { id: "tag18", name: "indian" },
    ],
  },
]

// Mock meal plan
export const mockMealPlan: MealPlan = {
  id: "mealplan1",
  userId: "user1",
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  meals: [
    // Day 1
    {
      id: "meal1",
      day: 1,
      mealType: "breakfast",
      recipe: mockRecipes[0], // Greek Yogurt Parfait
    },
    {
      id: "meal2",
      day: 1,
      mealType: "lunch",
      recipe: mockRecipes[1], // Mediterranean Quinoa Salad
    },
    {
      id: "meal3",
      day: 1,
      mealType: "dinner",
      recipe: mockRecipes[2], // Grilled Salmon
    },
    // Day 2
    {
      id: "meal4",
      day: 2,
      mealType: "breakfast",
      recipe: mockRecipes[4], // Avocado Toast
    },
    {
      id: "meal5",
      day: 2,
      mealType: "lunch",
      recipe: mockRecipes[1], // Mediterranean Quinoa Salad
    },
    {
      id: "meal6",
      day: 2,
      mealType: "dinner",
      recipe: mockRecipes[3], // Vegetable Stir-Fry
    },
    // Day 3
    {
      id: "meal7",
      day: 3,
      mealType: "breakfast",
      recipe: mockRecipes[0], // Greek Yogurt Parfait
    },
    {
      id: "meal8",
      day: 3,
      mealType: "lunch",
      recipe: mockRecipes[3], // Vegetable Stir-Fry
    },
    {
      id: "meal9",
      day: 3,
      mealType: "dinner",
      recipe: mockRecipes[5], // Chickpea Curry
    },
    // Day 4
    {
      id: "meal10",
      day: 4,
      mealType: "breakfast",
      recipe: mockRecipes[4], // Avocado Toast
    },
    {
      id: "meal11",
      day: 4,
      mealType: "lunch",
      recipe: mockRecipes[5], // Chickpea Curry
    },
    {
      id: "meal12",
      day: 4,
      mealType: "dinner",
      recipe: mockRecipes[2], // Grilled Salmon
    },
    // Day 5
    {
      id: "meal13",
      day: 5,
      mealType: "breakfast",
      recipe: mockRecipes[0], // Greek Yogurt Parfait
    },
    {
      id: "meal14",
      day: 5,
      mealType: "lunch",
      recipe: mockRecipes[1], // Mediterranean Quinoa Salad
    },
    {
      id: "meal15",
      day: 5,
      mealType: "dinner",
      recipe: mockRecipes[3], // Vegetable Stir-Fry
    },
    // Day 6
    {
      id: "meal16",
      day: 6,
      mealType: "breakfast",
      recipe: mockRecipes[4], // Avocado Toast
    },
    {
      id: "meal17",
      day: 6,
      mealType: "lunch",
      recipe: mockRecipes[5], // Chickpea Curry
    },
    {
      id: "meal18",
      day: 6,
      mealType: "dinner",
      recipe: mockRecipes[2], // Grilled Salmon
    },
    // Day 7
    {
      id: "meal19",
      day: 7,
      mealType: "breakfast",
      recipe: mockRecipes[0], // Greek Yogurt Parfait
    },
    {
      id: "meal20",
      day: 7,
      mealType: "lunch",
      recipe: mockRecipes[1], // Mediterranean Quinoa Salad
    },
    {
      id: "meal21",
      day: 7,
      mealType: "dinner",
      recipe: mockRecipes[5], // Chickpea Curry
    },
  ],
}

// Mock grocery list
export const mockGroceryList = {
  produce: [
    { name: "Mixed berries", quantity: "3.5", unit: "cups", recipes: ["Greek Yogurt Parfait"], checked: false },
    { name: "Cucumber", quantity: "1", unit: "medium", recipes: ["Mediterranean Quinoa Salad"], checked: false },
    {
      name: "Cherry tomatoes",
      quantity: "2",
      unit: "cups",
      recipes: ["Mediterranean Quinoa Salad", "Grilled Salmon"],
      checked: false,
    },
    {
      name: "Red onion",
      quantity: "2",
      unit: "medium",
      recipes: ["Mediterranean Quinoa Salad", "Grilled Salmon"],
      checked: false,
    },
    {
      name: "Bell peppers",
      quantity: "5",
      unit: "medium",
      recipes: ["Mediterranean Quinoa Salad", "Grilled Salmon", "Vegetable Stir-Fry"],
      checked: false,
    },
    { name: "Zucchini", quantity: "1", unit: "medium", recipes: ["Grilled Salmon"], checked: false },
    { name: "Lemon", quantity: "1", unit: "medium", recipes: ["Grilled Salmon"], checked: false },
    { name: "Fresh dill", quantity: "2", unit: "tbsp", recipes: ["Grilled Salmon"], checked: false },
    { name: "Broccoli", quantity: "2", unit: "cups", recipes: ["Vegetable Stir-Fry"], checked: false },
    {
      name: "Carrots",
      quantity: "4",
      unit: "medium",
      recipes: ["Vegetable Stir-Fry", "Chickpea Curry"],
      checked: false,
    },
    { name: "Snow peas", quantity: "1", unit: "cup", recipes: ["Vegetable Stir-Fry"], checked: false },
    {
      name: "Garlic",
      quantity: "7",
      unit: "cloves",
      recipes: ["Mediterranean Quinoa Salad", "Vegetable Stir-Fry", "Chickpea Curry"],
      checked: false,
    },
    { name: "Ginger", quantity: "2", unit: "tbsp", recipes: ["Vegetable Stir-Fry", "Chickpea Curry"], checked: false },
    { name: "Green onions", quantity: "3", unit: "stalks", recipes: ["Vegetable Stir-Fry"], checked: false },
    { name: "Avocado", quantity: "2", unit: "large", recipes: ["Avocado Toast"], checked: false },
    { name: "Lime", quantity: "2", unit: "", recipes: ["Avocado Toast", "Chickpea Curry"], checked: false },
    {
      name: "Fresh cilantro",
      quantity: "1/3",
      unit: "cup",
      recipes: ["Avocado Toast", "Chickpea Curry"],
      checked: false,
    },
    { name: "Cauliflower", quantity: "2", unit: "cups", recipes: ["Chickpea Curry"], checked: false },
  ],
  dairy: [
    { name: "Greek yogurt", quantity: "7", unit: "cups", recipes: ["Greek Yogurt Parfait"], checked: false },
    { name: "Feta cheese", quantity: "1/2", unit: "cup", recipes: ["Mediterranean Quinoa Salad"], checked: false },
    { name: "Eggs", quantity: "4", unit: "large", recipes: ["Avocado Toast"], checked: false },
  ],
  protein: [
    { name: "Salmon fillets", quantity: "6", unit: "6 oz fillets", recipes: ["Grilled Salmon"], checked: false },
    { name: "Firm tofu", quantity: "14", unit: "oz", recipes: ["Vegetable Stir-Fry"], checked: false },
    { name: "Chickpeas", quantity: "2", unit: "cans (15 oz each)", recipes: ["Chickpea Curry"], checked: false },
  ],
  grains: [
    { name: "Granola", quantity: "1.75", unit: "cups", recipes: ["Greek Yogurt Parfait"], checked: false },
    { name: "Quinoa", quantity: "1", unit: "cup", recipes: ["Mediterranean Quinoa Salad"], checked: false },
    { name: "Whole grain bread", quantity: "4", unit: "slices", recipes: ["Avocado Toast"], checked: false },
  ],
  pantry: [
    { name: "Honey", quantity: "7", unit: "tbsp", recipes: ["Greek Yogurt Parfait"], checked: false },
    { name: "Chia seeds", quantity: "7", unit: "tsp", recipes: ["Greek Yogurt Parfait"], checked: false },
    { name: "Kalamata olives", quantity: "1/3", unit: "cup", recipes: ["Mediterranean Quinoa Salad"], checked: false },
    {
      name: "Olive oil",
      quantity: "5",
      unit: "tbsp",
      recipes: ["Mediterranean Quinoa Salad", "Grilled Salmon"],
      checked: false,
    },
    { name: "Fresh parsley", quantity: "1/4", unit: "cup", recipes: ["Mediterranean Quinoa Salad"], checked: false },
    { name: "Fresh mint", quantity: "2", unit: "tbsp", recipes: ["Mediterranean Quinoa Salad"], checked: false },
    { name: "Garlic powder", quantity: "1/2", unit: "tsp", recipes: ["Grilled Salmon"], checked: false },
    { name: "Soy sauce", quantity: "3", unit: "tbsp", recipes: ["Vegetable Stir-Fry"], checked: false },
    { name: "Sesame oil", quantity: "1", unit: "tbsp", recipes: ["Vegetable Stir-Fry"], checked: false },
    { name: "Cornstarch", quantity: "1", unit: "tbsp", recipes: ["Vegetable Stir-Fry"], checked: false },
    { name: "Sesame seeds", quantity: "1", unit: "tbsp", recipes: ["Vegetable Stir-Fry"], checked: false },
    { name: "Red pepper flakes", quantity: "1/4", unit: "tsp", recipes: ["Avocado Toast"], checked: false },
    { name: "Salt", quantity: "1", unit: "tsp", recipes: ["Avocado Toast", "Chickpea Curry"], checked: false },
    {
      name: "Black pepper",
      quantity: "1/2",
      unit: "tsp",
      recipes: ["Avocado Toast", "Chickpea Curry"],
      checked: false,
    },
    { name: "Coconut milk", quantity: "1", unit: "can (14 oz)", recipes: ["Chickpea Curry"], checked: false },
    { name: "Curry powder", quantity: "2", unit: "tbsp", recipes: ["Chickpea Curry"], checked: false },
    { name: "Turmeric", quantity: "1", unit: "tsp", recipes: ["Chickpea Curry"], checked: false },
    { name: "Cumin", quantity: "1", unit: "tsp", recipes: ["Chickpea Curry"], checked: false },
    { name: "Coriander", quantity: "1", unit: "tsp", recipes: ["Chickpea Curry"], checked: false },
    { name: "Vegetable broth", quantity: "1", unit: "cup", recipes: ["Chickpea Curry"], checked: false },
  ],
  other: [],
}

// Mock user preferences
export const mockUserPreferences: UserPreferences = {
  id: "pref1",
  userId: "user1",
  age: 30,
  gender: "male",
  height: 175, // in cm
  weight: 70, // in kg
  activityLevel: "moderate",
  healthGoal: "weight_loss",
  calorieTarget: 1800,
  dietaryPreferences: ["vegetarian"],
  excludedIngredients: ["mushrooms", "eggplant"],
}
