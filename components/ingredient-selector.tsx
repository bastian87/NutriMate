import { useState, useEffect } from 'react'
import { Search, X, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useIngredients, Ingredient } from '@/hooks/use-ingredients'

interface IngredientSelectorProps {
  selectedIngredients: Array<{ name: string; amount: string }>
  onIngredientsChange: (ingredients: Array<{ name: string; amount: string }>) => void
}

export function IngredientSelector({ selectedIngredients, onIngredientsChange }: IngredientSelectorProps) {
  const { ingredients, loading } = useIngredients()
  const [searchTerm, setSearchTerm] = useState('')
  const [showSelector, setShowSelector] = useState(false)

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addIngredient = (ingredient: Ingredient) => {
    const newIngredient = { name: ingredient.name, amount: '' }
    onIngredientsChange([...selectedIngredients, newIngredient])
    setSearchTerm('')
    setShowSelector(false)
  }

  const addManualIngredient = () => {
    if (searchTerm.trim()) {
      const newIngredient = { name: searchTerm.trim(), amount: '' }
      onIngredientsChange([...selectedIngredients, newIngredient])
      setSearchTerm('')
      setShowSelector(false)
    }
  }

  const removeIngredient = (index: number) => {
    const newIngredients = selectedIngredients.filter((_, i) => i !== index)
    onIngredientsChange(newIngredients)
  }

  const updateIngredientAmount = (index: number, amount: string) => {
    const newIngredients = selectedIngredients.map((ingredient, i) =>
      i === index ? { ...ingredient, amount } : ingredient
    )
    onIngredientsChange(newIngredients)
  }

  const getGroupColor = (group: string) => {
    const colors = {
      carb: 'bg-pastel-blue-100 text-pastel-blue-800 border-pastel-blue-200',
      protein: 'bg-pastel-purple-100 text-pastel-purple-800 border-pastel-purple-200',
      fat: 'bg-pastel-orange-100 text-pastel-orange-800 border-pastel-orange-200',
      vegfruit: 'bg-pastel-green-100 text-pastel-green-800 border-pastel-green-200',
      treat: 'bg-pastel-pink-100 text-pastel-pink-800 border-pastel-pink-200'
    }
    return colors[group as keyof typeof colors] || 'bg-muted text-muted-foreground border-border'
  }

  const getGroupLabel = (group: string) => {
    const labels = {
      carb: 'Carbohidratos',
      protein: 'Proteínas',
      fat: 'Grasas',
      vegfruit: 'Verduras/Frutas',
      treat: 'Extras'
    }
    return labels[group as keyof typeof labels] || group
  }

  return (
    <div className="space-y-4">
      {/* Selected Ingredients */}
      <div className="space-y-2">
        {selectedIngredients.map((ingredient, index) => (
          <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{ingredient.name}</span>
                {ingredients.find(ing => ing.name === ingredient.name) && (
                  <Badge className={`text-xs ${getGroupColor(ingredients.find(ing => ing.name === ingredient.name)!.group)}`}>
                    {getGroupLabel(ingredients.find(ing => ing.name === ingredient.name)!.group)}
                  </Badge>
                )}
              </div>
              <Input
                placeholder="Cantidad (ej: 200g, 1 taza, 2 cucharadas)"
                value={ingredient.amount}
                onChange={(e) => updateIngredientAmount(index, e.target.value)}
                className="mt-2"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeIngredient(index)}
              className="text-pastel-pink-600 hover:text-pastel-pink-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add Ingredient Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowSelector(!showSelector)}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Agregar Ingrediente
      </Button>

      {/* Ingredient Selector */}
      {showSelector && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar ingrediente o escribir uno nuevo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-20"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addManualIngredient()
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={addManualIngredient}
                  disabled={!searchTerm.trim()}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-4">Cargando ingredientes...</div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredIngredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => addIngredient(ingredient)}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{ingredient.name}</span>
                        <Badge className={`text-xs ${getGroupColor(ingredient.group)}`}>
                          {getGroupLabel(ingredient.group)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {ingredient.kcalPer100g} kcal/100g
                        </span>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {filteredIngredients.length === 0 && searchTerm && (
                    <div className="text-center py-4 text-gray-500">
                      <p>No se encontraron ingredientes con "{searchTerm}"</p>
                      <p className="text-sm mt-1">Presiona Enter o el botón + para agregarlo manualmente</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
