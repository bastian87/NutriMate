"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuthContext } from "@/components/auth/simple-auth-provider"

interface QuickMealLoggerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface RecentItem {
  menu: string
  calories: number
  category: string
}

interface Ingredient {
  id?: string
  name: string
  quantity: number
  unit: string
  calories: number
  carbs: number
  protein: number
  fats: number
}

export function QuickMealLogger({ open, onOpenChange, onSuccess }: QuickMealLoggerProps) {
  const { user } = useAuthContext()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [calories, setCalories] = useState("")
  const [category, setCategory] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast")
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [menu, setMenu] = useState("")
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [ingredientSearch, setIngredientSearch] = useState<{[key: string]: string}>({})

  // Fetch recent items
  useEffect(() => {
    if (open && user?.id) {
      fetchRecentItems()
      if (advancedMode) {
        fetchIngredients()
      }
    }
  }, [open, user?.id, advancedMode])

  const fetchRecentItems = async () => {
    try {
      const response = await fetch("/api/food-entries?limit=20")
      if (response.ok) {
        const data = await response.json()
        const entries = data.entries || []
        
        // Get unique recent items (last 20 unique menu items)
        const uniqueItems = new Map<string, RecentItem>()
        entries.forEach((entry: any) => {
          if (entry.menu && !uniqueItems.has(entry.menu.toLowerCase())) {
            uniqueItems.set(entry.menu.toLowerCase(), {
              menu: entry.menu,
              calories: entry.calories || 0,
              category: entry.category
            })
          }
        })
        
        setRecentItems(Array.from(uniqueItems.values()).slice(0, 12))
      }
    } catch (error) {
      console.error("Error fetching recent items:", error)
    }
  }

  const fetchIngredients = async () => {
    try {
      const response = await fetch("/api/ingredients")
      if (response.ok) {
        const data = await response.json()
        setAvailableIngredients(data.ingredients || [])
      }
    } catch (error) {
      console.error("Error fetching ingredients:", error)
    }
  }

  const handleQuickSelect = (item: RecentItem) => {
    setMenu(item.menu)
    setCalories(item.calories.toString())
    setCategory(item.category as any)
    setSearchQuery("")
  }

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      name: "",
      quantity: 0,
      unit: "g",
      calories: 0,
      carbs: 0,
      protein: 0,
      fats: 0
    }
    setIngredients([...ingredients, newIngredient])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], [field]: value }
    
    // Auto-calculate when selecting from database
    if (field === 'name' && value && availableIngredients.length > 0) {
      const dbIngredient = availableIngredients.find(ing => ing.name === value)
      if (dbIngredient) {
        updated[index] = {
          ...updated[index],
          name: dbIngredient.name,
          calories: Math.round((dbIngredient.kcal_per_100g * (updated[index].quantity || 100)) / 100),
          carbs: Math.round((dbIngredient.kcal_per_100g * (updated[index].quantity || 100)) / 100 * 0.4), // Estimate
          protein: Math.round((dbIngredient.kcal_per_100g * (updated[index].quantity || 100)) / 100 * 0.3), // Estimate
          fats: Math.round((dbIngredient.kcal_per_100g * (updated[index].quantity || 100)) / 100 * 0.3) // Estimate
        }
      }
    }
    
    // Recalculate calories when quantity changes
    if (field === 'quantity' && updated[index].name) {
      const dbIngredient = availableIngredients.find(ing => ing.name === updated[index].name)
      if (dbIngredient) {
        updated[index].calories = Math.round((dbIngredient.kcal_per_100g * Number(value)) / 100)
      }
    }
    
    setIngredients(updated)
  }

  const calculateTotalCalories = () => {
    if (advancedMode) {
      return ingredients.reduce((sum, ing) => sum + ing.calories, 0)
    }
    return parseFloat(calories) || 0
  }

  const calculateMacros = () => {
    return ingredients.reduce((acc, ing) => ({
      carbs: acc.carbs + ing.carbs,
      protein: acc.protein + ing.protein,
      fats: acc.fats + ing.fats
    }), { carbs: 0, protein: 0, fats: 0 })
  }

  const handleSubmit = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please sign in to log meals",
        variant: "destructive"
      })
      return
    }

    if (advancedMode) {
      if (ingredients.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one ingredient",
          variant: "destructive"
        })
        return
      }
    } else {
      if (!menu.trim() && !searchQuery.trim()) {
        toast({
          title: "Error",
          description: "Please enter a meal name or select from recent items",
          variant: "destructive"
        })
        return
      }

      if (!calories || parseFloat(calories) <= 0) {
        toast({
          title: "Error",
          description: "Please enter valid calories",
          variant: "destructive"
        })
        return
      }
    }

    setLoading(true)
    try {
      const macros = advancedMode ? calculateMacros() : { carbs: 0, protein: 0, fats: 0 }
      const totalCalories = calculateTotalCalories()
      const mealName = advancedMode 
        ? ingredients.map(ing => ing.name).join(', ')
        : (menu || searchQuery)

      const response = await fetch("/api/food-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify({
          category,
          menu: mealName,
          calories: totalCalories,
          carb: macros.carbs,
          protein: macros.protein,
          fats: macros.fats,
          sugar: 0,
          amount: advancedMode ? `${ingredients.length} ingredients` : null,
          thoughts: null,
          image_url: null
        })
      })

      if (response.ok) {
        const result = await response.json()
        const xpAwarded = result.xpAwarded || 0
        
        toast({
          title: "Success",
          description: xpAwarded > 0 
            ? `Meal logged! +${xpAwarded} XP earned! 🎉`
            : "Meal logged successfully!"
        })
        
        // Reset form
        setMenu("")
        setSearchQuery("")
        setCalories("")
        setCategory("breakfast")
        setAdvancedMode(false)
        setIngredients([])
        
        onSuccess?.()
        onOpenChange(false)
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to log meal",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log meal. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredRecentItems = useMemo(() => {
    if (!searchQuery.trim()) return recentItems
    const query = searchQuery.toLowerCase()
    return recentItems.filter(item => 
      item.menu.toLowerCase().includes(query)
    )
  }, [recentItems, searchQuery])

  const filteredIngredients = (searchValue: string) => {
    if (!searchValue.trim()) return availableIngredients.slice(0, 10)
    const query = searchValue.toLowerCase()
    return availableIngredients
      .filter(ing => ing.name.toLowerCase().includes(query))
      .slice(0, 10)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Quick Log Meal</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search or type meal name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (e.target.value && !advancedMode) {
                  setMenu(e.target.value)
                }
              }}
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !advancedMode && calories) {
                  handleSubmit()
                }
              }}
              autoFocus
            />
          </div>

          {/* Recent Items Chips */}
          {!advancedMode && recentItems.length > 0 && !searchQuery && (
            <div>
              <Label className="text-xs text-gray-500 mb-2 block">Recent Meals</Label>
              <div className="flex flex-wrap gap-2">
                {recentItems.map((item, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-orange-100 hover:text-orange-700 transition-colors px-3 py-1.5 text-sm"
                    onClick={() => handleQuickSelect(item)}
                  >
                    {item.menu} <span className="text-orange-600 ml-1">({item.calories} kcal)</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Quick Entry Form */}
          {!advancedMode && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Calories */}
                <div>
                  <Label htmlFor="calories">Calories *</Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="0"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="mt-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && menu) {
                        handleSubmit()
                      }
                    }}
                  />
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Meal *</Label>
                  <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                    <SelectTrigger id="category" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Meal Name (if not from search) */}
              {menu && !searchQuery && (
                <div>
                  <Label>Meal Name</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      value={menu}
                      onChange={(e) => setMenu(e.target.value)}
                      placeholder="Meal name"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMenu("")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Advanced Mode Toggle */}
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setAdvancedMode(!advancedMode)}
            >
              <span className="text-sm text-gray-600">
                {advancedMode ? "Simple Mode" : "Advanced Mode (Ingredients)"}
              </span>
              {advancedMode ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Advanced Mode Content */}
          {advancedMode && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold">Ingredients</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addIngredient}
                  className="h-8"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              {ingredients.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No ingredients added. Click "Add" to start.
                </p>
              ) : (
                <div className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Ingredient {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIngredient(index)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Name</Label>
                          <Input
                            placeholder="Search ingredient..."
                            value={ingredient.name}
                            onChange={(e) => {
                              updateIngredient(index, 'name', e.target.value)
                              setIngredientSearch({ ...ingredientSearch, [index]: e.target.value })
                            }}
                            className="h-8 text-sm"
                            list={`ingredient-list-${index}`}
                          />
                          <datalist id={`ingredient-list-${index}`}>
                            {filteredIngredients(ingredientSearch[index] || ingredient.name).map((ing) => (
                              <option key={ing.id} value={ing.name} />
                            ))}
                          </datalist>
                        </div>
                        <div>
                          <Label className="text-xs">Quantity (g)</Label>
                          <Input
                            type="number"
                            placeholder="100"
                            value={ingredient.quantity || ''}
                            onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      
                      {ingredient.calories > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {ingredient.calories} kcal
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {ingredients.length > 0 && (
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Calories:</span>
                    <span className="text-lg font-bold text-orange-600">
                      {calculateTotalCalories()} kcal
                    </span>
                  </div>
                </div>
              )}

              {/* Category selector for advanced mode */}
              <div>
                <Label htmlFor="category-advanced">Meal Category *</Label>
                <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                  <SelectTrigger id="category-advanced" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
            disabled={loading || (!advancedMode && !calories) || (advancedMode && ingredients.length === 0)}
          >
            {loading ? "Logging..." : "Log Meal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
