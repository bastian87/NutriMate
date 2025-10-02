import { useState, useEffect } from 'react'

export interface Ingredient {
  id: string
  name: string
  group: 'carb' | 'protein' | 'fat' | 'vegfruit' | 'treat'
  kcalPer100g: number
  locale?: string
}

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/ingredients')
        const data = await response.json()
        
        if (response.ok) {
          setIngredients(data.ingredients || [])
        } else {
          setError(data.error || 'Failed to load ingredients')
        }
      } catch (err) {
        setError('Failed to load ingredients')
        console.error('Error fetching ingredients:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchIngredients()
  }, [])

  return { ingredients, loading, error }
}
